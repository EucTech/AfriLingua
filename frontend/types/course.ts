export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface VocabWord {
  id: string;
  word: string;
  translation: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface Lesson {
  id: string;
  title: string;
  videoTitle: string;
  videoMinutes: number;
  videoUrl: string;
  words: VocabWord[];
  quiz: QuizQuestion[];
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface LevelTrack {
  level: CourseLevel;
  cefr: string;
  description: string;
  locked: boolean;
  chapters: Chapter[];
}

export interface Course {
  id: string;
  language: string;
  nativeName: string;
  flagEmoji: string;
  description: string;
  tracks: LevelTrack[];
}
