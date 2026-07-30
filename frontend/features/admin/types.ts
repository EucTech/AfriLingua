export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalLessons: number;
  signups: { date: string; count: number }[];
  topLearningLanguages: { language: string; count: number }[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  country: string | null;
  role: "user" | "admin";
  xp: number;
  streakDays: number;
  createdAt: string;
  initials: string;
}

export interface AdminUserList {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminCourse {
  id: string;
  language: string;
  nativeName: string;
  flagEmoji: string;
  description: string;
  _count: { tracks: number };
}

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface AdminVocabWord {
  id: string;
  word: string;
  translation: string;
  order: number;
}

export interface AdminQuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  order: number;
}

export interface AdminLesson {
  id: string;
  title: string;
  videoTitle: string;
  videoMinutes: number;
  videoUrl: string;
  order: number;
  words: AdminVocabWord[];
  quiz: AdminQuizQuestion[];
}

export interface AdminChapter {
  id: string;
  title: string;
  order: number;
  lessons: AdminLesson[];
}

export interface AdminTrack {
  id: string;
  level: CourseLevel;
  cefr: string;
  description: string;
  locked: boolean;
  chapters: AdminChapter[];
}

export interface AdminCourseDetail extends AdminCourse {
  tracks: AdminTrack[];
}

export interface LessonFormValues {
  title: string;
  videoTitle: string;
  videoMinutes: number;
  videoUrl: string;
  words: { word: string; translation: string }[];
  quiz: { prompt: string; options: string[]; correctIndex: number }[];
}
