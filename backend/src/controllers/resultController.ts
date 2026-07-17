import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { ExamType } from '../utils/enums';

export async function publishResult(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { examName, type, marksObtained, totalMarks, analysis, studentId, subjectId } = req.body;

    const result = await prisma.result.create({
      data: {
        examName,
        type: type as ExamType,
        marksObtained: parseFloat(marksObtained),
        totalMarks: parseFloat(totalMarks),
        analysis: analysis || undefined,
        studentId,
        subjectId,
      },
    });

    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getStudentResults(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { studentId } = req.params;

    const results = await prisma.result.findMany({
      where: { studentId },
      include: { subject: true },
      orderBy: { createdAt: 'asc' },
    });

    // Generate performance progress metrics
    const overallStats = results.reduce(
      (acc, curr) => {
        acc.totalObtained += curr.marksObtained;
        acc.totalMax += curr.totalMarks;
        return acc;
      },
      { totalObtained: 0, totalMax: 0 }
    );

    const percentage = overallStats.totalMax > 0 ? (overallStats.totalObtained / overallStats.totalMax) * 100 : 0;

    return res.json({
      results,
      summary: {
        percentage: Math.round(percentage * 100) / 100,
        totalTests: results.length,
      },
    });
  } catch (err) {
    next(err);
  }
}
