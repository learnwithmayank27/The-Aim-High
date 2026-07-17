import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { generateToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../middleware/auth';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name, role, phone, className, board, rollNumber, relation, address, qualification, experience, subjects, biography } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ message: 'Email, password, name, and role are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
          phone,
        },
      });

      if (role === 'STUDENT') {
        if (!className || !board || !rollNumber) {
          throw new Error('Class name, board, and roll number are required for students.');
        }
        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            className,
            board,
            rollNumber,
          },
        });
      } else if (role === 'PARENT') {
        if (!relation || !address) {
          throw new Error('Relation and address are required for parents.');
        }
        await tx.parentProfile.create({
          data: {
            userId: newUser.id,
            relation,
            address,
          },
        });
      } else if (role === 'FACULTY') {
        if (!qualification || !experience || !subjects || !biography) {
          throw new Error('Qualification, experience, subjects, and biography are required for faculty.');
        }
        await tx.facultyProfile.create({
          data: {
            userId: newUser.id,
            qualification,
            experience,
            subjects,
            biography,
            achievements: '[]',
          },
        });
      }

      return newUser;
    });

    const token = generateToken({ userId: user.id, role: user.role, email: user.email });

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message || 'Registration failed' });
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken({ userId: user.id, role: user.role, email: user.email });

    return res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function googleLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, name, googleToken } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required from Google.' });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create user as a student by default if registering via Google
      const randomPassword = Math.random().toString(36).substring(2, 10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const randomRoll = 'AH-G-' + Math.floor(1000 + Math.random() * 9000);

      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            role: 'STUDENT',
          },
        });

        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            className: 'Class 10', // default
            board: 'CBSE', // default
            rollNumber: randomRoll,
          },
        });

        return newUser;
      });
    }

    const token = generateToken({ userId: user.id, role: user.role, email: user.email });

    return res.json({
      message: 'Google login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        studentProfile: {
          include: {
            parent: { include: { user: true } },
          },
        },
        facultyProfile: true,
        parentProfile: {
          include: {
            students: { include: { user: true } },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Hide password
    (user as any).password = undefined;

    return res.json({ user });
  } catch (err) {
    next(err);
  }
}
