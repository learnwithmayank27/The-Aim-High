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
