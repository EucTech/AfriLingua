import { create } from "zustand";
import { courses } from "@/features/courses/data/courses";
import { activeTrack, flattenTrack, type CompletedMap } from "@/features/courses/lib/progress";

interface LessonProgressState {
  completed: CompletedMap;
  complete: (lessonId: string) => void;
}

// Mirrors each course's original demo progress (e.g. Swahili 24/40, Zulu fully done).
const seedCompletedCounts: Record<string, number> = {
  swahili: 24,
  yoruba: 9,
  amharic: 0,
  zulu: 34,
  hausa: 5,
  kinyarwanda: 0,
};

function buildSeedCompleted(): CompletedMap {
  const completed: CompletedMap = {};
  for (const course of courses) {
    const count = seedCompletedCounts[course.id] ?? 0;
    const lessons = flattenTrack(activeTrack(course));
    lessons.slice(0, count).forEach((entry) => {
      completed[entry.lesson.id] = true;
    });
  }
  return completed;
}

export const useLessonProgress = create<LessonProgressState>((set) => ({
  completed: buildSeedCompleted(),
  complete: (lessonId) =>
    set((state) => ({ completed: { ...state.completed, [lessonId]: true } })),
}));
