import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { uploadToCloudinaryOrLocal } from '../utils/fileUpload';
import { HomeworkStatus } from '../utils/enums';

export async function createHomework(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { title, instructions, dueDate, subjectId } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const faculty = await prisma.facultyProfile.findUnique({
      where: { userId: req.user.userId },
    });
    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty members can create homework assignments.' });
    }

    let fileUrl = '';
    if (req.file) {
      fileUrl = await uploadToCloudinaryOrLocal(req.file.path, 'homework');
    }

    const homework = await prisma.homework.create({
      data: {
        title,
        instructions,
        fileUrl: fileUrl || undefined,
        dueDate: new Date(dueDate),
        subjectId,
        facultyId: faculty.id,
      },
    });

    return res.status(201).json(homework);
  } catch (err) {
    next(err);
  }
}

export async function submitHomework(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { homeworkId } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload your homework submission file.' });
    }
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId },
    });
    if (!student) {
      return res.status(403).json({ message: 'Only students can submit homework.' });
    }

    const homework = await prisma.homework.findUnique({ where: { id: homeworkId } });
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found.' });
    }

    const fileUrl = await uploadToCloudinaryOrLocal(req.file.path, 'submissions');

    const now = new Date();
    const isLate = now > homework.dueDate;
    const status = isLate ? HomeworkStatus.LATE : HomeworkStatus.SUBMITTED;

    const submission = await prisma.homeworkSubmission.upsert({
      where: {
        homeworkId_studentId: {
          homeworkId,
          studentId: student.id,
        },
      },
      update: {
        fileUrl,
        submittedAt: now,
        status,
        marks: null,
        feedback: null,
      },
      create: {
        homeworkId,
        studentId: student.id,
        fileUrl,
        submittedAt: now,
        status,
      },
    });

    return res.status(201).json({ message: isLate ? 'Submitted late.' : 'Submitted successfully.', submission });
  } catch (err) {
    next(err);
  }
}

export async function gradeSubmission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params; // submissionId
    const { marks, feedback } = req.body;

    const submission = await prisma.homeworkSubmission.update({
      where: { id },
      data: {
        marks: parseFloat(marks),
        feedback,
        status: HomeworkStatus.GRADED,
      },
    });

    return res.json({ message: 'Submission graded successfully.', submission });
  } catch (err) {
    next(err);
  }
}

export async function getHomeworkBySubject(req: Request, res: Response, next: NextFunction) {
  try {
    const { subjectId } = req.params;
    const homeworks = await prisma.homework.findMany({
      where: { subjectId },
      include: {
        submissions: {
          include: {
            student: { include: { user: true } },
          },
        },
      },
    });
    return res.json(homeworks);
  } catch (err) {
    next(err);
  }
}

export async function getStudentSubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId },
    });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const submissions = await prisma.homeworkSubmission.findMany({
      where: { studentId: student.id },
      include: { homework: { include: { subject: true } } },
    });

    return res.json(submissions);
  } catch (err) {
    next(err);
  }
}

export async function getFacultySubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const faculty = await prisma.facultyProfile.findUnique({
      where: { userId: req.user.userId },
    });
    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty members can view submissions.' });
    }

    const submissions = await prisma.homeworkSubmission.findMany({
      where: {
        homework: {
          facultyId: faculty.id,
        },
      },
      include: {
        student: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        homework: {
          select: { title: true },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    const formatted = submissions.map((s) => ({
      id: s.id,
      studentName: s.student.user.name,
      homeworkTitle: s.homework.title,
      status: s.status,
      submittedAt: s.submittedAt,
      fileUrl: s.fileUrl,
      marks: s.marks,
      feedback: s.feedback,
    }));

    return res.json(formatted);
  } catch (err) {
    next(err);
  }
}

export async function getAssignedHomework(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    // 1. Get student profile to identify className and board
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId },
    });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    // 2. Fetch all homework assignments matching the student's className and board
    const homeworks = await prisma.homework.findMany({
      where: {
        subject: {
          course: {
            className: student.className,
            board: student.board,
          },
        },
      },
      include: {
        subject: true,
        faculty: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        submissions: {
          where: { studentId: student.id },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    // 3. Format homework items, adding status based on submissions
    const formatted = homeworks.map((hw) => {
      const submission = hw.submissions[0];
      return {
        id: hw.id,
        title: hw.title,
        instructions: hw.instructions,
        fileUrl: hw.fileUrl,
        dueDate: hw.dueDate,
        createdAt: hw.createdAt,
        subjectName: hw.subject.name,
        facultyName: hw.faculty.user.name,
        isSubmitted: !!submission,
        submissionStatus: submission ? submission.status : 'PENDING',
        submissionMarks: submission ? submission.marks : null,
        submissionFeedback: submission ? submission.feedback : null,
      };
    });

    return res.json(formatted);
  } catch (err) {
    next(err);
  }
}
