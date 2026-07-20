"use client";

import React from "react";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-background sticky top-0 z-40 px-3 pt-2">
      <div
        className={cn(
          "flex items-center justify-between py-2.5 px-3 sm:px-4 md:px-6",
          "bg-card border-border rounded-t-xl border",
        )}
      >
        <div className="flex flex-1 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="bg-muted hover:bg-muted/70 flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
          >
            <Menu size={18} className="text-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
