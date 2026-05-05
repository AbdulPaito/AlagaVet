import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { User } from '../models';
import { protect } from '../middleware/auth';

const router = express.Router();

// Generate JWT
const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'fallbacksecret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id }, secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password, role } = req.body;

      // Check if user exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      // Create user
      const user = await User.create({
        email,
        password,
        role: role || 'user',
      });

      if (user) {
        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          token: generateToken(user._id.toString()),
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
          },
        });
      } else {
        res.status(400).json({ message: 'Invalid user data' });
      }
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').exists().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;

      // Find user with password
      const user = await User.findOne({ email }).select('+password');

      if (user && (await user.comparePassword(password))) {
        res.json({
          success: true,
          message: 'Login successful',
          token: generateToken(user._id.toString()),
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
          },
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        id: user?._id,
        email: user?.email,
        role: user?.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // TODO: Implement email sending for password reset
      // For now, just return success message
      res.json({
        success: true,
        message: 'Password reset instructions sent to email',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
