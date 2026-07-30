import type { CourseLevel } from "@/types/course";

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

export interface LanguageProfileDto {
  spokenLanguages: string[];
  targetLanguages: string[];
  proficiency: CourseLevel;
  goals: string[];
}

export interface MeResponse extends AccountProfile {
  languageProfile: LanguageProfileDto | null;
}
