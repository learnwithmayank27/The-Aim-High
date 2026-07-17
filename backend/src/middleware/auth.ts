import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import prisma from '../config/db';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export async function protect(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Please login.' });
    }

    const decoded = verifyToken(token);
    
    // Verify user still exists in database
    const userExists = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!userExists) {
      return res.status(401).json({ message: 'The user belonging to this token no longer exists.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token. Please login again.' });
  }
}

export function restrictTo(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
}
