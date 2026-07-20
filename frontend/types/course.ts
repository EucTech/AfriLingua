export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface Course {
  id: string;
  language: string;
  nativeName: string;
  flagEmoji: string;
  level: CourseLevel;
  totalLessons: number;
  completedLessons: number;
  description: string;
}
