import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { AttendanceStatus } from '../utils/enums';

export async function takeAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { studentId, date, status } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const faculty = await prisma.facultyProfile.findUnique({
      where: { userId: req.user.userId },
    });
    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty members can take attendance.' });
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId,
          date: new Date(date),
        },
      },
      update: { status: status as AttendanceStatus, takenById: faculty.id },
      create: {
        studentId,
        date: new Date(date),
        status: status as AttendanceStatus,
        takenById: faculty.id,
      },
    });

    return res.status(201).json(attendance);
  } catch (err) {
    next(err);
  }
}

export async function getStudentAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { studentId } = req.params;
    const records = await prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
    });

    // Compute monthly stats
    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const lateDays = records.filter((r) => r.status === AttendanceStatus.LATE).length;
    
    // Late counts as half presence or we track it separately
    const attendancePercentage = totalDays > 0 ? ((presentDays + lateDays) / totalDays) * 100 : 0;

    return res.json({
      records,
      stats: {
        totalDays,
        presentDays,
        lateDays,
        absentDays: totalDays - (presentDays + lateDays),
        percentage: Math.round(attendancePercentage * 100) / 100,
      },
    });
  } catch (err) {
    next(err);
  }
}
