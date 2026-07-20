import { create } from "zustand";
import type { MatchRequestStatus } from "@/types/match";

interface MatchRequestState {
  outgoing: Record<string, MatchRequestStatus>;
  send: (partnerId: string) => void;
  statusFor: (partnerId: string) => MatchRequestStatus;
}

export const useMatchRequests = create<MatchRequestState>((set, get) => ({
  outgoing: {},
  send: (partnerId) =>
    set((state) => ({ outgoing: { ...state.outgoing, [partnerId]: "pending" } })),
  statusFor: (partnerId) => get().outgoing[partnerId] ?? "none",
}));
