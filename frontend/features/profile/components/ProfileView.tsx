"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AccountProfile, MeResponse } from "@/features/profile/types";
import { useMe, ME_QUERY_KEY } from "@/features/profile/hooks/useMe";
import { AccountSummaryCard, AccountSummarySkeleton } from "@/features/profile/components/AccountSummaryCard";
import { AboutCard, AboutSkeleton } from "@/features/profile/components/AboutCard";
import { LanguageProfileView } from "@/features/profile/components/LanguageProfileView";

export function ProfileView() {
  const { data: profile, isLoading, isError } = useMe();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isError) toast.error("Couldn't load your account details.");
  }, [isError]);

  if (isLoading || !profile) {
    return (
      <>
        <AccountSummarySkeleton />
        <AboutSkeleton />
      </>
    );
  }

  const handleProfileChange = (updated: AccountProfile) => {
    queryClient.setQueryData<MeResponse>(ME_QUERY_KEY, (old) => (old ? { ...old, ...updated } : old));
  };

  return (
    <>
      <AccountSummaryCard profile={profile} onProfileChange={handleProfileChange} />
      <AboutCard profile={profile} onProfileChange={handleProfileChange} />
      <LanguageProfileView />
    </>
  );
}
