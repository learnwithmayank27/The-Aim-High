import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export async function createCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, code, description, className, board } = req.body;
    const course = await prisma.course.create({
      data: { name, code, description, className, board },
    });
    return res.status(201).json(course);
  } catch (err) {
    next(err);
  }
}

export async function getAllCourses(req: Request, res: Response, next: NextFunction) {
  try {
    const courses = await prisma.course.findMany({
      include: { subjects: true },
    });
    return res.json(courses);
  } catch (err) {
    next(err);
  }
}

export async function createSubject(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, courseId } = req.body;
    const subject = await prisma.subject.create({
      data: { name, courseId },
    });
    return res.status(201).json(subject);
  } catch (err) {
    next(err);
  }
}

export async function getSubjectsByCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const { courseId } = req.params;
    const subjects = await prisma.subject.findMany({
      where: { courseId },
    });
    return res.json(subjects);
  } catch (err) {
    next(err);
  }
}

export async function getSubjectDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        papers: true,
        homeworks: true,
        videoLectures: true,
        liveClasses: true,
      },
    });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    return res.json(subject);
  } catch (err) {
    next(err);
  }
}
