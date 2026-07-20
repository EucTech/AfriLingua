export type NotificationType = "message" | "match" | "reminder";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timeAgo: string;
  read: boolean;
}
