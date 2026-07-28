import type { Course, Lesson, LevelTrack } from "@/types/course";

export type CompletedMap = Record<string, boolean>;

export interface FlatLesson {
  chapter: string;
  lesson: Lesson;
  index: number;
}

export function activeTrack(course: Course): LevelTrack {
  return course.tracks.find((track) => !track.locked) ?? course.tracks[0];
}

export function flattenTrack(track: LevelTrack): FlatLesson[] {
  return track.chapters.flatMap((chapter, chapterIndex) =>
    chapter.lessons.map((lesson, lessonIndex) => ({
      chapter: chapter.title,
      lesson,
      index: chapterIndex * 1000 + lessonIndex,
    })),
  );
}

export function trackProgress(track: LevelTrack, completed: CompletedMap) {
  const lessons = flattenTrack(track);
  const completedCount = lessons.filter((entry) => completed[entry.lesson.id]).length;
  return { completed: completedCount, total: lessons.length };
}

export function courseProgress(course: Course, completed: CompletedMap) {
  return trackProgress(activeTrack(course), completed);
}

export function nextLessonFor(course: Course, completed: CompletedMap): FlatLesson | null {
  const lessons = flattenTrack(activeTrack(course));
  if (lessons.length === 0) return null;
  return lessons.find((entry) => !completed[entry.lesson.id]) ?? lessons[lessons.length - 1];
}

export function lessonAt(course: Course, lessonId: string) {
  const lessons = flattenTrack(activeTrack(course));
  const position = lessons.findIndex((entry) => entry.lesson.id === lessonId);
  if (position === -1) return null;
  return { entry: lessons[position], position, total: lessons.length };
}
