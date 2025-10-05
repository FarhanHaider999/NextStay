import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User';
import type { StringValue } from 'ms'; // for proper expiresIn typing

// Make sure JWT_SECRET always has a string value
const JWT_SECRET: string = process.env.JWT_SECRET ?? 'fallback-secret-change-in-production';
// Cast env variable to StringValue to satisfy TypeScript
const JWT_EXPIRES_IN: StringValue = (process.env.JWT_EXPIRES_IN ?? '7d') as StringValue;

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token for user
 */
export const generateToken = (user: IUser): string => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
  };

  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Generate refresh token (longer expiry)
 */
export const generateRefreshToken = (user: IUser): string => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
  };

  const options: SignOptions = { expiresIn: '30d' as StringValue };
  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Verify a token and return its payload
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate token for email verification
 */
export const generateVerificationToken = (): string => {
  return jwt.sign({}, JWT_SECRET, { expiresIn: '24h' as StringValue });
};

/**
 * Generate token for password reset
 */
export const generateResetPasswordToken = (): string => {
  return jwt.sign({}, JWT_SECRET, { expiresIn: '1h' as StringValue });
};
