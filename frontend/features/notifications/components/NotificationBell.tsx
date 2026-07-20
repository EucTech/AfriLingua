"use client";

import { Bell, MessageCircle, Users, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/features/notifications/store/useNotifications";
import type { NotificationType } from "@/types/notification";

const typeIcons: Record<NotificationType, typeof MessageCircle> = {
  message: MessageCircle,
  match: Users,
  reminder: Flame,
};

export function NotificationBell() {
  const items = useNotifications((state) => state.items);
  const markRead = useNotifications((state) => state.markRead);
  const markAllRead = useNotifications((state) => state.markAllRead);
  const unreadCount = items.filter((item) => !item.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="bg-accent text-accent-foreground absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <p className="text-foreground text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-primary text-xs font-medium hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 && (
            <p className="text-muted-foreground p-4 text-sm">You&apos;re all caught up.</p>
          )}
          {items.map((item) => {
            const Icon = typeIcons[item.type];
            return (
              <button
                key={item.id}
                onClick={() => markRead(item.id)}
                className={cn(
                  "border-border/60 flex w-full items-start gap-3 border-b px-4 py-3 text-left last:border-b-0",
                  item.read ? "bg-transparent" : "bg-primary/5",
                )}
              >
                <span className="bg-muted text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <Icon size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-foreground block text-sm font-medium">{item.title}</span>
                  <span className="text-muted-foreground block truncate text-xs">{item.body}</span>
                  <span className="text-muted-foreground block text-[11px]">{item.timeAgo}</span>
                </span>
                {!item.read && <span className="bg-accent mt-1 h-2 w-2 shrink-0 rounded-full" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
