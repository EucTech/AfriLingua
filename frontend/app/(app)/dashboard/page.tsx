"use client";

import Link from "next/link";
import { Flame, Trophy, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCourses } from "@/features/courses/hooks/useCourses";
import { courseProgress } from "@/features/courses/lib/progress";
import { useLessonProgress } from "@/features/courses/store/useLessonProgress";
import { useLeaderboard } from "@/features/leaderboard/hooks/useLeaderboard";
import { useAuth } from "@/features/auth/store/useAuth";

const statToneStyles = {
  accent: "text-accent",
  info: "text-info",
  success: "text-success",
} as const;

function StatsSkeleton() {
  return (
    <div className="bg-card border-border animate-pulse rounded-2xl border">
      <div className="divide-border grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-2 p-6">
            <div className="bg-muted h-3 w-24 rounded" />
            <div className="bg-muted h-8 w-12 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TopLearnersSkeleton() {
  return (
    <div className="bg-card border-border animate-pulse rounded-2xl border p-6">
      <div className="bg-muted mb-4 h-5 w-28 rounded" />
      <div className="divide-border divide-y">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <div className="bg-muted h-3 w-3 rounded" />
            <div className="bg-muted h-8 w-8 shrink-0 rounded-full" />
            <div className="bg-muted h-3 flex-1 rounded" />
            <div className="bg-muted h-3 w-10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuth((state) => state.user);
  const { courses, loading: coursesLoading } = useCourses();
  const lessonCompletion = useLessonProgress((state) => state.completed);
  const { entries: leaderboard, loading: leaderboardLoading } = useLeaderboard();

  const rank = leaderboard.findIndex((entry) => entry.isCurrentUser) + 1;
  const activeCourse = courses.find((course) => {
    const { completed, total } = courseProgress(course, lessonCompletion);
    return completed > 0 && completed < total;
  });
  const activeProgress = activeCourse ? courseProgress(activeCourse, lessonCompletion) : null;
  const progress =
    activeProgress && activeProgress.total > 0
      ? Math.round((activeProgress.completed / activeProgress.total) * 100)
      : 0;

  const stats = [
    { label: "Day streak", value: user?.streakDays ?? 0, icon: Flame, tone: "accent" as const },
    { label: "Total XP", value: user?.xp ?? 0, icon: Zap, tone: "info" as const },
    { label: "Leaderboard rank", value: rank > 0 ? `#${rank}` : "—", icon: Trophy, tone: "success" as const },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Welcome back, {user?.name.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Here&apos;s where you left off.</p>
      </div>

      {leaderboardLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="bg-card border-border rounded-2xl border">
          <div className="divide-border grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="flex flex-col gap-2 p-6">
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
                  <Icon size={13} className={statToneStyles[tone]} />
                  {label}
                </div>
                <p className="text-foreground text-3xl font-semibold tracking-tight">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {coursesLoading ? (
        <div className="bg-card border-border animate-pulse rounded-2xl border p-6">
          <div className="flex items-center gap-3.5">
            <div className="bg-muted h-12 w-12 shrink-0 rounded-full" />
            <div className="space-y-2">
              <div className="bg-muted h-3 w-28 rounded" />
              <div className="bg-muted h-4 w-20 rounded" />
            </div>
          </div>
          <div className="bg-muted mt-6 h-1.5 w-full rounded-full" />
        </div>
      ) : (
        activeCourse && (
          <div className="bg-card border-border rounded-2xl border p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <span className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl leading-none">
                  {activeCourse.flagEmoji}
                </span>
                <div>
                  <p className="text-muted-foreground text-xs">Continue learning</p>
                  <h2 className="text-foreground text-lg font-semibold tracking-tight">
                    {activeCourse.language}
                  </h2>
                </div>
              </div>
              <Button asChild size="sm">
                <Link href={`/courses/${activeCourse.id}/learn`}>
                  Resume <ArrowRight size={14} />
                </Link>
              </Button>
            </div>

            <div className="mt-6 space-y-2">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>
                  {activeProgress?.completed}/{activeProgress?.total} lessons
                </span>
                <span className="text-foreground font-medium">{progress}%</span>
              </div>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                <div className="bg-primary h-full rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        )
      )}

      {leaderboardLoading ? (
        <TopLearnersSkeleton />
      ) : (
        <div className="bg-card border-border rounded-2xl border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold tracking-tight">Top learners</h2>
            <Link href="/leaderboard" className="text-primary text-xs font-medium hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-border divide-y">
            {leaderboard.slice(0, 3).map((entry, index) => (
              <li key={entry.id} className="flex items-center gap-4 py-3 text-sm">
                <span className="text-muted-foreground w-3 text-sm font-semibold tabular-nums">
                  {index + 1}
                </span>
                <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
                  {entry.initials}
                </div>
                <span className="text-foreground flex-1 truncate font-medium">{entry.name}</span>
                <span className="text-muted-foreground text-xs">{entry.xp} XP</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
