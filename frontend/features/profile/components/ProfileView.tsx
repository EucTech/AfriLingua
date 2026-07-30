"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { AccountProfile } from "@/features/profile/types";
import { AccountSummaryCard, AccountSummarySkeleton } from "@/features/profile/components/AccountSummaryCard";
import { AboutCard, AboutSkeleton } from "@/features/profile/components/AboutCard";
import { LanguageProfileView } from "@/features/profile/components/LanguageProfileView";

export function ProfileView() {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AccountProfile>("/users/me")
      .then(setProfile)
      .catch(() => toast.error("Couldn't load your account details."))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !profile) {
    return (
      <>
        <AccountSummarySkeleton />
        <AboutSkeleton />
      </>
    );
  }

  return (
    <>
      <AccountSummaryCard profile={profile} onProfileChange={setProfile} />
      <AboutCard profile={profile} onProfileChange={setProfile} />
      <LanguageProfileView />
    </>
  );
}
