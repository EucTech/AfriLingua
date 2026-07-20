import type { CourseLevel } from "@/types/course";

export interface LanguageProfile {
  spokenLanguages: string[];
  targetLanguages: string[];
  proficiency: CourseLevel;
  goals: string[];
}
