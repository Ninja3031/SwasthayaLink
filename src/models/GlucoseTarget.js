const mongoose = require('mongoose');

const glucoseTargetSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  fastingMin: { 
    type: Number, 
    required: true,
    default: 70 
  },
  fastingMax: { 
    type: Number, 
    required: true,
    default: 100 
  },
  postMealMin: { 
    type: Number, 
    required: true,
    default: 70 
  },
  postMealMax: { 
    type: Number, 
    required: true,
    default: 140 
  },
  randomMin: { 
    type: Number, 
    required: true,
    default: 70 
  },
  randomMax: { 
    type: Number, 
    required: true,
    default: 125 
  },
  unit: { 
    type: String, 
    default: 'mg/dL',
    enum: ['mg/dL', 'mmol/L']
  },
  reminderEnabled: { 
    type: Boolean, 
    default: true 
  },
  reminderTimes: [{
    time: { type: String, required: true }, // Format: "HH:MM"
    type: { 
      type: String, 
      enum: ['fasting', 'post_meal', 'random'],
      required: true 
    },
    enabled: { type: Boolean, default: true }
  }],
  reminderDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  notes: { 
    type: String 
  },
  setByDoctor: { 
    type: Boolean, 
    default: false 
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
glucoseTargetSchema.index({ user: 1 });

// Method to check if a glucose reading is within target
glucoseTargetSchema.methods.isWithinTarget = function(value, type) {
  switch (type) {
    case 'fasting':
      return value >= this.fastingMin && value <= this.fastingMax;
    case 'post_meal':
      return value >= this.postMealMin && value <= this.postMealMax;
    case 'random':
      return value >= this.randomMin && value <= this.randomMax;
    default:
      return false;
  }
};

// Method to get target range for a specific type
glucoseTargetSchema.methods.getTargetRange = function(type) {
  switch (type) {
    case 'fasting':
      return { min: this.fastingMin, max: this.fastingMax };
    case 'post_meal':
      return { min: this.postMealMin, max: this.postMealMax };
    case 'random':
      return { min: this.randomMin, max: this.randomMax };
    default:
      return { min: 0, max: 0 };
  }
};

// Static method to get default targets
glucoseTargetSchema.statics.getDefaultTargets = function() {
  return {
    fastingMin: 70,
    fastingMax: 100,
    postMealMin: 70,
    postMealMax: 140,
    randomMin: 70,
    randomMax: 125,
    unit: 'mg/dL',
    reminderEnabled: true,
    reminderTimes: [
      { time: '08:00', type: 'fasting', enabled: true },
      { time: '14:00', type: 'post_meal', enabled: true },
      { time: '20:00', type: 'random', enabled: true }
    ],
    reminderDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  };
};

module.exports = mongoose.model('GlucoseTarget', glucoseTargetSchema);
