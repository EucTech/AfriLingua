import { create } from "zustand";
import { api } from "@/lib/api";
import type { AccessibilityPreferences, NotificationPreferences } from "@/types/settings";

const defaultNotifications: NotificationPreferences = {
  messages: true,
  matches: true,
  reminders: true,
  quietHoursEnabled: false,
  quietHoursStart: "21:00",
  quietHoursEnd: "07:00",
};

const defaultAccessibility: AccessibilityPreferences = {
  interfaceLanguage: "English",
  liteMode: false,
};

interface SettingsState {
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
  loaded: boolean;
  load: () => Promise<void>;
  setNotifications: (patch: Partial<NotificationPreferences>) => void;
  setAccessibility: (patch: Partial<AccessibilityPreferences>) => void;
}

interface MeResponse {
  notificationPreferences: NotificationPreferences | null;
  accessibilityPreferences: AccessibilityPreferences | null;
}

export const useSettings = create<SettingsState>((set, get) => ({
  notifications: defaultNotifications,
  accessibility: defaultAccessibility,
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    const me = await api.get<MeResponse>("/users/me");
    set({
      notifications: me.notificationPreferences ?? defaultNotifications,
      accessibility: me.accessibilityPreferences ?? defaultAccessibility,
      loaded: true,
    });
  },
  setNotifications: (patch) => {
    set((state) => ({ notifications: { ...state.notifications, ...patch } }));
    void api.patch("/users/me/notification-preferences", patch);
  },
  setAccessibility: (patch) => {
    set((state) => ({ accessibility: { ...state.accessibility, ...patch } }));
    void api.patch("/users/me/accessibility-preferences", patch);
  },
}));
