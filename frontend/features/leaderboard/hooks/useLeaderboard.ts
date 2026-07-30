"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LeaderboardEntry } from "@/types/leaderboard";

export function useLeaderboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => api.get<LeaderboardEntry[]>("/leaderboard"),
  });

  return { entries: data ?? [], loading: isLoading };
}
