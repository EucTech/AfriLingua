import { create } from "zustand";
import { api } from "@/lib/api";
import type { CompletedMap } from "@/features/courses/lib/progress";

interface LessonProgressState {
  completed: CompletedMap;
  loaded: boolean;
  load: () => Promise<void>;
  complete: (lessonId: string) => Promise<void>;
}

export const useLessonProgress = create<LessonProgressState>((set, get) => ({
  completed: {},
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    const { completedLessonIds } = await api.get<{ completedLessonIds: string[] }>("/progress");
    const completed: CompletedMap = {};
    completedLessonIds.forEach((id) => {
      completed[id] = true;
    });
    set({ completed, loaded: true });
  },
  complete: async (lessonId) => {
    set((state) => ({ completed: { ...state.completed, [lessonId]: true } }));
    await api.post(`/progress/lessons/${lessonId}/complete`);
  },
}));
