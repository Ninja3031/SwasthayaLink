const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  startTime: { 
    type: String, 
    required: true 
  },
  endTime: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: Number, 
    default: 30 // minutes
  },
  status: { 
    type: String, 
    enum: ['available', 'booked', 'cancelled', 'blocked'], 
    default: 'available' 
  },
  isRecurring: { 
    type: Boolean, 
    default: false 
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: function() { return this.isRecurring; }
  },
  recurringEndDate: {
    type: Date,
    required: function() { return this.isRecurring; }
  },
  appointmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment' 
  },
  notes: { 
    type: String 
  },
  maxPatients: { 
    type: Number, 
    default: 1 
  },
  bookedPatients: { 
    type: Number, 
    default: 0 
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
timeSlotSchema.index({ doctorId: 1, date: 1, startTime: 1 });
timeSlotSchema.index({ doctorId: 1, status: 1 });

// Virtual for formatted time display
timeSlotSchema.virtual('timeDisplay').get(function() {
  return `${this.startTime} - ${this.endTime}`;
});

// Method to check if slot is available
timeSlotSchema.methods.isAvailable = function() {
  return this.status === 'available' && this.bookedPatients < this.maxPatients;
};

// Method to book the slot
timeSlotSchema.methods.book = function(appointmentId) {
  if (this.isAvailable()) {
    this.bookedPatients += 1;
    if (this.bookedPatients >= this.maxPatients) {
      this.status = 'booked';
    }
    this.appointmentId = appointmentId;
    return this.save();
  }
  throw new Error('Slot is not available');
};

// Method to cancel booking
timeSlotSchema.methods.cancelBooking = function() {
  if (this.status === 'booked' || this.bookedPatients > 0) {
    this.bookedPatients = Math.max(0, this.bookedPatients - 1);
    if (this.bookedPatients === 0) {
      this.status = 'available';
    }
    this.appointmentId = null;
    return this.save();
  }
  throw new Error('No booking to cancel');
};

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
