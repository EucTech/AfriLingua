"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { CourseLevel } from "@/types/course";
import { LanguagesCard, LanguagesSkeleton } from "@/features/profile/components/LanguagesCard";
import { GoalsCard, GoalsSkeleton } from "@/features/profile/components/GoalsCard";

interface LanguageProfileDto {
  spokenLanguages: string[];
  targetLanguages: string[];
  proficiency: CourseLevel;
  goals: string[];
}

interface MeResponse {
  languageProfile: LanguageProfileDto | null;
}

export function LanguageProfileView() {
  const [spokenLanguages, setSpokenLanguages] = useState<string[]>([]);
  const [targetLanguages, setTargetLanguages] = useState<string[]>([]);
  const [proficiency, setProficiency] = useState<CourseLevel>("beginner");
  const [goals, setGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<MeResponse>("/users/me")
      .then((me) => {
        if (!me.languageProfile) {
          setSpokenLanguages(["English"]);
          setTargetLanguages(["Swahili"]);
          return;
        }
        setSpokenLanguages(me.languageProfile.spokenLanguages);
        setTargetLanguages(me.languageProfile.targetLanguages);
        setProficiency(me.languageProfile.proficiency);
        setGoals(me.languageProfile.goals);
      })
      .catch(() => toast.error("Couldn't load your language profile."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <LanguagesSkeleton />
        <GoalsSkeleton />
      </>
    );
  }

  return (
    <>
      <LanguagesCard
        spokenLanguages={spokenLanguages}
        targetLanguages={targetLanguages}
        onSaved={(data) => {
          setSpokenLanguages(data.spokenLanguages);
          setTargetLanguages(data.targetLanguages);
        }}
      />
      <GoalsCard
        proficiency={proficiency}
        goals={goals}
        onSaved={(data) => {
          setProficiency(data.proficiency);
          setGoals(data.goals);
        }}
      />
    </>
  );
}
