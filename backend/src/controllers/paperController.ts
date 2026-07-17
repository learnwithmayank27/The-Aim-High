import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { uploadToCloudinaryOrLocal } from '../utils/fileUpload';
import { PaperType, Difficulty, SubmissionStatus } from '../utils/enums';

// 1. Papers
export async function createPaper(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { title, type, fileType, difficulty, year, subjectId, hasAnswerKey, answerKeyUrl } = req.body;
    let fileUrl = req.body.fileUrl;

    if (req.file) {
      fileUrl = await uploadToCloudinaryOrLocal(req.file.path, 'papers');
    }

    if (!title || !type || !subjectId || !fileUrl) {
      return res.status(400).json({ message: 'Title, type, subjectId and paper file are required.' });
    }

    const paper = await prisma.paper.create({
      data: {
        title,
        type: type as PaperType,
        fileUrl,
        fileType: fileType || 'PDF',
        difficulty: (difficulty as Difficulty) || Difficulty.MEDIUM,
        year: parseInt(year) || new Date().getFullYear(),
        subjectId,
        hasAnswerKey: hasAnswerKey === 'true' || hasAnswerKey === true,
        answerKeyUrl,
      },
    });

    return res.status(201).json(paper);
  } catch (err) {
    next(err);
  }
}

export async function getPapers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { type, subjectId, difficulty, class: className, board } = req.query;

    const papers = await prisma.paper.findMany({
      where: {
        type: type ? (type as PaperType) : undefined,
        subjectId: subjectId ? String(subjectId) : undefined,
        difficulty: difficulty ? (difficulty as Difficulty) : undefined,
        subject: {
          course: {
            className: className ? String(className) : undefined,
            board: board ? String(board) : undefined,
          },
        },
      },
      include: {
        subject: {
          include: { course: true },
        },
      },
    });

    return res.json(papers);
  } catch (err) {
    next(err);
  }
}

// 2. Student Solutions
export async function uploadSolution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { paperId } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a solution file.' });
    }
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId },
    });
    if (!studentProfile) {
      return res.status(400).json({ message: 'Only students can upload solutions.' });
    }

    const fileUrl = await uploadToCloudinaryOrLocal(req.file.path, 'solutions');

    const solution = await prisma.solutionUpload.create({
      data: {
        paperId,
        studentId: studentProfile.id,
        fileUrl,
      },
    });

    return res.status(201).json({ message: 'Solution uploaded. Pending admin review.', solution });
  } catch (err) {
    next(err);
  }
}

export async function approveSolution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED or REJECTED

    if (![SubmissionStatus.APPROVED, SubmissionStatus.REJECTED].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const updated = await prisma.solutionUpload.update({
      where: { id },
      data: { status },
    });

    return res.json({ message: `Solution ${status.toLowerCase()} successfully.`, solution: updated });
  } catch (err) {
    next(err);
  }
}

export async function likeSolution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const solution = await prisma.solutionUpload.update({
      where: { id },
      data: {
        likes: { increment: 1 },
      },
    });
    return res.json(solution);
  } catch (err) {
    next(err);
  }
}

export async function addComment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params; // solutionId
    const { text } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const comment = await prisma.comment.create({
      data: {
        solutionId: id,
        userName: user.name,
        text,
      },
    });

    return res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

export async function getSolutionLeaderboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const leaderboard = await prisma.solutionUpload.findMany({
      where: { status: SubmissionStatus.APPROVED },
      orderBy: { likes: 'desc' },
      include: {
        student: {
          include: { user: true },
        },
        paper: true,
      },
      take: 10,
    });
    return res.json(leaderboard);
  } catch (err) {
    next(err);
  }
}
