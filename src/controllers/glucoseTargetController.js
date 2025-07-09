const GlucoseTarget = require('../models/GlucoseTarget');
const HealthData = require('../models/HealthData');

// Get user's glucose targets
exports.getGlucoseTargets = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    let targets = await GlucoseTarget.findOne({ user: userId });
    
    // If no targets exist, create default ones
    if (!targets) {
      const defaultTargets = GlucoseTarget.getDefaultTargets();
      targets = new GlucoseTarget({
        user: userId,
        ...defaultTargets
      });
      await targets.save();
    }
    
    res.json(targets);
  } catch (err) {
    console.error('Get glucose targets error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update glucose targets
exports.updateGlucoseTargets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;
    
    // Validate target ranges
    if (updateData.fastingMin >= updateData.fastingMax ||
        updateData.postMealMin >= updateData.postMealMax ||
        updateData.randomMin >= updateData.randomMax) {
      return res.status(400).json({ error: 'Minimum values must be less than maximum values' });
    }
    
    let targets = await GlucoseTarget.findOne({ user: userId });
    
    if (!targets) {
      // Create new targets
      targets = new GlucoseTarget({
        user: userId,
        ...updateData
      });
    } else {
      // Update existing targets
      Object.assign(targets, updateData);
    }
    
    await targets.save();
    res.json({
      message: 'Glucose targets updated successfully',
      targets
    });
  } catch (err) {
    console.error('Update glucose targets error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get glucose analysis with target comparison
exports.getGlucoseAnalysis = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { days = 30 } = req.query;
    
    // Get user's targets
    const targets = await GlucoseTarget.findOne({ user: userId });
    if (!targets) {
      return res.status(404).json({ error: 'No glucose targets found' });
    }
    
    // Get glucose readings from the specified period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const glucoseReadings = await HealthData.find({
      user: userId,
      type: 'glucose',
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    // Analyze readings against targets
    const analysis = {
      totalReadings: glucoseReadings.length,
      withinTarget: 0,
      aboveTarget: 0,
      belowTarget: 0,
      averageGlucose: 0,
      readingsByType: {
        fasting: { total: 0, withinTarget: 0, average: 0 },
        post_meal: { total: 0, withinTarget: 0, average: 0 },
        random: { total: 0, withinTarget: 0, average: 0 }
      },
      recentTrend: 'stable', // 'improving', 'worsening', 'stable'
      recommendations: []
    };
    
    if (glucoseReadings.length > 0) {
      let totalGlucose = 0;
      const typeGroups = { fasting: [], post_meal: [], random: [] };
      
      glucoseReadings.forEach(reading => {
        const value = reading.value;
        const type = reading.type || 'random'; // Default to random if type not specified
        
        totalGlucose += value;
        
        // Group by type
        if (typeGroups[type]) {
          typeGroups[type].push(value);
        }
        
        // Check against targets
        if (targets.isWithinTarget(value, type)) {
          analysis.withinTarget++;
        } else {
          const targetRange = targets.getTargetRange(type);
          if (value > targetRange.max) {
            analysis.aboveTarget++;
          } else {
            analysis.belowTarget++;
          }
        }
      });
      
      analysis.averageGlucose = Math.round(totalGlucose / glucoseReadings.length);
      
      // Analyze by type
      Object.keys(typeGroups).forEach(type => {
        const readings = typeGroups[type];
        if (readings.length > 0) {
          analysis.readingsByType[type].total = readings.length;
          analysis.readingsByType[type].average = Math.round(
            readings.reduce((sum, val) => sum + val, 0) / readings.length
          );
          analysis.readingsByType[type].withinTarget = readings.filter(
            value => targets.isWithinTarget(value, type)
          ).length;
        }
      });
      
      // Calculate trend (simple comparison of first and last week averages)
      if (glucoseReadings.length >= 14) {
        const recentWeek = glucoseReadings.slice(0, 7);
        const previousWeek = glucoseReadings.slice(7, 14);
        
        const recentAvg = recentWeek.reduce((sum, r) => sum + r.value, 0) / recentWeek.length;
        const previousAvg = previousWeek.reduce((sum, r) => sum + r.value, 0) / previousWeek.length;
        
        const difference = recentAvg - previousAvg;
        if (difference > 5) {
          analysis.recentTrend = 'worsening';
        } else if (difference < -5) {
          analysis.recentTrend = 'improving';
        }
      }
      
      // Generate recommendations
      const withinTargetPercentage = (analysis.withinTarget / analysis.totalReadings) * 100;
      
      if (withinTargetPercentage < 70) {
        analysis.recommendations.push('Consider consulting with your healthcare provider about your glucose management plan');
      }
      
      if (analysis.aboveTarget > analysis.withinTarget) {
        analysis.recommendations.push('Focus on dietary modifications and regular exercise to help lower glucose levels');
      }
      
      if (analysis.recentTrend === 'worsening') {
        analysis.recommendations.push('Your recent glucose trend shows increasing levels - consider reviewing your recent lifestyle changes');
      }
      
      if (analysis.readingsByType.fasting.total > 0 && 
          analysis.readingsByType.fasting.withinTarget / analysis.readingsByType.fasting.total < 0.7) {
        analysis.recommendations.push('Your fasting glucose levels need attention - consider discussing medication timing with your doctor');
      }
    }
    
    res.json({
      targets,
      analysis,
      period: `${days} days`
    });
  } catch (err) {
    console.error('Get glucose analysis error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update reminder settings
exports.updateReminderSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { reminderEnabled, reminderTimes, reminderDays } = req.body;
    
    let targets = await GlucoseTarget.findOne({ user: userId });
    
    if (!targets) {
      return res.status(404).json({ error: 'No glucose targets found' });
    }
    
    targets.reminderEnabled = reminderEnabled;
    if (reminderTimes) targets.reminderTimes = reminderTimes;
    if (reminderDays) targets.reminderDays = reminderDays;
    
    await targets.save();
    
    res.json({
      message: 'Reminder settings updated successfully',
      targets
    });
  } catch (err) {
    console.error('Update reminder settings error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
