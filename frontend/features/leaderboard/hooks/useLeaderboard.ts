"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { LeaderboardEntry } from "@/types/leaderboard";

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get<LeaderboardEntry[]>("/leaderboard")
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { entries, loading };
}
