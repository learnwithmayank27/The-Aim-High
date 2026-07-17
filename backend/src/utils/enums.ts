export enum Role {
  ADMIN = 'ADMIN',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

export enum PaperType {
  PREVIOUS_YEAR = 'PREVIOUS_YEAR',
  MODEL = 'MODEL',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  LATE = 'LATE',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum HomeworkStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  LATE = 'LATE',
}

export enum LivePlatform {
  ZOOM = 'ZOOM',
  GOOGLE_MEET = 'GOOGLE_MEET',
  YOUTUBE_LIVE = 'YOUTUBE_LIVE',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
}

export enum ExamType {
  MCQ = 'MCQ',
  DESCRIPTIVE = 'DESCRIPTIVE',
}

export enum FeeStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}
