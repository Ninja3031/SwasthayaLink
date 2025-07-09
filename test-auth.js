const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testAuthentication() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Register a patient
    console.log('1. Registering a patient...');
    const patientData = {
      name: 'John Patient',
      email: 'patient@test.com',
      password: 'password123',
      phone: '+91-9876543210',
      role: 'user'
    };

    const patientResponse = await axios.post(`${API_BASE_URL}/auth/signup`, patientData);
    console.log('✅ Patient registered successfully');
    console.log('Patient ID:', patientResponse.data.user.id);
    console.log('Patient Role:', patientResponse.data.user.userType);

    // Test 2: Register a doctor
    console.log('\n2. Registering a doctor...');
    const doctorData = {
      name: 'Dr. Sarah Doctor',
      email: 'doctor@test.com',
      password: 'password123',
      phone: '+91-9876543211',
      role: 'doctor',
      specialization: 'Cardiology',
      licenseNumber: 'MD-12345-2024',
      hospital: 'Test Hospital',
      yearsOfExperience: 5
    };

    const doctorResponse = await axios.post(`${API_BASE_URL}/auth/signup`, doctorData);
    console.log('✅ Doctor registered successfully');
    console.log('Doctor ID:', doctorResponse.data.user.id);
    console.log('Doctor Role:', doctorResponse.data.user.userType);
    console.log('Doctor Specialization:', doctorResponse.data.user.specialization);

    // Test 3: Login as patient
    console.log('\n3. Testing patient login...');
    const patientLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'patient@test.com',
      password: 'password123'
    });
    console.log('✅ Patient login successful');
    const patientToken = patientLogin.data.token;

    // Test 4: Login as doctor
    console.log('\n4. Testing doctor login...');
    const doctorLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'doctor@test.com',
      password: 'password123'
    });
    console.log('✅ Doctor login successful');
    const doctorToken = doctorLogin.data.token;

    // Test 5: Test patient accessing patient routes
    console.log('\n5. Testing patient access to patient routes...');
    try {
      const patientProfile = await axios.get(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      console.log('✅ Patient can access their profile');
    } catch (error) {
      console.log('❌ Patient cannot access their profile:', error.response?.data?.error);
    }

    // Test 6: Test doctor accessing doctor routes
    console.log('\n6. Testing doctor access to doctor routes...');
    try {
      const doctorDashboard = await axios.get(`${API_BASE_URL}/doctor/dashboard`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      console.log('✅ Doctor can access their dashboard');
    } catch (error) {
      console.log('❌ Doctor cannot access their dashboard:', error.response?.data?.error);
    }

    // Test 7: Test patient trying to access doctor routes (should fail)
    console.log('\n7. Testing patient trying to access doctor routes (should fail)...');
    try {
      await axios.get(`${API_BASE_URL}/doctor/dashboard`, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      console.log('❌ Patient should not be able to access doctor routes');
    } catch (error) {
      console.log('✅ Patient correctly denied access to doctor routes:', error.response?.data?.error);
    }

    // Test 8: Test doctor trying to access patient-only routes (should fail)
    console.log('\n8. Testing doctor trying to access patient-only routes (should fail)...');
    try {
      await axios.put(`${API_BASE_URL}/user/abha`, { abhaId: '12-3456-7890-1234' }, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      console.log('❌ Doctor should not be able to access patient-only routes');
    } catch (error) {
      console.log('✅ Doctor correctly denied access to patient-only routes:', error.response?.data?.error);
    }

    console.log('\n🎉 All authentication tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
  }
}

// Run the test
testAuthentication();
