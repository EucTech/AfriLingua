import type { CourseLevel } from "@/types/course";

export type MatchRequestStatus = "none" | "pending" | "accepted" | "declined";

export interface TandemPartner {
  id: string;
  name: string;
  initials: string;
  country: string;
  speaks: string[];
  learning: string[];
  proficiency: CourseLevel;
  availability: string[];
}

export interface IncomingMatchRequest {
  id: string;
  name: string;
  initials: string;
  country: string;
  message: string;
}
