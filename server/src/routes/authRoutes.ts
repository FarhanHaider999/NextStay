import express, { Request, Response } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import User from "../models/User";
import { generateToken } from "../utils/jwt";
import { authenticate } from "../middleware/auth";
import {
  registerController,
  loginController,
  profileController,
} from "../controllers/authController";

const router = express.Router();
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// ------------------------
// Google OAuth Strategy
// ------------------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile: Profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) return done(null, user);

        const email = profile.emails?.[0]?.value;
        if (!email)
          return done(new Error("Google profile has no email"), undefined);

        user = await User.findOne({ email });

        if (user) {
          user.googleId = profile.id;
          user.avatar = profile.photos?.[0]?.value || null;
          user.emailVerified = true;
          await user.save();
          return done(null, user);
        }

        const newUser = new User({
          name: profile.displayName,
          email,
          googleId: profile.id,
          avatar: profile.photos?.[0]?.value || null,
          emailVerified: true,
          userType: "tenant",
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
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ------------------------
// Google OAuth callback
// ------------------------
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CLIENT_URL}/auth/signin?error=google_auth_failed`,
  }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const token = generateToken(user);

      res.redirect(`${CLIENT_URL}/auth/callback?token=${token}&success=true`);
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      res.redirect(`${CLIENT_URL}/auth/signin?error=google_auth_failed`);
    }
  }
);

// ------------------------
// Register
// ------------------------
router.post("/register", registerController);

// ------------------------
// Login
// ------------------------
router.post("/login", loginController);

// ------------------------
// Get current user profile
// ------------------------
router.get("/me", authenticate, profileController);

export default router;
