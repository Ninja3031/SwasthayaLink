const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      abhaId,
      role,
      // Doctor-specific fields
      specialization,
      licenseNumber,
      hospital,
      yearsOfExperience,
      consultationFee,
      qualifications,
      languages,
      // Common fields
      dateOfBirth,
      gender,
      bloodGroup,
      emergencyContact,
      address
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Validate role
    const validRoles = ['user', 'doctor'];
    const userRole = role && validRoles.includes(role) ? role : 'user';

    // Validate ABHA ID if provided
    if (abhaId && !/^\d{14}$/.test(abhaId)) {
      return res.status(400).json({ error: 'ABHA ID must be exactly 14 digits.' });
    }

    // Additional validation for doctors
    if (userRole === 'doctor') {
      if (!specialization || !licenseNumber || !hospital) {
        return res.status(400).json({
          error: 'Specialization, license number, and hospital are required for doctors.'
        });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use.' });
    }

    // Check for duplicate ABHA ID if provided
    if (abhaId) {
      const existingAbhaUser = await User.findOne({ abhaId });
      if (existingAbhaUser) {
        return res.status(400).json({ error: 'ABHA ID already in use.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object with role-specific fields
    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      abhaId,
      role: userRole,
      dateOfBirth,
      gender,
      bloodGroup,
      emergencyContact,
      address
    };

    // Add doctor-specific fields if role is doctor
    if (userRole === 'doctor') {
      userData.specialization = specialization;
      userData.licenseNumber = licenseNumber;
      userData.hospital = hospital;
      userData.yearsOfExperience = yearsOfExperience || 0;
      userData.consultationFee = consultationFee || 500;
      userData.qualifications = qualifications || [];
      userData.languages = languages || ['English'];
      userData.availableSlots = [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      ];
    }

    const user = new User(userData);
    await user.save();

    // Generate JWT token for the new user
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Return token and user data (matching frontend AuthResponse interface)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.role,
      abhaId: user.abhaId,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      bloodGroup: user.bloodGroup,
      emergencyContact: user.emergencyContact,
      photo: user.photo
    };

    // Add doctor-specific fields to response if user is a doctor
    if (user.role === 'doctor') {
      userResponse.specialization = user.specialization;
      userResponse.licenseNumber = user.licenseNumber;
      userResponse.hospital = user.hospital;
      userResponse.yearsOfExperience = user.yearsOfExperience;
      userResponse.consultationFee = user.consultationFee;
      userResponse.qualifications = user.qualifications;
      userResponse.languages = user.languages;
      userResponse.availableSlots = user.availableSlots;
      userResponse.isVerified = user.isVerified;
    }

    res.status(201).json({
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Prepare user response with common fields
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.role,
      abhaId: user.abhaId,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      bloodGroup: user.bloodGroup,
      emergencyContact: user.emergencyContact,
      photo: user.photo
    };

    // Add doctor-specific fields to response if user is a doctor
    if (user.role === 'doctor') {
      userResponse.specialization = user.specialization;
      userResponse.licenseNumber = user.licenseNumber;
      userResponse.hospital = user.hospital;
      userResponse.yearsOfExperience = user.yearsOfExperience;
      userResponse.consultationFee = user.consultationFee;
      userResponse.qualifications = user.qualifications;
      userResponse.languages = user.languages;
      userResponse.availableSlots = user.availableSlots;
      userResponse.isVerified = user.isVerified;
    }

    res.json({ token, user: userResponse });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};