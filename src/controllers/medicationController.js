const Medication = require('../models/Medication');

// Get all medications for a user
exports.getMedications = async (req, res) => {
  try {
    const medications = await Medication.find({ 
      user: req.user.userId,
      isActive: true 
    }).sort({ createdAt: -1 });
    res.json(medications);
  } catch (err) {
    console.error('Get medications error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add a new medication
exports.addMedication = async (req, res) => {
  try {
    const medicationData = {
      ...req.body,
      user: req.user.userId
    };
    
    const medication = new Medication(medicationData);
    await medication.save();
    res.status(201).json(medication);
  } catch (err) {
    console.error('Add medication error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update medication
exports.updateMedication = async (req, res) => {
  try {
    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );
    
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    
    res.json(medication);
  } catch (err) {
    console.error('Update medication error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete medication (soft delete)
exports.deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { isActive: false },
      { new: true }
    );
    
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    
    res.json({ message: 'Medication deleted successfully' });
  } catch (err) {
    console.error('Delete medication error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark medication as taken
exports.markMedicationTaken = async (req, res) => {
  try {
    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { 
        taken: true,
        lastTaken: new Date()
      },
      { new: true }
    );
    
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    
    res.json(medication);
  } catch (err) {
    console.error('Mark medication taken error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
