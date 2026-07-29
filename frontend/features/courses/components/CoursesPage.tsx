"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronDown, Circle, Lock, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useCourses } from "@/features/courses/hooks/useCourses";
import {
  activeTrack,
  courseProgress,
  flattenTrack,
  nextLessonFor,
  type CompletedMap,
  type FlatLesson,
} from "@/features/courses/lib/progress";
import { useLessonProgress } from "@/features/courses/store/useLessonProgress";
import type { Course, CourseLevel } from "@/types/course";

const levelStyles: Record<CourseLevel, string> = {
  beginner: "bg-success/10 text-success border-success/30",
  intermediate: "bg-info/10 text-info border-info/30",
  advanced: "bg-accent/10 text-accent border-accent/30",
};

function SwitchCourseDialog({
  courses,
  activeId,
  onConfirm,
}: {
  courses: Course[];
  activeId: string;
  onConfirm: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(activeId);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSelected(activeId);
      }}
    >
      <DialogTrigger asChild>
        <button
          className="border-border text-muted-foreground hover:border-foreground/15 flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors"
          type="button"
        >
          <Repeat size={14} />
          Switch course
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Switch course</DialogTitle>
          <DialogDescription>Pick a new course to enroll in. Your level carries over.</DialogDescription>
        </DialogHeader>

        <div className="scrollbar max-h-72 space-y-1.5 overflow-y-auto">
          {courses.map((course) => {
            const isCurrent = course.id === activeId;
            const isSelected = course.id === selected;
            return (
              <button
                key={course.id}
                onClick={() => setSelected(course.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors",
                  isSelected ? "border-primary bg-primary/5" : "border-border hover:border-foreground/15",
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">{course.flagEmoji}</span>
                  <span className="text-foreground text-sm font-medium">{course.language}</span>
                </span>
                {isCurrent && <span className="text-muted-foreground text-xs">Current</span>}
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button
            className="w-full"
            disabled={selected === activeId}
            onClick={() => {
              onConfirm(selected);
              setOpen(false);
            }}
          >
            Confirm switch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ChapterGroup {
  chapter: string;
  lessons: FlatLesson[];
}

function groupByChapter(lessons: FlatLesson[]): ChapterGroup[] {
  const groups: ChapterGroup[] = [];
  for (const entry of lessons) {
    const last = groups[groups.length - 1];
    if (last && last.chapter === entry.chapter) {
      last.lessons.push(entry);
    } else {
      groups.push({ chapter: entry.chapter, lessons: [entry] });
    }
  }
  return groups;
}

function LessonRow({
  courseId,
  entry,
  status,
}: {
  courseId: string;
  entry: FlatLesson;
  status: "done" | "current" | "locked";
}) {
  const icon =
    status === "done" ? (
      <CheckCircle2 size={18} className="text-success shrink-0" />
    ) : status === "current" ? (
      <Circle size={18} className="text-primary shrink-0 fill-primary/20" />
    ) : (
      <Lock size={14} className="text-muted-foreground shrink-0" />
    );

  const content = (
    <>
      {icon}
      <span
        className={cn(
          "flex-1 truncate text-sm",
          status === "locked" ? "text-muted-foreground" : "text-foreground font-medium",
        )}
      >
        {entry.lesson.title}
      </span>
      {status === "current" && (
        <span className="bg-primary/10 text-primary shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium">
          Continue
        </span>
      )}
    </>
  );

  if (status === "locked") {
    return (
      <div className="flex cursor-not-allowed items-center gap-3 px-4 py-2.5 opacity-60">{content}</div>
    );
  }

  return (
    <Link
      href={`/courses/${courseId}/learn?lesson=${entry.lesson.id}`}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50",
        status === "current" && "bg-primary/5",
      )}
    >
      {content}
    </Link>
  );
}

function CourseOutline({
  course,
  lessons,
  completed,
  nextLessonId,
}: {
  course: Course;
  lessons: FlatLesson[];
  completed: CompletedMap;
  nextLessonId: string | undefined;
}) {
  const groups = groupByChapter(lessons);
  const nextGroupIndex = groups.findIndex((group) =>
    group.lessons.some((entry) => entry.lesson.id === nextLessonId),
  );

  return (
    <div className="space-y-2">
      {groups.map((group, groupIndex) => {
        const completedInGroup = group.lessons.filter((entry) => completed[entry.lesson.id]).length;
        return (
          <details
            key={group.chapter + groupIndex}
            open={groupIndex === nextGroupIndex}
            className="group bg-card border-border rounded-2xl border"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 select-none">
              <div className="flex items-center gap-3">
                <span className="bg-muted text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                  {groupIndex + 1}
                </span>
                <div>
                  <p className="text-foreground text-sm font-semibold">{group.chapter}</p>
                  <p className="text-muted-foreground text-xs">
                    {completedInGroup}/{group.lessons.length} lessons
                  </p>
                </div>
              </div>
              <ChevronDown size={16} className="text-muted-foreground shrink-0 group-open:rotate-180" />
            </summary>
            <div className="border-border divide-border divide-y border-t">
              {group.lessons.map((entry) => (
                <LessonRow
                  key={entry.lesson.id}
                  courseId={course.id}
                  entry={entry}
                  status={
                    completed[entry.lesson.id] ? "done" : entry.lesson.id === nextLessonId ? "current" : "locked"
                  }
                />
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}

function CourseDetail({ course }: { course: Course }) {
  const completed = useLessonProgress((state) => state.completed);
  const track = activeTrack(course);
  const progress = courseProgress(course, completed);
  const percent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
  const isComplete = progress.total > 0 && progress.completed === progress.total;
  const isStarted = progress.completed > 0;
  const next = nextLessonFor(course, completed);
  const lessons = flattenTrack(track);

  const otherTracks = course.tracks.filter((t) => t.level !== track.level);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="bg-muted flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-3xl leading-none">
            {course.flagEmoji}
          </span>
          <div>
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">{course.language}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                  levelStyles[track.level],
                )}
              >
                {track.level}
              </span>
              <span className="text-muted-foreground text-sm">{course.description}</span>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl border px-3.5 py-2",
            levelStyles[track.level],
          )}
        >
          <span className="text-[10px] font-medium tracking-wide uppercase opacity-70">Level</span>
          <span className="text-sm font-bold">{track.cefr}</span>
        </div>
      </div>

      <div className="bg-card border-border rounded-2xl border p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground text-sm font-semibold">Overall progress</p>
            <p className="text-muted-foreground text-xs">
              {progress.completed} of {progress.total} lessons across 1 level
            </p>
          </div>
          <span className="text-foreground text-xl font-bold tracking-tight">{percent}%</span>
        </div>
        <div className="bg-muted mt-3 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className={cn("h-full rounded-full", isComplete ? "bg-success" : "bg-primary")}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-foreground text-sm font-semibold capitalize">
            {track.level}
            {isStarted && !isComplete && (
              <span className="text-primary ml-2 text-xs font-medium">Recommended for you</span>
            )}
          </p>
          <p className="text-muted-foreground text-xs">
            {track.chapters.length} chapters · {progress.total} lessons
            {next && !isComplete && (
              <>
                {" "}
                · Next: <span className="text-foreground font-medium">{next.lesson.title}</span>
              </>
            )}
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href={`/courses/${course.id}/learn${next ? `?lesson=${next.lesson.id}` : ""}`}>
            {isComplete ? "Review" : isStarted ? "Resume" : "Start"} <ArrowRight size={14} />
          </Link>
        </Button>
      </div>

      <CourseOutline
        course={course}
        lessons={lessons}
        completed={completed}
        nextLessonId={next?.lesson.id}
      />

      {otherTracks.length > 0 && (
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Other levels</p>
          <div className="flex flex-wrap gap-2">
            {otherTracks.map((otherTrack) => (
              <div
                key={otherTrack.level}
                className="border-border text-muted-foreground flex items-center gap-2 rounded-full border border-dashed px-3.5 py-2 text-sm"
              >
                <Lock size={13} />
                <span className="capitalize">{otherTrack.level}</span>
                <span className="text-xs">({otherTrack.cefr})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CoursesPage() {
  const { courses, loading } = useCourses();
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeCourse = courses.find((course) => course.id === activeId) ?? courses[0];

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading courses…</p>;
  }

  if (!activeCourse) {
    return <p className="text-muted-foreground text-sm">No courses available yet.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-muted-foreground text-sm">Pick a language and keep your streak going.</p>
        <SwitchCourseDialog courses={courses} activeId={activeCourse.id} onConfirm={setActiveId} />
      </div>

      <CourseDetail course={activeCourse} />
    </div>
  );
}
