import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { LivePlatform } from '../utils/enums';

export async function createLiveClass(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { title, platform, meetingId, link, scheduledTime, durationMins, subjectId } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const faculty = await prisma.facultyProfile.findUnique({
      where: { userId: req.user.userId },
    });
    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty members can schedule live classes.' });
    }

    const live = await prisma.liveClass.create({
      data: {
        title,
        platform: platform as LivePlatform,
        meetingId,
        link,
        scheduledTime: new Date(scheduledTime),
        durationMins: parseInt(durationMins) || 60,
        subjectId,
        facultyId: faculty.id,
      },
    });

    return res.status(201).json(live);
  } catch (err) {
    next(err);
  }
}

export async function getLiveClasses(req: Request, res: Response, next: NextFunction) {
  try {
    const { subjectId } = req.query;
    const lives = await prisma.liveClass.findMany({
      where: {
        subjectId: subjectId ? String(subjectId) : undefined,
        scheduledTime: {
          gte: new Date(Date.now() - 2 * 60 * 60 * 1000), // Show classes starting within the last 2 hours or in the future
        },
      },
      include: {
        faculty: { include: { user: true } },
        subject: { include: { course: true } },
      },
      orderBy: { scheduledTime: 'asc' },
    });

    return res.json(lives);
  } catch (err) {
    next(err);
  }
}
