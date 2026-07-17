import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { uploadToCloudinaryOrLocal } from '../utils/fileUpload';

// 1. Notices
export async function createNotice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { title, content, isImportant } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        isImportant: isImportant === 'true' || isImportant === true,
        createdById: req.user.userId,
      },
    });

    return res.status(201).json(notice);
  } catch (err) {
    next(err);
  }
}

export async function getNotices(req: Request, res: Response, next: NextFunction) {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { name: true } } },
    });
    return res.json(notices);
  } catch (err) {
    next(err);
  }
}

// 2. Blogs
export async function createBlogPost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { title, content, category } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    let bannerImage = '';
    if (req.file) {
      bannerImage = await uploadToCloudinaryOrLocal(req.file.path, 'blogs');
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const blog = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        category,
        bannerImage: bannerImage || undefined,
        authorId: req.user.userId,
      },
    });

    return res.status(201).json(blog);
  } catch (err) {
    next(err);
  }
}

export async function getBlogs(req: Request, res: Response, next: NextFunction) {
  try {
    const blogs = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    });
    return res.json(blogs);
  } catch (err) {
    next(err);
  }
}

// 3. Contact Config
export async function updateContactConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, whatsapp, email, address, officeHours, mapUrl } = req.body;
    const config = await prisma.contactConfig.upsert({
      where: { id: 'singleton' },
      update: { phone, whatsapp, email, address, officeHours, mapUrl },
      create: { id: 'singleton', phone, whatsapp, email, address, officeHours, mapUrl },
    });
    return res.json(config);
  } catch (err) {
    next(err);
  }
}

export async function getContactConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const config = await prisma.contactConfig.findUnique({
      where: { id: 'singleton' },
    });
    return res.json(config);
  } catch (err) {
    next(err);
  }
}

// 4. Notes
export async function uploadNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { title, chapter, subjectId } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file for the note.' });
    }

    const fileUrl = await uploadToCloudinaryOrLocal(req.file.path, 'notes');

    const note = await prisma.note.create({
      data: {
        title,
        chapter,
        fileUrl,
        subjectId,
      },
    });

    return res.status(201).json(note);
  } catch (err) {
    next(err);
  }
}

export async function getNotesBySubject(req: Request, res: Response, next: NextFunction) {
  try {
    const { subjectId } = req.params;
    const notes = await prisma.note.findMany({
      where: { subjectId },
    });
    return res.json(notes);
  } catch (err) {
    next(err);
  }
}
