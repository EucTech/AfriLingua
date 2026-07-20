import type { NotificationItem } from "@/types/notification";

export const initialNotifications: NotificationItem[] = [
  {
    id: "n1",
    type: "match",
    title: "New tandem request",
    body: "Kwame Mensah wants to practice Swahili with you.",
    timeAgo: "5m ago",
    read: false,
  },
  {
    id: "n2",
    type: "message",
    title: "New message",
    body: "Fatima Bello sent you a message.",
    timeAgo: "1h ago",
    read: false,
  },
  {
    id: "n3",
    type: "reminder",
    title: "Keep your streak alive",
    body: "You haven't practiced Swahili today.",
    timeAgo: "3h ago",
    read: true,
  },
  {
    id: "n4",
    type: "match",
    title: "Request accepted",
    body: "Thandiwe Nkosi accepted your tandem request.",
    timeAgo: "1d ago",
    read: true,
  },
];
