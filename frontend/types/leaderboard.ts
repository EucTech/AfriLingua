export interface LeaderboardEntry {
  id: string;
  name: string;
  initials: string;
  xp: number;
  streakDays: number;
  isCurrentUser?: boolean;
}
