import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'smartcare_jwt_secret_super_secure_key_2026',
    { expiresIn: '30d' }
  );
};

// Helper to format safe user profile object for client responses
const formatUserResponse = (user) => ({
  id: user._id,
  _id: user._id,
  fullName: user.fullName || '',
  email: user.email || '',
  role: user.role || 'patient',
  phone: user.phone || '',
  age: user.age ?? null,
  dateOfBirth: user.dateOfBirth || '',
  gender: user.gender || '',
  state: user.state || 'Andhra Pradesh',
  district: user.district || '',
  city: user.city || '',
  village: user.village || '',
  address: user.address || '',
  pinCode: user.pinCode || '',
  bloodGroup: user.bloodGroup || '',
  emergencyContactName: user.emergencyContactName || '',
  emergencyContactPhone: user.emergencyContactPhone || '',
  avatar: user.avatar || '',
  isProfileComplete: Boolean(
    user.fullName &&
    user.phone &&
    (user.city || user.district || user.address) &&
    user.pinCode
  ),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password',
      });
    }

    const emailNormalized = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = await User.findOne({ email: emailNormalized });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Create user in MongoDB
    const user = await User.create({
      fullName: fullName.trim(),
      email: emailNormalized,
      password,
      phone: phone ? phone.trim() : '',
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Registration error in MongoDB:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const emailNormalized = email.toLowerCase().trim();

    // Find user by email in MongoDB
    const user = await User.findOne({ email: emailNormalized });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Login error in MongoDB:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me, GET /api/auth/profile
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({
      success: true,
      user: formatUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile, PATCH /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    // Strictly enforce authorization using token-derived identity
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      fullName,
      phone,
      age,
      dateOfBirth,
      gender,
      state,
      district,
      city,
      village,
      address,
      pinCode,
      bloodGroup,
      emergencyContactName,
      emergencyContactPhone,
      avatar,
    } = req.body;

    // 1. Full name validation
    if (fullName !== undefined) {
      const cleanName = fullName.toString().trim();
      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message: 'Full name cannot be empty',
        });
      }
      user.fullName = cleanName;
    }

    // 2. Mobile phone validation (10 digits if provided)
    if (phone !== undefined) {
      const cleanPhone = phone.toString().trim();
      if (cleanPhone && !/^\d{10}$/.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must be a valid 10-digit number',
        });
      }
      user.phone = cleanPhone;
    }

    // 3. Age validation
    if (age !== undefined) {
      if (age === '' || age === null) {
        user.age = null;
      } else {
        const numAge = Number(age);
        if (isNaN(numAge) || numAge < 0 || numAge > 130) {
          return res.status(400).json({
            success: false,
            message: 'Please provide a valid age between 0 and 130',
          });
        }
        user.age = numAge;
      }
    }

    // 4. Date of Birth
    if (dateOfBirth !== undefined) {
      user.dateOfBirth = dateOfBirth.toString().trim();
    }

    // 5. Gender validation
    if (gender !== undefined) {
      const allowedGenders = ['Male', 'Female', 'Other', 'Prefer not to say', ''];
      const cleanGender = gender.toString().trim();
      if (cleanGender && !allowedGenders.includes(cleanGender)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid gender selection',
        });
      }
      user.gender = cleanGender;
    }

    // 6. Address hierarchy
    if (state !== undefined) {
      user.state = state.toString().trim() || 'Andhra Pradesh';
    }
    if (district !== undefined) {
      user.district = district.toString().trim();
    }
    if (city !== undefined) {
      user.city = city.toString().trim();
    }
    if (village !== undefined) {
      user.village = village.toString().trim();
    }
    if (address !== undefined) {
      user.address = address.toString().trim();
    }

    // 7. PIN Code validation (6 digits if provided)
    if (pinCode !== undefined) {
      const cleanPin = pinCode.toString().trim();
      if (cleanPin && !/^\d{6}$/.test(cleanPin)) {
        return res.status(400).json({
          success: false,
          message: 'PIN code must be a valid 6-digit postal code',
        });
      }
      user.pinCode = cleanPin;
    }

    // 8. Blood group validation
    if (bloodGroup !== undefined) {
      const allowedBloods = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''];
      const cleanBlood = bloodGroup.toString().trim().toUpperCase();
      if (cleanBlood && !allowedBloods.includes(cleanBlood)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid blood group. Allowed: A+, A-, B+, B-, AB+, AB-, O+, O-',
        });
      }
      user.bloodGroup = cleanBlood;
    }

    // 9. Emergency contact
    if (emergencyContactName !== undefined) {
      user.emergencyContactName = emergencyContactName.toString().trim();
    }
    if (emergencyContactPhone !== undefined) {
      const cleanEmergencyPhone = emergencyContactPhone.toString().trim();
      if (cleanEmergencyPhone && !/^\d{10}$/.test(cleanEmergencyPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Emergency contact phone must be a valid 10-digit number',
        });
      }
      user.emergencyContactPhone = cleanEmergencyPhone;
    }

    // 10. Avatar / Profile Photo
    if (avatar !== undefined) {
      user.avatar = avatar.toString().trim();
    }

    // Check completion status
    user.isProfileComplete = Boolean(
      user.fullName &&
      user.phone &&
      (user.city || user.district || user.address) &&
      user.pinCode
    );

    const updated = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Patient profile updated successfully in MongoDB!',
      user: formatUserResponse(updated),
    });
  } catch (error) {
    console.error('Error updating patient profile:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error updating profile' });
  }
};
