"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CourseLevel } from "@/types/course";
import type { MeResponse } from "@/features/profile/types";
import { useMe, ME_QUERY_KEY } from "@/features/profile/hooks/useMe";
import { LanguagesCard, LanguagesSkeleton } from "@/features/profile/components/LanguagesCard";
import { GoalsCard, GoalsSkeleton } from "@/features/profile/components/GoalsCard";

export function LanguageProfileView() {
  const { data: me, isLoading, isError } = useMe();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isError) toast.error("Couldn't load your language profile.");
  }, [isError]);

  if (isLoading || !me) {
    return (
      <>
        <LanguagesSkeleton />
        <GoalsSkeleton />
      </>
    );
  }

  const languageProfile = me.languageProfile;
  const spokenLanguages = languageProfile?.spokenLanguages.length ? languageProfile.spokenLanguages : ["English"];
  const targetLanguages = languageProfile?.targetLanguages.length ? languageProfile.targetLanguages : ["Swahili"];
  const proficiency = languageProfile?.proficiency ?? "beginner";
  const goals = languageProfile?.goals ?? [];

  const patchLanguageProfile = (patch: Partial<NonNullable<MeResponse["languageProfile"]>>) => {
    queryClient.setQueryData<MeResponse>(ME_QUERY_KEY, (old) =>
      old
        ? {
            ...old,
            languageProfile: {
              spokenLanguages: old.languageProfile?.spokenLanguages ?? [],
              targetLanguages: old.languageProfile?.targetLanguages ?? [],
              proficiency: old.languageProfile?.proficiency ?? "beginner",
              goals: old.languageProfile?.goals ?? [],
              ...patch,
            },
          }
        : old,
    );
  };

  return (
    <>
      <LanguagesCard
        spokenLanguages={spokenLanguages}
        targetLanguages={targetLanguages}
        onSaved={(data) => patchLanguageProfile(data)}
      />
      <GoalsCard
        proficiency={proficiency as CourseLevel}
        goals={goals}
        onSaved={(data) => patchLanguageProfile(data)}
      />
    </>
  );
}
