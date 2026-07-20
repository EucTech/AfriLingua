import { Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { leaderboard } from "@/features/leaderboard/data/leaderboard";
import type { LeaderboardEntry } from "@/types/leaderboard";

const rankBadgeStyles = ["bg-accent text-accent-foreground", "bg-muted text-foreground", "bg-muted text-foreground"];

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
          rankBadgeStyles[rank - 1],
        )}
      >
        {rank}
      </span>
    );
  }
  return (
    <span className="text-muted-foreground flex h-8 w-8 items-center justify-center text-sm font-medium">
      {rank}
    </span>
  );
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  return (
    <li
      className={cn(
        "flex items-center gap-4 rounded-xl border px-4 py-3",
        entry.isCurrentUser ? "bg-primary/5 border-primary/30" : "bg-card border-border",
      )}
    >
      <RankBadge rank={rank} />

      <div className="bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
        {entry.initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-medium">
          {entry.name}
          {entry.isCurrentUser && <span className="text-muted-foreground font-normal"> (you)</span>}
        </p>
      </div>

      <div className="text-accent flex items-center gap-1 text-xs font-medium">
        <Flame size={14} />
        {entry.streakDays}
      </div>

      <div className="text-foreground w-16 text-right text-sm font-semibold">{entry.xp} XP</div>
    </li>
  );
}

export function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Trophy className="text-accent" size={22} />
        <div>
          <h1 className="text-foreground text-xl font-semibold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground text-sm">This week&apos;s top learners.</p>
        </div>
      </div>

      <ul className="space-y-2">
        {leaderboard.map((entry, index) => (
          <LeaderboardRow key={entry.id} entry={entry} rank={index + 1} />
        ))}
      </ul>
    </div>
  );
}
