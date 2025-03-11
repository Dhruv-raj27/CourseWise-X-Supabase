import express from 'express';
import { validationResult, body } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import mongoose from 'mongoose';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId: mongoose.Types.ObjectId | string): string => {
  const userIdStr = userId.toString();
  return jwt.sign({ userId: userIdStr }, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: '24h'
  });
};

// Signup route
router.post('/signup', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user with empty dashboard
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      isVerified: true,
      selectedCourses: []
    });

    await user.save();
    // Generate token for immediate login
    const token = generateToken(user._id);

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login route
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// Google login/signup
router.post('/google', [], async (req, res) => {
  try {
    const { token, userInfo } = req.body;

    if (!userInfo || !userInfo.email) {
      return res.status(400).json({ message: 'Invalid user info' });
    }

    // Check if user exists
    let user = await User.findOne({ email: userInfo.email });
    
    if (!user) {
      // Create new user
      user = await User.create({
        email: userInfo.email,
        name: userInfo.name,
        profilePicture: userInfo.picture,
        googleId: userInfo.sub,
        isVerified: true
      });
    }

    const authToken = generateToken(user._id);

    return res.json({
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ message: 'Authentication failed' });
  }
});

// Complete profile
router.post('/complete-profile', [
  body('institution').notEmpty().withMessage('Institution is required'),
  body('branch').notEmpty().withMessage('Branch is required'),
  body('semester').notEmpty().withMessage('Semester is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, institution, branch, semester, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    user.institution = institution;
    user.branch = branch;
    user.semester = semester;
    await user.save();

    return res.json({ 
      message: 'Profile completed successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        institution: user.institution,
        branch: user.branch,
        semester: user.semester
      }
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    return res.status(500).json({ message: 'Server error while completing profile' });
  }
});

export default router; 
