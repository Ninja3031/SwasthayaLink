const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Transform the user object to match frontend expectations
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
      photo: user.photo,
      address: user.address,
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

    res.json(userResponse);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.linkAbhaId = async (req, res) => {
  try {
    const { abhaId } = req.body;
    if (!abhaId) return res.status(400).json({ error: 'abhaId is required' });
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { abhaId },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'ABHA ID linked successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}; 