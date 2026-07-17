import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { AttendanceStatus, FeeStatus } from '../utils/enums';

export async function getDashboardStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const { role, userId } = req.user;

    if (role === 'ADMIN') {
      const studentCount = await prisma.studentProfile.count();
      const facultyCount = await prisma.facultyProfile.count();
      const courseCount = await prisma.course.count();
      const subjectCount = await prisma.subject.count();

      const feeStats = await prisma.feeReceipt.groupBy({
        by: ['status'],
        _sum: { amount: true },
      });

      const collectedFees = feeStats.find((f) => f.status === FeeStatus.PAID)?._sum.amount || 0;
      const pendingFees = feeStats.find((f) => f.status === FeeStatus.PENDING)?._sum.amount || 0;

      const recentNotices = await prisma.notice.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      const recentStudents = await prisma.studentProfile.findMany({
        take: 5,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { id: 'desc' },
      });

      return res.json({
        role,
        stats: {
          studentCount,
          facultyCount,
          courseCount,
          subjectCount,
          collectedFees,
          pendingFees,
        },
        recentNotices,
        recentStudents,
      });
    }

    if (role === 'FACULTY') {
      const faculty = await prisma.facultyProfile.findUnique({ where: { userId } });
      if (!faculty) return res.status(404).json({ message: 'Faculty profile not found' });

      const homeworkCount = await prisma.homework.count({ where: { facultyId: faculty.id } });
      const liveCount = await prisma.liveClass.count({ where: { facultyId: faculty.id } });
      const attendanceCount = await prisma.attendance.count({ where: { takenById: faculty.id } });

      const pendingGrading = await prisma.homeworkSubmission.count({
        where: {
          homework: { facultyId: faculty.id },
          status: 'SUBMITTED',
        },
      });

      const upcomingLive = await prisma.liveClass.findMany({
        where: {
          facultyId: faculty.id,
          scheduledTime: { gte: new Date() },
        },
        include: { subject: true },
        orderBy: { scheduledTime: 'asc' },
        take: 5,
      });

      return res.json({
        role,
        stats: {
          homeworkCount,
          liveCount,
          attendanceCount,
          pendingGrading,
        },
        upcomingLive,
      });
    }

    if (role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId },
        include: { user: true },
      });
      if (!student) return res.status(404).json({ message: 'Student profile not found' });

      // Fetch upcoming live classes for student's class
      const upcomingLive = await prisma.liveClass.findMany({
        where: {
          subject: {
            course: {
              className: student.className,
              board: student.board,
            },
          },
          scheduledTime: { gte: new Date() },
        },
        include: { subject: true, faculty: { include: { user: true } } },
        orderBy: { scheduledTime: 'asc' },
        take: 5,
      });

      // Attendance Summary
      const attendance = await prisma.attendance.findMany({ where: { studentId: student.id } });
      const present = attendance.filter((a) => a.status === AttendanceStatus.PRESENT).length;
      const late = attendance.filter((a) => a.status === AttendanceStatus.LATE).length;
      const totalDays = attendance.length;
      const attendanceRate = totalDays > 0 ? ((present + late) / totalDays) * 100 : 0;

      // Homework submissions pending vs total
      const totalHomework = await prisma.homework.count({
        where: {
          subject: {
            course: {
              className: student.className,
              board: student.board,
            },
          },
        },
      });
      const submittedHomework = await prisma.homeworkSubmission.count({
        where: { studentId: student.id },
      });

      // Latest results
      const latestResults = await prisma.result.findMany({
        where: { studentId: student.id },
        include: { subject: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
      });

      // Pending fees
      const pendingFeesList = await prisma.feeReceipt.findMany({
        where: { studentId: student.id, status: FeeStatus.PENDING },
      });
      const pendingFeesAmount = pendingFeesList.reduce((acc, f) => acc + f.amount, 0);

      return res.json({
        role,
        profile: student,
        stats: {
          attendanceRate: Math.round(attendanceRate * 100) / 100,
          pendingHomework: totalHomework - submittedHomework,
          pendingFeesAmount,
        },
        upcomingLive,
        latestResults,
      });
    }

    if (role === 'PARENT') {
      const parent = await prisma.parentProfile.findUnique({
        where: { userId },
        include: { students: { include: { user: true } } },
      });
      if (!parent) return res.status(404).json({ message: 'Parent profile not found' });

      // If parent has students, fetch the first student details
      const student = parent.students[0];
      if (!student) {
        return res.json({ role, stats: null, message: 'No linked student profiles found.' });
      }

      // First student attendance
      const attendance = await prisma.attendance.findMany({ where: { studentId: student.id } });
      const present = attendance.filter((a) => a.status === AttendanceStatus.PRESENT).length;
      const late = attendance.filter((a) => a.status === AttendanceStatus.LATE).length;
      const attendanceRate = attendance.length > 0 ? ((present + late) / attendance.length) * 100 : 0;

      // First student results
      const results = await prisma.result.findMany({
        where: { studentId: student.id },
        include: { subject: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      // First student pending fees
      const pendingFees = await prisma.feeReceipt.findMany({
        where: { studentId: student.id, status: FeeStatus.PENDING },
      });

      const notices = await prisma.notice.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
      });

      return res.json({
        role,
        studentName: student.user.name,
        stats: {
          attendanceRate: Math.round(attendanceRate * 100) / 100,
          pendingFeesCount: pendingFees.length,
          latestResultPercentage: results.length > 0 ? Math.round((results[0].marksObtained / results[0].totalMarks) * 100) : 0,
        },
        results,
        pendingFees,
        notices,
      });
    }

    return res.status(400).json({ message: 'Invalid role for statistics.' });
  } catch (err) {
    next(err);
  }
}
