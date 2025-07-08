const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Medication = require('../models/Medication');
const Appointment = require('../models/Appointment');

async function addSampleData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      console.log(`Adding sample data for user: ${user.name} (${user.email})`);

      // Add sample medications for each user
      const sampleMedications = [
        {
          user: user._id,
          name: `Medication-${user.name.split(' ')[0]}-1`,
          dosage: '500mg',
          frequency: 'Twice daily',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-01'),
          timeOfDay: ['08:00', '20:00'],
          instructions: 'Take with meals',
          prescribedBy: 'Dr. Smith',
          pharmacyStatus: 'ready',
          refillsRemaining: 2,
        },
        {
          user: user._id,
          name: `Medication-${user.name.split(' ')[0]}-2`,
          dosage: '10mg',
          frequency: 'Once daily',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          timeOfDay: ['09:00'],
          instructions: 'Take in the morning',
          prescribedBy: 'Dr. Johnson',
          pharmacyStatus: 'delivered',
          refillsRemaining: 5,
        },
      ];

      // Add sample appointments for each user
      const sampleAppointments = [
        {
          user: user._id,
          doctorName: `Dr. ${user.name.split(' ')[0]}-Doctor-1`,
          patientName: user.name,
          date: new Date('2024-02-15'),
          time: '10:00',
          type: 'follow-up',
          status: 'confirmed',
          hospital: 'City Hospital',
          specialty: 'Cardiology',
          consultationFee: 800,
          estimatedDuration: 30,
          symptoms: 'Regular checkup',
        },
        {
          user: user._id,
          doctorName: `Dr. ${user.name.split(' ')[0]}-Doctor-2`,
          patientName: user.name,
          date: new Date('2024-02-20'),
          time: '14:30',
          type: 'consultation',
          status: 'scheduled',
          hospital: 'Metro Medical',
          specialty: 'Endocrinology',
          consultationFee: 600,
          estimatedDuration: 45,
          symptoms: 'Diabetes consultation',
        },
      ];

      // Clear existing data for this user
      await Medication.deleteMany({ user: user._id });
      await Appointment.deleteMany({ user: user._id });

      // Insert new sample data
      await Medication.insertMany(sampleMedications);
      await Appointment.insertMany(sampleAppointments);

      console.log(`Added ${sampleMedications.length} medications and ${sampleAppointments.length} appointments for ${user.name}`);
    }

    console.log('Sample data added successfully!');
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addSampleData();
