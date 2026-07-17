import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Local enum definitions for SQLite compatibility
enum Role {
  ADMIN = 'ADMIN',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

enum PaperType {
  PREVIOUS_YEAR = 'PREVIOUS_YEAR',
  MODEL = 'MODEL',
}

enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

enum SubmissionStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  LATE = 'LATE',
}

enum HomeworkStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  LATE = 'LATE',
}

enum LivePlatform {
  ZOOM = 'ZOOM',
  GOOGLE_MEET = 'GOOGLE_MEET',
  YOUTUBE_LIVE = 'YOUTUBE_LIVE',
}

enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
}

enum ExamType {
  MCQ = 'MCQ',
  DESCRIPTIVE = 'DESCRIPTIVE',
}

enum FeeStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');

  // Clean database
  await prisma.comment.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.watchProgress.deleteMany({});
  await prisma.solutionUpload.deleteMany({});
  await prisma.homeworkSubmission.deleteMany({});
  await prisma.homework.deleteMany({});
  await prisma.liveClass.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.result.deleteMany({});
  await prisma.feeReceipt.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.videoLecture.deleteMany({});
  await prisma.paper.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.blogPost.deleteMany({});
  await prisma.notice.deleteMany({});
  await prisma.contactConfig.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.facultyProfile.deleteMany({});
  await prisma.parentProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleared database records.');

  // Common password hash for test accounts
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  // Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@aimhigh.com',
      password: passwordHash,
      name: 'Admin Director',
      role: Role.ADMIN,
      phone: '9151646849',
    },
  });

  // Faculty - Prashant Rajput (From Image)
  const facultyUser = await prisma.user.create({
    data: {
      email: 'prashant@aimhigh.com',
      password: passwordHash,
      name: 'Prashant Rajput',
      role: Role.FACULTY,
      phone: '9151646849',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    },
  });

  // Parent
  const parentUser = await prisma.user.create({
    data: {
      email: 'parent@aimhigh.com',
      password: passwordHash,
      name: 'Adesh Sharma',
      role: Role.PARENT,
      phone: '9876543210',
    },
  });

  // Student
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@aimhigh.com',
      password: passwordHash,
      name: 'Mayank Sharma',
      role: Role.STUDENT,
      phone: '9988776655',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    },
  });

  console.log('Created core users.');

  // 2. Profiles
  const facultyProfile = await prisma.facultyProfile.create({
    data: {
      userId: facultyUser.id,
      qualification: 'B.Tech, IIT Kanpur (IIT-JEE Specialist)',
      experience: '8+ Years',
      subjects: JSON.stringify(['Mathematics', 'Physics', 'Chemistry']),
      achievements: JSON.stringify([
        'Mentored 500+ students who cleared IIT-JEE & NEET',
        'Recognized as Best Foundation Teacher Kanpur 2024',
      ]),
      biography: 'Managed by Prashant Rajput. Dedicated to offering high-quality foundation coaching for Class 9th to 12th under CBSE, ICSE, and ISC Boards. Focuses on concept clarity, regular tests, and competitive preparation.',
      socialLinks: JSON.stringify({
        linkedin: 'https://linkedin.com/in/prashantrajput',
        youtube: 'https://youtube.com/aimhighacademy',
      }),
    },
  });

  const parentProfile = await prisma.parentProfile.create({
    data: {
      userId: parentUser.id,
      relation: 'Father',
      address: 'Plot No. 938 A, Coaching Mandi, Barra-2 Kanpur',
      alternatePhone: '9151646849',
    },
  });

  const studentProfile = await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      className: 'Class 10',
      board: 'CBSE',
      rollNumber: 'AH-2026-1004',
      parentId: parentProfile.id,
    },
  });

  console.log('Created profiles.');

  // 3. Courses
  const courseClass10 = await prisma.course.create({
    data: {
      name: 'Class 10 CBSE Boards & Foundation',
      code: 'CBSE10',
      description: 'Complete syllabus coverage for Class 10 CBSE with special focus on Science, Mathematics, and foundation for IIT-JEE/NEET.',
      className: 'Class 10',
      board: 'CBSE',
    },
  });

  const courseClass12 = await prisma.course.create({
    data: {
      name: 'Class 12 ISC/CBSE PCM Integrated Program',
      code: 'PCM12',
      description: 'Advanced board prep and extensive mock test series for Physics, Chemistry, and Mathematics.',
      className: 'Class 12',
      board: 'CBSE',
    },
  });

  console.log('Created courses.');

  // 4. Subjects
  const mathSubject = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      courseId: courseClass10.id,
    },
  });

  const physicsSubject = await prisma.subject.create({
    data: {
      name: 'Physics',
      courseId: courseClass10.id,
    },
  });

  const chemistrySubject = await prisma.subject.create({
    data: {
      name: 'Chemistry',
      courseId: courseClass10.id,
    },
  });

  console.log('Created subjects.');

  // 5. Contact Config (singleton)
  await prisma.contactConfig.create({
    data: {
      id: 'singleton',
      phone: '9151646849',
      whatsapp: '9151646849',
      email: 'aimhighkanpur@gmail.com',
      address: 'Plot No.938 A, Coaching Mandi, Barra-2 Kanpur',
      officeHours: '8:00 AM - 8:00 PM (Monday - Saturday)',
      mapUrl: 'https://maps.google.com/?q=Plot+No.938+A,+Coaching+Mandi,+Barra-2+Kanpur',
    },
  });

  // 6. Papers (Previous Year & Model)
  const pyqPaper = await prisma.paper.create({
    data: {
      title: 'Class 10 CBSE Mathematics Board Paper - 2025',
      type: PaperType.PREVIOUS_YEAR,
      fileUrl: '/uploads/papers/cbse-10-math-2025.pdf',
      fileType: 'PDF',
      difficulty: Difficulty.MEDIUM,
      year: 2025,
      hasAnswerKey: true,
      answerKeyUrl: '/uploads/papers/cbse-10-math-2025-key.pdf',
      subjectId: mathSubject.id,
    },
  });

  const modelPaper = await prisma.paper.create({
    data: {
      title: 'Class 10 Physics Mid-Term Target Model Paper',
      type: PaperType.MODEL,
      fileUrl: '/uploads/papers/class-10-physics-model.pdf',
      fileType: 'PDF',
      difficulty: Difficulty.HARD,
      year: 2026,
      hasAnswerKey: true,
      answerKeyUrl: '/uploads/papers/class-10-physics-model-key.pdf',
      subjectId: physicsSubject.id,
    },
  });

  console.log('Created papers.');

  // 7. Video Lectures
  const mathVideo = await prisma.videoLecture.create({
    data: {
      title: 'Introduction to Quadratic Equations',
      description: 'Learn the core concepts of Quadratic equations, finding roots using factorization and formula method.',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
      className: 'Class 10',
      chapter: 'Chapter 4: Quadratic Equations',
      topic: 'Solving by Quadratic Formula',
      subjectId: mathSubject.id,
    },
  });

  const physicsVideo = await prisma.videoLecture.create({
    data: {
      title: 'Reflection and Refraction of Light',
      description: 'Understanding mirrors, lenses, Snell\'s law, and light behaviors.',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      className: 'Class 10',
      chapter: 'Chapter 10: Light',
      topic: 'Spherical Lenses',
      subjectId: physicsSubject.id,
    },
  });

  // 8. Homework
  const mathHomework = await prisma.homework.create({
    data: {
      title: 'Quadratic Equations Exercise 4.2',
      instructions: 'Solve questions 1 to 10. Show all steps clearly.',
      fileUrl: '/uploads/homework/math-ex-4-2.pdf',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      subjectId: mathSubject.id,
      facultyId: facultyProfile.id,
    },
  });

  // 9. Homework Submission
  await prisma.homeworkSubmission.create({
    data: {
      homeworkId: mathHomework.id,
      studentId: studentProfile.id,
      fileUrl: '/uploads/submissions/mayank-math-ex-4-2.pdf',
      submittedAt: new Date(),
      status: HomeworkStatus.SUBMITTED,
    },
  });

  // 10. Live Class
  await prisma.liveClass.create({
    data: {
      title: 'Real Numbers & Proof of Irrationality',
      platform: LivePlatform.GOOGLE_MEET,
      link: 'https://meet.google.com/abc-defg-hij',
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      durationMins: 90,
      facultyId: facultyProfile.id,
      subjectId: mathSubject.id,
    },
  });

  // 11. Attendance
  await prisma.attendance.create({
    data: {
      date: new Date(),
      status: AttendanceStatus.PRESENT,
      studentId: studentProfile.id,
      takenById: facultyProfile.id,
    },
  });

  // 12. Results
  await prisma.result.create({
    data: {
      examName: 'Chapter 1 Math Test',
      type: ExamType.MCQ,
      marksObtained: 28,
      totalMarks: 30,
      analysis: JSON.stringify({
        rank: 1,
        weakAreas: ['Decimal expansions'],
      }),
      studentId: studentProfile.id,
      subjectId: mathSubject.id,
    },
  });

  await prisma.result.create({
    data: {
      examName: 'Light & Reflection Descriptive',
      type: ExamType.DESCRIPTIVE,
      marksObtained: 42,
      totalMarks: 50,
      analysis: JSON.stringify({
        rank: 3,
        weakAreas: ['Lens Formula derivations'],
      }),
      studentId: studentProfile.id,
      subjectId: physicsSubject.id,
    },
  });

  // 13. Fee Receipt
  await prisma.feeReceipt.create({
    data: {
      invoiceNo: 'INV-2026-001',
      amount: 4500,
      status: FeeStatus.PAID,
      paymentMethod: 'UPI',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      paidAt: new Date(),
      receiptUrl: '/uploads/receipts/inv-2026-001.pdf',
      studentId: studentProfile.id,
    },
  });

  await prisma.feeReceipt.create({
    data: {
      invoiceNo: 'INV-2026-002',
      amount: 4500,
      status: FeeStatus.PENDING,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      studentId: studentProfile.id,
    },
  });

  // 14. Notices
  await prisma.notice.create({
    data: {
      title: 'Weekly Test Schedule - Mathematics',
      content: 'A mock test covering Chapter 4: Quadratic Equations will be conducted this Sunday from 10:00 AM to 11:30 AM. Attendance is compulsory.',
      isImportant: true,
      createdById: adminUser.id,
    },
  });

  await prisma.notice.create({
    data: {
      title: 'Summer Timings and Office Hours',
      content: 'Please note the new office timings will be active from next week: 8:00 AM to 8:00 PM. Classroom batches will operate in the evening slot.',
      isImportant: false,
      createdById: adminUser.id,
    },
  });

  // 15. Blogs
  await prisma.blogPost.create({
    data: {
      title: 'How to Crack Board Exams without Stress: 5 Key Tips',
      slug: 'how-to-crack-board-exams-without-stress',
      content: 'Every year, board exams create significant anxiety for students in Classes 10 and 12. However, with structured preparation, stress-free success is completely achievable. Here are 5 tips compiled by Prashant Rajput:\n\n1. Stick to NCERT syllabus and practice problems daily.\n2. Revise formula sheets every morning.\n3. Solve previous year question papers (PYQs) with a strict timer.\n4. Take short study breaks using the Pomodoro technique.\n5. Maintain a healthy sleep schedule of 7-8 hours before exam day.',
      category: 'Exam Tips',
      bannerImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
      authorId: facultyUser.id,
    },
  });

  // 16. Notes
  await prisma.note.create({
    data: {
      title: 'Handwritten Formulas - Trigonometry',
      chapter: 'Trigonometric Functions & Identities',
      fileUrl: '/uploads/notes/trigo-formulas.pdf',
      subjectId: mathSubject.id,
    },
  });

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
