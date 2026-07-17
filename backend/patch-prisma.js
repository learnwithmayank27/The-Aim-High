const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

console.log('Generating Prisma Client...');
try {
  // Execute client generation with disabled SSL checks
  execSync('npx prisma generate', { 
    stdio: 'inherit', 
    env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: '0' } 
  });
} catch (err) {
  console.error('Prisma client generation failed:', err);
  process.exit(1);
}

console.log('Patching Prisma Client with Mock Enums for SQLite support...');

const enumsJs = `
// Aim High Mock Enums for SQLite
exports.Role = {
  ADMIN: 'ADMIN',
  FACULTY: 'FACULTY',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT'
};
exports.PaperType = {
  PREVIOUS_YEAR: 'PREVIOUS_YEAR',
  MODEL: 'MODEL'
};
exports.Difficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD'
};
exports.SubmissionStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};
exports.HomeworkStatus = {
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  GRADED: 'GRADED',
  LATE: 'LATE'
};
exports.LivePlatform = {
  ZOOM: 'ZOOM',
  GOOGLE_MEET: 'GOOGLE_MEET',
  YOUTUBE_LIVE: 'YOUTUBE_LIVE'
};
exports.AttendanceStatus = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE'
};
exports.ExamType = {
  MCQ: 'MCQ',
  DESCRIPTIVE: 'DESCRIPTIVE'
};
exports.FeeStatus = {
  PAID: 'PAID',
  PENDING: 'PENDING',
  FAILED: 'FAILED'
};
`;

const enumsDts = `
// Aim High Mock Enums for SQLite
export type Role = 'ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT';
export const Role: {
  ADMIN: 'ADMIN';
  FACULTY: 'FACULTY';
  STUDENT: 'STUDENT';
  PARENT: 'PARENT';
};

export type PaperType = 'PREVIOUS_YEAR' | 'MODEL';
export const PaperType: {
  PREVIOUS_YEAR: 'PREVIOUS_YEAR';
  MODEL: 'MODEL';
};

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export const Difficulty: {
  EASY: 'EASY';
  MEDIUM: 'MEDIUM';
  HARD: 'HARD';
};

export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export const SubmissionStatus: {
  PENDING: 'PENDING';
  APPROVED: 'APPROVED';
  REJECTED: 'REJECTED';
};

export type HomeworkStatus = 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE';
export const HomeworkStatus: {
  PENDING: 'PENDING';
  SUBMITTED: 'SUBMITTED';
  GRADED: 'GRADED';
  LATE: 'LATE';
};

export type LivePlatform = 'ZOOM' | 'GOOGLE_MEET' | 'YOUTUBE_LIVE';
export const LivePlatform: {
  ZOOM: 'ZOOM';
  GOOGLE_MEET: 'GOOGLE_MEET';
  YOUTUBE_LIVE: 'YOUTUBE_LIVE';
};

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';
export const AttendanceStatus: {
  PRESENT: 'PRESENT';
  ABSENT: 'ABSENT';
  LATE: 'LATE';
};

export type ExamType = 'MCQ' | 'DESCRIPTIVE';
export const ExamType: {
  MCQ: 'MCQ';
  DESCRIPTIVE: 'DESCRIPTIVE';
};

export type FeeStatus = 'PAID' | 'PENDING' | 'FAILED';
export const FeeStatus: {
  PAID: 'PAID';
  PENDING: 'PENDING';
  FAILED: 'FAILED';
};
`;

// Locate the generated files in node_modules
const paths = [
  path.join(__dirname, 'node_modules/@prisma/client/index.js'),
  path.join(__dirname, 'node_modules/@prisma/client/index.d.ts'),
  path.join(__dirname, 'node_modules/.prisma/client/index.js'),
  path.join(__dirname, 'node_modules/.prisma/client/index.d.ts')
];

paths.forEach((p) => {
  if (fs.existsSync(p)) {
    console.log('Patching: ' + p);
    const content = fs.readFileSync(p, 'utf8');
    const extension = path.extname(p);
    const addition = extension === '.js' ? enumsJs : enumsDts;
    
    if (!content.includes('Aim High Mock Enums')) {
      fs.appendFileSync(p, addition, 'utf8');
      console.log('Appended mock enums to ' + path.basename(p));
    } else {
      console.log('Already patched: ' + path.basename(p));
    }
  }
});
