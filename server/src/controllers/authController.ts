import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/User";
import { generateToken } from "../utils/jwt";

// ------------------------
// Register Controller
// ------------------------
export const registerController = async (req: Request, res: Response) => {
  try {
    const { name, email, password, userType } = req.body;

    if (userType && !["tenant", "manager"].includes(userType)) {
      return res.status(400).json({ message: "Invalid user type" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
      userType: userType || "tenant",
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
          userType: newUser.userType,
          createdAt: newUser.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------
// Login Controller
// ------------------------
export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.status(200).json({
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          avatar: user.avatar,
          userType: user.userType,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------------
// Profile Controller
// ------------------------
export const profileController = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser | undefined;
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          avatar: user.avatar,
          userType: user.userType,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
