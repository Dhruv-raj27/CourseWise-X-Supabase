import express, { Request, Response, Router } from 'express';
import { validationResult, body } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import mongoose from 'mongoose';
import User, { IUser } from '../models/User';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import axios from 'axios';

const router: Router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Utility function to generate JWT
const generateToken = (userId: mongoose.Types.ObjectId): string => {
  return jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
};

// ✅ **Register a New User**
router.post(
  '/signup',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { name, email, password, phone } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email }).exec();
      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new user with empty dashboard
      const user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        isVerified: true, // No email verification needed
        selectedCourses: [] // Empty dashboard
      });

      await user.save();
      console.log('User created:', {
        email: user.email,
        name: user.name,
        id: user._id
      });

      // Generate token for immediate login
      const token = generateToken(user._id);

      res.status(201).json({
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
      res.status(500).json({ message: 'Server error during signup' });
    }
  }
);

// ✅ **Login User**
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').exists().withMessage('Password is required')
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).exec();
      if (!user || !user.password) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      const token = generateToken(user._id);

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// ✅ **Email Verification**
router.get('/verify-email/:token', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({ verificationToken: token, verificationTokenExpires: { $gt: Date.now() } });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired verification token' });
      return;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ **Google Sign-In**
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const userInfo = userInfoResponse.data;
    if (!userInfo.email) {
      res.status(400).json({ message: 'Email not provided by Google' });
      return;
    }

    // Find or create user
    let user = await User.findOne({ email: userInfo.email }).exec();
    if (!user) {
      user = new User({
        email: userInfo.email,
        name: userInfo.name,
        profilePicture: userInfo.picture,
        googleId: userInfo.sub,
        isVerified: true,
        selectedCourses: [] // Empty dashboard
      });
      await user.save();
      console.log("Created new Google user:", user.email);
    }

    // Generate JWT token
    const sessionToken = generateToken(user._id);

    // Check if user needs to set a password
    const needsPassword = !user.password;

    res.json({
      token: sessionToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        needsPassword
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

// ✅ **Set Password for Google User**
router.post(
  '/set-password',
  [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { userId, password } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();

      res.json({ message: 'Password set successfully' });
    } catch (error) {
      console.error('Set password error:', error);
      res.status(500).json({ message: 'Server error while setting password' });
    }
  }
);

// Manual verification endpoint (for testing)
router.post('/verify-email-manual', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Manual verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ **Complete Profile and Set Password**
router.post(
  '/complete-profile',
  [
    body('institution').notEmpty().withMessage('Institution is required'),
    body('branch').notEmpty().withMessage('Branch is required'),
    body('semester').notEmpty().withMessage('Semester is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { userId, institution, branch, semester, password } = req.body;

      const user = await User.findById(userId).exec();
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Hash password if provided
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }

      // Update user profile
      user.institution = institution;
      user.branch = branch;
      user.semester = semester;
      await user.save();

      res.json({ 
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
      res.status(500).json({ message: 'Server error while completing profile' });
    }
  }
);

export default router; 
