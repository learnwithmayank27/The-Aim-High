import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { uploadToCloudinaryOrLocal } from '../utils/fileUpload';

export async function createVideo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { title, description, youtubeUrl, className, chapter, topic, subjectId } = req.body;
    let fileUrl = '';

    if (req.file) {
      fileUrl = await uploadToCloudinaryOrLocal(req.file.path, 'videos');
    }

    const video = await prisma.videoLecture.create({
      data: {
        title,
        description,
        youtubeUrl: youtubeUrl || null,
        fileUrl: fileUrl || null,
        className,
        chapter,
        topic,
        subjectId,
      },
    });

    return res.status(201).json(video);
  } catch (err) {
    next(err);
  }
}

export async function getVideos(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { subjectId, className } = req.query;

    const videos = await prisma.videoLecture.findMany({
      where: {
        subjectId: subjectId ? String(subjectId) : undefined,
        className: className ? String(className) : undefined,
      },
      include: {
        subject: { include: { course: true } },
      },
    });

    return res.json(videos);
  } catch (err) {
    next(err);
  }
}

export async function updateProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { videoId, progressSeconds, completed } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId },
    });
    if (!student) return res.status(403).json({ message: 'Only students track watch progress.' });

    const progress = await prisma.watchProgress.upsert({
      where: {
        studentId_videoId: {
          studentId: student.id,
          videoId,
        },
      },
      update: {
        progressSeconds: parseInt(progressSeconds),
        completed: completed === 'true' || completed === true,
      },
      create: {
        studentId: student.id,
        videoId,
        progressSeconds: parseInt(progressSeconds),
        completed: completed === 'true' || completed === true,
      },
    });

    return res.json(progress);
  } catch (err) {
    next(err);
  }
}

export async function getContinueWatching(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId },
    });
    if (!student) return res.status(403).json({ message: 'Student profile not found.' });

    const watchHistory = await prisma.watchProgress.findMany({
      where: {
        studentId: student.id,
        completed: false,
      },
      include: {
        video: {
          include: {
            subject: { include: { course: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    return res.json(watchHistory);
  } catch (err) {
    next(err);
  }
}

// Bookmarking System
export async function toggleBookmark(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { videoId, paperId, noteId } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId },
    });
    if (!student) return res.status(403).json({ message: 'Only students can bookmark content.' });

    // Check if bookmark exists
    const existing = await prisma.bookmark.findFirst({
      where: {
        studentId: student.id,
        videoId: videoId || undefined,
        paperId: paperId || undefined,
        noteId: noteId || undefined,
      },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return res.json({ bookmarked: false, message: 'Bookmark removed.' });
    } else {
      const bookmark = await prisma.bookmark.create({
        data: {
          studentId: student.id,
          videoId: videoId || undefined,
          paperId: paperId || undefined,
          noteId: noteId || undefined,
        },
      });
      return res.json({ bookmarked: true, message: 'Bookmark added.', bookmark });
    }
  } catch (err) {
    next(err);
  }
}

export async function getBookmarks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId },
    });
    if (!student) return res.status(403).json({ message: 'Student profile not found.' });

    const bookmarks = await prisma.bookmark.findMany({
      where: { studentId: student.id },
      include: {
        video: true,
        paper: true,
        note: true,
      },
    });

    return res.json(bookmarks);
  } catch (err) {
    next(err);
  }
}
