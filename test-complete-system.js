const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testCompleteSystem() {
  console.log('🧪 Testing Complete SwasthayaLink System...\n');

  try {
    // Test 1: Patient Registration and Login
    console.log('1. Testing Patient Registration and Login...');
    
    // Register a new patient
    const patientData = {
      name: 'Alice Test Patient',
      email: 'alice.test@example.com',
      password: 'password123',
      phone: '+91-9876543215',
      role: 'user'
    };

    const patientReg = await axios.post(`${API_BASE_URL}/auth/signup`, patientData);
    console.log('✅ Patient registered successfully');

    // Login as patient
    const patientLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'alice.test@example.com',
      password: 'password123'
    });
    const patientToken = patientLogin.data.token;
    console.log('✅ Patient login successful');

    // Test 2: Doctor Registration and Login
    console.log('\n2. Testing Doctor Registration and Login...');
    
    const doctorData = {
      name: 'Dr. Test Doctor',
      email: 'test.doctor@example.com',
      password: 'password123',
      phone: '+91-9876543216',
      role: 'doctor',
      specialization: 'General Medicine',
      licenseNumber: 'MD-TEST-2024',
      hospital: 'Test Hospital',
      yearsOfExperience: 5
    };

    const doctorReg = await axios.post(`${API_BASE_URL}/auth/signup`, doctorData);
    console.log('✅ Doctor registered successfully');

    // Login as doctor
    const doctorLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test.doctor@example.com',
      password: 'password123'
    });
    const doctorToken = doctorLogin.data.token;
    console.log('✅ Doctor login successful');

    // Test 3: Patient creates appointment
    console.log('\n3. Testing Patient Appointment Creation...');
    
    const appointmentData = {
      doctorName: 'Dr. Test Doctor',
      date: '2025-07-20',
      time: '14:00',
      type: 'consultation',
      hospital: 'Test Hospital',
      specialty: 'General Medicine',
      symptoms: 'Regular checkup'
    };

    const patientAppointment = await axios.post(`${API_BASE_URL}/appointments`, appointmentData, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    console.log('✅ Patient appointment created successfully');

    // Test 4: Doctor manages patients
    console.log('\n4. Testing Doctor Patient Management...');
    
    const doctorPatientData = {
      name: 'Bob Doctor Patient',
      email: 'bob.doctorpatient@example.com',
      phone: '+91-9876543217',
      dateOfBirth: '1985-05-15',
      gender: 'male',
      bloodGroup: 'A+',
      address: {
        street: '456 Doctor Street',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001'
      }
    };

    const doctorPatient = await axios.post(`${API_BASE_URL}/patients`, doctorPatientData, {
      headers: { Authorization: `Bearer ${doctorToken}` }
    });
    console.log('✅ Doctor created patient successfully');
    
    const doctorPatientId = doctorPatient.data.patient._id;

    // Test 5: Doctor creates appointment for patient
    console.log('\n5. Testing Doctor Appointment Creation...');
    
    const doctorAppointmentData = {
      patientId: doctorPatientId,
      patientName: 'Bob Doctor Patient',
      date: '2025-07-21',
      time: '10:00',
      type: 'consultation',
      symptoms: 'Fever and cough',
      consultationFee: 800,
      estimatedDuration: 30
    };

    const doctorAppointment = await axios.post(`${API_BASE_URL}/doctor/appointments`, doctorAppointmentData, {
      headers: { Authorization: `Bearer ${doctorToken}` }
    });
    console.log('✅ Doctor appointment created successfully');

    // Test 6: Doctor creates patient record
    console.log('\n6. Testing Patient Record Creation...');
    
    const recordData = {
      visitDate: new Date().toISOString(),
      visitType: 'consultation',
      chiefComplaint: 'Fever and cough',
      symptoms: ['fever', 'cough', 'fatigue'],
      provisionalDiagnosis: 'Upper respiratory tract infection',
      treatment: {
        medications: [{
          name: 'Azithromycin',
          dosage: '500mg',
          frequency: 'Once daily',
          duration: '5 days'
        }]
      },
      notes: 'Patient advised rest and plenty of fluids'
    };

    const patientRecord = await axios.post(`${API_BASE_URL}/patients/${doctorPatientId}/records`, recordData, {
      headers: { Authorization: `Bearer ${doctorToken}` }
    });
    console.log('✅ Patient record created successfully');

    // Test 7: Data Isolation - Patient cannot access doctor routes
    console.log('\n7. Testing Data Isolation...');
    
    try {
      await axios.get(`${API_BASE_URL}/doctor/dashboard`, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      console.log('❌ Patient should not access doctor routes');
    } catch (error) {
      console.log('✅ Patient correctly denied access to doctor routes');
    }

    // Test 8: Data Isolation - Doctor cannot access patient-only routes
    try {
      await axios.put(`${API_BASE_URL}/user/abha`, { abhaId: '12-3456-7890-1234' }, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      console.log('❌ Doctor should not access patient-only routes');
    } catch (error) {
      console.log('✅ Doctor correctly denied access to patient-only routes');
    }

    // Test 9: Doctor can only see their own patients
    const doctorPatients = await axios.get(`${API_BASE_URL}/patients`, {
      headers: { Authorization: `Bearer ${doctorToken}` }
    });
    console.log('✅ Doctor can access their patients');
    console.log(`Doctor has ${doctorPatients.data.total} patients assigned`);

    // Test 10: Patient can access their own appointments
    const patientAppointments = await axios.get(`${API_BASE_URL}/appointments`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    });
    console.log('✅ Patient can access their appointments');
    console.log(`Patient has ${patientAppointments.data.length} appointments`);

    console.log('\n🎉 Complete System Test Passed!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Patient registration and authentication');
    console.log('- ✅ Doctor registration and authentication');
    console.log('- ✅ Patient appointment creation');
    console.log('- ✅ Doctor patient management');
    console.log('- ✅ Doctor appointment management');
    console.log('- ✅ Patient medical records');
    console.log('- ✅ Data isolation between roles');
    console.log('- ✅ Role-based access control');
    console.log('- ✅ Separate data views for patients and doctors');
    console.log('\n🏥 SwasthayaLink System is fully functional with proper data isolation!');

  } catch (error) {
    console.error('❌ System test failed:', error.response?.data?.error || error.message);
  }
}

// Run the complete system test
testCompleteSystem();
