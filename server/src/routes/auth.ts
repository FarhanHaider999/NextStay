import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import User, { IUser } from '../models/User';
import { generateToken } from '../utils/jwt';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// ------------------------
// Google OAuth Strategy
// ------------------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile: Profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) return done(null, user);

        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('Google profile has no email'), undefined);

        user = await User.findOne({ email });

        if (user) {
          user.googleId = profile.id;
          user.avatar = profile.photos?.[0]?.value || null;
          user.emailVerified = true;
          await user.save();
          return done(null, user);
        }

        // Create new user
        const newUser = new User({
          name: profile.displayName,
          email,
          googleId: profile.id,
          avatar: profile.photos?.[0]?.value || null,
          emailVerified: true,
        });

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

// ------------------------
// Start Google OAuth login
// ------------------------
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// ------------------------
// Google OAuth callback
// ------------------------
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${CLIENT_URL}/auth/signin?error=google_auth_failed` }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as IUser;
      const token = generateToken(user);

      res.redirect(`${CLIENT_URL}/auth/callback?token=${token}&success=true`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${CLIENT_URL}/auth/signin?error=google_auth_failed`);
    }
  }
);

// ------------------------
// Register
// ------------------------
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
    });

    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      data: {
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          emailVerified: newUser.emailVerified,
          createdAt: newUser.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ------------------------
// Login
// ------------------------
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);

    res.status(200).json({
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ------------------------
// Get current user profile
// ------------------------
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
