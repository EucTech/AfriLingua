import { create } from "zustand";
import { initialNotifications } from "@/features/notifications/data/notifications";
import type { NotificationItem } from "@/types/notification";

interface NotificationState {
  items: NotificationItem[];
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotifications = create<NotificationState>((set) => ({
  items: initialNotifications,
  markRead: (id) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    })),
  markAllRead: () =>
    set((state) => ({ items: state.items.map((item) => ({ ...item, read: true })) })),
}));
