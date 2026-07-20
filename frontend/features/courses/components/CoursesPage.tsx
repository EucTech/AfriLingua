import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { courses } from "@/features/courses/data/courses";
import type { Course, CourseLevel } from "@/types/course";

const levelStyles: Record<CourseLevel, string> = {
  beginner: "bg-success/10 text-success",
  intermediate: "bg-info/10 text-info",
  advanced: "bg-accent/10 text-accent",
};

function CourseCard({ course }: { course: Course }) {
  const progress = Math.round((course.completedLessons / course.totalLessons) * 100);
  const isComplete = course.completedLessons === course.totalLessons;
  const isStarted = course.completedLessons > 0;

  return (
    <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{course.flagEmoji}</span>
          <div>
            <h3 className="text-foreground text-base font-semibold tracking-tight">
              {course.language}
            </h3>
            <p className="text-muted-foreground text-xs">{course.nativeName}</p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
            levelStyles[course.level],
          )}
        >
          {course.level}
        </span>
      </div>

      <p className="text-muted-foreground text-sm">{course.description}</p>

      <div className="space-y-1.5">
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>
            {course.completedLessons}/{course.totalLessons} lessons
          </span>
          {isComplete && (
            <span className="text-success flex items-center gap-1 font-medium">
              <CheckCircle2 size={14} /> Completed
            </span>
          )}
        </div>
        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
          <div
            className={cn("h-full rounded-full", isComplete ? "bg-success" : "bg-primary")}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Button variant={isComplete ? "secondary" : isStarted ? "default" : "outline"} className="mt-auto">
        {isComplete ? "Review course" : isStarted ? "Continue" : "Start course"}
      </Button>
    </div>
  );
}

export function CoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">Courses</h1>
        <p className="text-muted-foreground text-sm">
          Pick a language and keep your streak going.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
