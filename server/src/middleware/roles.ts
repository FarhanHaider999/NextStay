import { Request, Response, NextFunction } from "express";

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: "Not authenticated" });

    if (!allowedRoles.includes(user.userType)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};
