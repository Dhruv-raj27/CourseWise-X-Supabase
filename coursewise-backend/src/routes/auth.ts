import express, { Request, Response, Router } from 'express';
import { validationResult, body } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User, { IUser } from '../models/User';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';

const router: Router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Utility function to generate JWT
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
};

// ✅ **Register a New User**
router.post(
  '/signup',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('institution').notEmpty().withMessage('Institution is required'),
    body('branch').notEmpty().withMessage('Branch is required'),
    body('semester').isNumeric().withMessage('Semester must be a number'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { name, email, password, institution, branch, semester } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        institution,
        branch,
        semester,
        isVerified: false,
        verificationToken,
        verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      await user.save();
      
      try {
        await sendVerificationEmail(email, verificationToken);
        console.log('Verification email sent to:', email);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail the signup if email fails
      }

      res.status(201).json({
        message: 'User created successfully. Please check your email for verification.',
        verificationToken // Include this only in development
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
  [body('email').isEmail().withMessage('Valid email is required'), body('password').exists().withMessage('Password is required')],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }) as IUser;
      if (!user || !user.password) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      if (!user.isVerified) {
        res.status(403).json({ message: 'Email not verified. Please check your email.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      const token = generateToken(user._id.toString());

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          institution: user.institution,
          branch: user.branch,
          semester: user.semester,
        },
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
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(400).json({ message: 'Invalid token' });
      return;
    }

    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name, profilePicture: picture, googleId, isVerified: true });
      await user.save();
    }

    const sessionToken = generateToken(user._id.toString());

    res.json({ token: sessionToken, user: { id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture } });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

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

export default router;
