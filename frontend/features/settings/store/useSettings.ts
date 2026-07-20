import { create } from "zustand";
import type { AccessibilityPreferences, NotificationPreferences } from "@/types/settings";

interface SettingsState {
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
  setNotifications: (patch: Partial<NotificationPreferences>) => void;
  setAccessibility: (patch: Partial<AccessibilityPreferences>) => void;
}

export const useSettings = create<SettingsState>((set) => ({
  notifications: {
    messages: true,
    matches: true,
    reminders: true,
    quietHoursEnabled: false,
    quietHoursStart: "21:00",
    quietHoursEnd: "07:00",
  },
  accessibility: {
    interfaceLanguage: "English",
    liteMode: false,
  },
  setNotifications: (patch) =>
    set((state) => ({ notifications: { ...state.notifications, ...patch } })),
  setAccessibility: (patch) =>
    set((state) => ({ accessibility: { ...state.accessibility, ...patch } })),
}));
