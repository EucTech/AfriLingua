import { create } from "zustand";
import { api } from "@/lib/api";
import type { NotificationType } from "@/types/notification";

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  items: NotificationDto[];
  loaded: boolean;
  load: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotifications = create<NotificationState>((set, get) => ({
  items: [],
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    const items = await api.get<NotificationDto[]>("/notifications");
    set({ items, loaded: true });
  },
  markRead: async (id) => {
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    }));
    await api.patch(`/notifications/${id}/read`);
  },
  markAllRead: async () => {
    set((state) => ({ items: state.items.map((item) => ({ ...item, read: true })) }));
    await api.patch("/notifications/read-all");
  },
}));
