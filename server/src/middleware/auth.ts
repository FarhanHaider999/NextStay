import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User, { IUser } from '../models/User';

// Extend Express Request to include your IUser
// declare global {
//   namespace Express {
//     interface Request {
//       user?: IUser;
//     }
//   }
// }

// ------------------------
// Authenticate Middleware
// ------------------------
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.substring(7);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token is not valid.',
    });
  }
};

// ------------------------
// Optional Authentication Middleware
// ------------------------
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);
        if (user) req.user = user;
      } catch {
        console.log('Optional auth: Invalid token');
      }
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next();
  }
};

// ------------------------
// Admin Authentication Middleware
// ------------------------
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Cast req.user to IUser (TypeScript-safe)
    const user = req.user as IUser;

    if (user.email === process.env.ADMIN_EMAIL) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Admin access required.',
      });
    }
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};
