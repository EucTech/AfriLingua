"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCourses } from "@/features/courses/hooks/useCourses";
import { activeTrack, flattenTrack, lessonAt, nextLessonFor } from "@/features/courses/lib/progress";
import { useLessonProgress } from "@/features/courses/store/useLessonProgress";

type Step = "video" | "words" | "quiz" | "done";

export function LessonPlayer({ courseId }: { courseId: string }) {
  const { courses, loading } = useCourses();
  const course = courses.find((c) => c.id === courseId);
  const completed = useLessonProgress((state) => state.completed);
  const complete = useLessonProgress((state) => state.complete);
  const searchParams = useSearchParams();
  const requestedLessonId = searchParams.get("lesson");

  const track = course ? activeTrack(course) : null;
  const lessons = track ? flattenTrack(track) : [];

  const [overrideLessonId, setOverrideLessonId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("video");
  const [wordIndex, setWordIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const initialLessonId = course
    ? requestedLessonId && lessons.some((entry) => entry.lesson.id === requestedLessonId)
      ? requestedLessonId
      : (nextLessonFor(course, completed)?.lesson.id ?? lessons[0]?.lesson.id ?? null)
    : null;
  const lessonId = overrideLessonId ?? initialLessonId;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl animate-pulse space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-muted h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="bg-muted h-3 w-24 rounded" />
            <div className="bg-muted h-4 w-40 rounded" />
          </div>
        </div>
        <div className="bg-muted h-1.5 w-full rounded-full" />
        <div className="bg-card border-border h-72 rounded-2xl border" />
      </div>
    );
  }

  if (!course || !track) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">Course not found.</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/courses">Back to courses</Link>
        </Button>
      </div>
    );
  }

  const position = lessonId ? lessonAt(course, lessonId) : null;
  if (!position) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">Lesson not found.</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/courses">Back to courses</Link>
        </Button>
      </div>
    );
  }

  const { entry, position: lessonPosition, total } = position;
  const lesson = entry.lesson;
  const word = lesson.words[wordIndex];
  const question = lesson.quiz[quizIndex];
  const score = lesson.quiz.filter((q) => answers[q.id] === q.correctIndex).length;

  const resetToLesson = (nextLessonId: string) => {
    setOverrideLessonId(nextLessonId);
    setStep("video");
    setWordIndex(0);
    setRevealed(false);
    setQuizIndex(0);
    setAnswers({});
  };

  const finishLesson = () => {
    void complete(lesson.id);
    setStep("done");
  };

  const updatedCompleted = { ...completed, [lesson.id]: true };
  const upcoming = nextLessonFor(course, updatedCompleted);
  const hasNextLesson = Boolean(upcoming && upcoming.lesson.id !== lesson.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/courses"
          className="border-border text-muted-foreground hover:border-foreground/15 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors"
          aria-label="Back to courses"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs">{entry.chapter}</p>
          <p className="text-foreground truncate text-sm font-semibold">{lesson.title}</p>
        </div>
        <span className="text-muted-foreground shrink-0 text-xs">
          Lesson {lessonPosition + 1} of {total}
        </span>
      </div>

      <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all"
          style={{ width: `${((lessonPosition + (step === "done" ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      {step === "video" && (
        <div className="bg-card border-border space-y-5 rounded-2xl border p-6">
          <video
            key={lesson.id}
            src={lesson.videoUrl}
            controls
            playsInline
            className="aspect-video w-full rounded-2xl bg-black object-cover"
          />
          <div>
            <p className="text-foreground text-sm font-semibold">{lesson.videoTitle}</p>
            <p className="text-muted-foreground text-xs">{lesson.videoMinutes} min video</p>
          </div>
          <Button className="w-full" onClick={() => setStep("words")}>
            Continue to new words <ArrowRight size={14} />
          </Button>
        </div>
      )}

      {step === "words" && (
        <div className="bg-card border-border space-y-5 rounded-2xl border p-6">
          <button
            onClick={() => setRevealed((prev) => !prev)}
            className="bg-muted hover:bg-muted/70 flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl px-6 text-center transition-colors"
          >
            <p className="text-foreground text-2xl font-semibold">{word.word}</p>
            {revealed ? (
              <p className="text-primary text-base font-medium">{word.translation}</p>
            ) : (
              <p className="text-muted-foreground text-xs">Tap to reveal meaning</p>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5">
            {lesson.words.map((w, i) => (
              <span
                key={w.id}
                className={cn("h-1.5 w-1.5 rounded-full", i === wordIndex ? "bg-primary" : "bg-muted")}
              />
            ))}
          </div>

          <Button
            className="w-full"
            onClick={() => {
              if (wordIndex < lesson.words.length - 1) {
                setWordIndex((prev) => prev + 1);
                setRevealed(false);
              } else {
                setStep("quiz");
              }
            }}
          >
            {wordIndex < lesson.words.length - 1 ? "Next word" : "Continue to quiz"} <ArrowRight size={14} />
          </Button>
        </div>
      )}

      {step === "quiz" && question && (
        <div className="bg-card border-border space-y-5 rounded-2xl border p-6">
          <div>
            <p className="text-muted-foreground text-xs">
              Question {quizIndex + 1} of {lesson.quiz.length}
            </p>
            <p className="text-foreground mt-1 text-base font-semibold">{question.prompt}</p>
          </div>

          <div className="space-y-2">
            {question.options.map((option, i) => {
              const selected = answers[question.id];
              const isSelected = selected === i;
              const isCorrect = i === question.correctIndex;
              const showResult = selected !== undefined;

              return (
                <button
                  key={option}
                  disabled={showResult}
                  onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: i }))}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                    !showResult && "border-border hover:border-foreground/15",
                    showResult && isCorrect && "border-success bg-success/10 text-success",
                    showResult &&
                      isSelected &&
                      !isCorrect &&
                      "border-destructive bg-destructive/10 text-destructive",
                    showResult && !isSelected && !isCorrect && "border-border opacity-50",
                  )}
                >
                  {option}
                  {showResult && isCorrect && <CheckCircle2 size={16} />}
                  {showResult && isSelected && !isCorrect && <XCircle size={16} />}
                </button>
              );
            })}
          </div>

          <Button
            className="w-full"
            disabled={answers[question.id] === undefined}
            onClick={() => {
              if (quizIndex < lesson.quiz.length - 1) {
                setQuizIndex((prev) => prev + 1);
              } else {
                finishLesson();
              }
            }}
          >
            {quizIndex < lesson.quiz.length - 1 ? "Next question" : "Finish lesson"} <ArrowRight size={14} />
          </Button>
        </div>
      )}

      {step === "done" && (
        <div className="bg-card border-border space-y-5 rounded-2xl border p-8 text-center">
          <div className="bg-success/10 text-success mx-auto flex h-14 w-14 items-center justify-center rounded-full">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h2 className="text-foreground text-lg font-semibold tracking-tight">Lesson complete!</h2>
            <p className="text-muted-foreground text-sm">
              You scored {score}/{lesson.quiz.length} on the quiz.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            {hasNextLesson && upcoming && (
              <Button onClick={() => resetToLesson(upcoming.lesson.id)}>
                Next lesson <ArrowRight size={14} />
              </Button>
            )}
            <Button variant={hasNextLesson ? "outline" : "default"} asChild>
              <Link href="/courses">Back to courses</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
