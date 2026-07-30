export interface AccountProfile {
  id: string;
  name: string;
  email: string;
  initials: string;
  country: string | null;
  bio: string | null;
  address: string | null;
  avatarUrl: string | null;
  xp: number;
  streakDays: number;
}
