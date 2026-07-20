import Link from "next/link";
import { Flame, Trophy, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { courses } from "@/features/courses/data/courses";
import { leaderboard } from "@/features/leaderboard/data/leaderboard";

export default function DashboardPage() {
  const currentUser = leaderboard.find((entry) => entry.isCurrentUser);
  const rank = leaderboard.findIndex((entry) => entry.isCurrentUser) + 1;
  const activeCourse = courses.find(
    (course) => course.completedLessons > 0 && course.completedLessons < course.totalLessons,
  );
  const progress = activeCourse
    ? Math.round((activeCourse.completedLessons / activeCourse.totalLessons) * 100)
    : 0;

  const stats = [
    { label: "Day streak", value: currentUser?.streakDays ?? 0, icon: Flame },
    { label: "Total XP", value: currentUser?.xp ?? 0, icon: Zap },
    { label: "Leaderboard rank", value: `#${rank}`, icon: Trophy },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          Welcome back, {currentUser?.name.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-muted-foreground text-sm">Here&apos;s where you left off.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-card border-border flex items-center gap-3 rounded-xl border p-5 shadow-sm"
          >
            <div className="bg-accent/10 text-accent flex h-10 w-10 items-center justify-center rounded-full">
              <Icon size={18} />
            </div>
            <div>
              <p className="text-foreground text-lg font-semibold">{value}</p>
              <p className="text-muted-foreground text-xs">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {activeCourse && (
        <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none">{activeCourse.flagEmoji}</span>
              <div>
                <p className="text-muted-foreground text-xs">Continue learning</p>
                <h2 className="text-foreground text-base font-semibold tracking-tight">
                  {activeCourse.language}
                </h2>
              </div>
            </div>
            <Button asChild size="sm">
              <Link href="/courses">
                Resume <ArrowRight size={14} />
              </Link>
            </Button>
          </div>

          <div className="mt-4 space-y-1.5">
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>
                {activeCourse.completedLessons}/{activeCourse.totalLessons} lessons
              </span>
              <span>{progress}%</span>
            </div>
            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
              <div className="bg-primary h-full rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border-border rounded-xl border p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-foreground text-base font-semibold tracking-tight">Top learners</h2>
          <Link href="/leaderboard" className="text-primary text-xs font-medium hover:underline">
            View all
          </Link>
        </div>
        <ul className="space-y-2">
          {leaderboard.slice(0, 3).map((entry, index) => (
            <li key={entry.id} className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground w-4 text-xs font-medium">{index + 1}</span>
              <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white">
                {entry.initials}
              </div>
              <span className="text-foreground flex-1 truncate">{entry.name}</span>
              <span className="text-muted-foreground text-xs">{entry.xp} XP</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
