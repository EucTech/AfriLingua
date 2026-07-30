"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Lock,
  Pencil,
  Plus,
  Trash2,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";
import type { AdminChapter, AdminCourseDetail, AdminLesson, AdminTrack, CourseLevel } from "@/features/admin/types";
import { TrackFormDialog } from "@/features/admin/components/TrackFormDialog";
import { ChapterFormDialog } from "@/features/admin/components/ChapterFormDialog";
import { LessonFormDialog } from "@/features/admin/components/LessonFormDialog";

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-muted h-4 w-24 rounded" />
      <div className="flex items-center gap-3.5">
        <div className="bg-muted h-14 w-14 shrink-0 rounded-full" />
        <div className="space-y-2">
          <div className="bg-muted h-6 w-40 rounded" />
          <div className="bg-muted h-4 w-56 rounded" />
        </div>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-card border-border h-20 rounded-2xl border" />
      ))}
    </div>
  );
}

const courseDetailKey = (courseId: string) => ["admin", "courses", courseId, "detail"] as const;

export function CourseDetailAdmin({ courseId }: { courseId: string }) {
  const queryClient = useQueryClient();
  const [expandedTracks, setExpandedTracks] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const [trackDialog, setTrackDialog] = useState<{ open: boolean; track: AdminTrack | null }>({
    open: false,
    track: null,
  });
  const [chapterDialog, setChapterDialog] = useState<{ open: boolean; trackId: string; chapter: AdminChapter | null }>({
    open: false,
    trackId: "",
    chapter: null,
  });
  const [lessonDialog, setLessonDialog] = useState<{ open: boolean; chapterId: string; lesson: AdminLesson | null }>({
    open: false,
    chapterId: "",
    lesson: null,
  });

  const [deleteTrackTarget, setDeleteTrackTarget] = useState<AdminTrack | null>(null);
  const [deleteChapterTarget, setDeleteChapterTarget] = useState<AdminChapter | null>(null);
  const [deleteLessonTarget, setDeleteLessonTarget] = useState<AdminLesson | null>(null);

  const queryKey = courseDetailKey(courseId);

  const {
    data: course,
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey,
    queryFn: () => api.get<AdminCourseDetail>(`/admin/courses/${courseId}/detail`),
  });

  useEffect(() => {
    if (isError) toast.error("Couldn't load this course.");
  }, [isError]);

  useEffect(() => {
    if (course) {
      setExpandedTracks((prev) => (prev.size > 0 ? prev : new Set(course.tracks.slice(0, 1).map((t) => t.id))));
    }
  }, [course]);

  const loadCourse = () => queryClient.invalidateQueries({ queryKey });

  const deleteTrackMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/tracks/${id}`),
    onSuccess: () => {
      toast.success("Level deleted");
      setDeleteTrackTarget(null);
      loadCourse();
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Couldn't delete this level."),
  });

  const deleteChapterMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/chapters/${id}`),
    onSuccess: () => {
      toast.success("Chapter deleted");
      setDeleteChapterTarget(null);
      loadCourse();
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Couldn't delete this chapter."),
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/lessons/${id}`),
    onSuccess: () => {
      toast.success("Lesson deleted");
      setDeleteLessonTarget(null);
      loadCourse();
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Couldn't delete this lesson."),
  });

  const toggleTrack = (id: string) =>
    setExpandedTracks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleChapter = (id: string) =>
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  if (loading || !course) {
    return <DetailSkeleton />;
  }

  const usedLevels = course.tracks.map((t) => t.level) as CourseLevel[];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="self-start" asChild>
        <Link href="/admin/courses">
          <ArrowLeft size={15} />
          Back to courses
        </Link>
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="bg-muted flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-3xl leading-none">
            {course.flagEmoji}
          </span>
          <div>
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">{course.language}</h1>
            <p className="text-muted-foreground text-sm">
              {course.nativeName} · {course.description}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => setTrackDialog({ open: true, track: null })}
          disabled={usedLevels.length >= 3}
        >
          <Plus size={15} />
          Add level
        </Button>
      </div>

      <div className="space-y-3">
        {course.tracks.length === 0 && (
          <p className="text-muted-foreground bg-card border-border rounded-2xl border p-6 text-sm">
            No levels yet. Add one to start building content.
          </p>
        )}

        {course.tracks.map((track) => {
          const trackOpen = expandedTracks.has(track.id);
          return (
            <div key={track.id} className="bg-card border-border rounded-2xl border">
              <div
                className="flex cursor-pointer items-center justify-between gap-3 p-4"
                onClick={() => toggleTrack(track.id)}
              >
                <div className="flex items-center gap-2.5">
                  {trackOpen ? (
                    <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                  )}
                  <div>
                    <p className="text-foreground text-sm font-semibold capitalize">
                      {track.level} <span className="text-muted-foreground font-normal">· {track.cefr}</span>
                    </p>
                    <p className="text-muted-foreground text-xs">{track.description}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    {track.locked ? <Lock size={12} /> : <Unlock size={12} />}
                    {track.locked ? "Locked" : "Unlocked"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTrackDialog({ open: true, track })}
                    aria-label={`Edit ${track.level}`}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTrackTarget(track)}
                    aria-label={`Delete ${track.level}`}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {trackOpen && (
                <div className="border-border space-y-2 border-t p-4">
                  {track.chapters.length === 0 && (
                    <p className="text-muted-foreground text-xs">No chapters yet.</p>
                  )}
                  {track.chapters.map((chapter) => {
                    const chapterOpen = expandedChapters.has(chapter.id);
                    return (
                      <div key={chapter.id} className="border-border rounded-xl border">
                        <div
                          className="flex cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5"
                          onClick={() => toggleChapter(chapter.id)}
                        >
                          <div className="flex items-center gap-2">
                            {chapterOpen ? (
                              <ChevronDown size={14} className="text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                            )}
                            <p className="text-foreground text-sm font-medium">{chapter.title}</p>
                            <span className="text-muted-foreground text-xs">
                              {chapter.lessons.length} lesson{chapter.lessons.length === 1 ? "" : "s"}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setChapterDialog({ open: true, trackId: track.id, chapter })}
                              aria-label={`Edit ${chapter.title}`}
                              className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-7 w-7 items-center justify-center rounded-full transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteChapterTarget(chapter)}
                              aria-label={`Delete ${chapter.title}`}
                              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex h-7 w-7 items-center justify-center rounded-full transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {chapterOpen && (
                          <div className="border-border divide-border divide-y border-t">
                            {chapter.lessons.map((lesson) => (
                              <div key={lesson.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                                <div>
                                  <p className="text-foreground text-sm">{lesson.title}</p>
                                  <p className="text-muted-foreground text-xs">
                                    {lesson.videoMinutes} min · {lesson.words.length} words · {lesson.quiz.length} quiz
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setLessonDialog({ open: true, chapterId: chapter.id, lesson })}
                                    aria-label={`Edit ${lesson.title}`}
                                    className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-7 w-7 items-center justify-center rounded-full transition-colors"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteLessonTarget(lesson)}
                                    aria-label={`Delete ${lesson.title}`}
                                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex h-7 w-7 items-center justify-center rounded-full transition-colors"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            ))}
                            <div className="p-2.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLessonDialog({ open: true, chapterId: chapter.id, lesson: null })}
                              >
                                <Plus size={13} />
                                Add lesson
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setChapterDialog({ open: true, trackId: track.id, chapter: null })}
                  >
                    <Plus size={14} />
                    Add chapter
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <TrackFormDialog
        courseId={courseId}
        track={trackDialog.track}
        usedLevels={usedLevels}
        open={trackDialog.open}
        onClose={() => setTrackDialog({ open: false, track: null })}
        onSaved={loadCourse}
      />

      <ChapterFormDialog
        trackId={chapterDialog.trackId}
        chapter={chapterDialog.chapter}
        open={chapterDialog.open}
        onClose={() => setChapterDialog({ open: false, trackId: "", chapter: null })}
        onSaved={loadCourse}
      />

      <LessonFormDialog
        chapterId={lessonDialog.chapterId}
        lesson={lessonDialog.lesson}
        open={lessonDialog.open}
        onClose={() => setLessonDialog({ open: false, chapterId: "", lesson: null })}
        onSaved={loadCourse}
      />

      <Dialog open={!!deleteTrackTarget} onOpenChange={(open) => !open && setDeleteTrackTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">Delete {deleteTrackTarget?.level} level?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">This removes the level and all of its chapters and lessons.</p>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => deleteTrackTarget && deleteTrackMutation.mutate(deleteTrackTarget.id)}
              disabled={deleteTrackMutation.isPending}
              className="w-full"
            >
              {deleteTrackMutation.isPending ? "Deleting…" : "Delete level"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteChapterTarget} onOpenChange={(open) => !open && setDeleteChapterTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteChapterTarget?.title}?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">This removes the chapter and all of its lessons.</p>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => deleteChapterTarget && deleteChapterMutation.mutate(deleteChapterTarget.id)}
              disabled={deleteChapterMutation.isPending}
              className="w-full"
            >
              {deleteChapterMutation.isPending ? "Deleting…" : "Delete chapter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteLessonTarget} onOpenChange={(open) => !open && setDeleteLessonTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteLessonTarget?.title}?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">This cannot be undone.</p>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => deleteLessonTarget && deleteLessonMutation.mutate(deleteLessonTarget.id)}
              disabled={deleteLessonMutation.isPending}
              className="w-full"
            >
              {deleteLessonMutation.isPending ? "Deleting…" : "Delete lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
