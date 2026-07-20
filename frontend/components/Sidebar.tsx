"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  MessageCircle,
  BookOpen,
  Trophy,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItemType {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
}

const menuItems: MenuItemType[] = [
  { id: "home", label: "Home", icon: Home, path: "/dashboard" },
  { id: "chats", label: "Chats", icon: MessageCircle, path: "/chats" },
  { id: "courses", label: "Courses", icon: BookOpen, path: "/courses" },
  { id: "matches", label: "Tandem partners", icon: Users, path: "/matches" },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
];

const bottomMenuItems: MenuItemType[] = [
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

const placeholderUser = {
  name: "Guest User",
  initials: "GU",
};

function renderMenuItem(
  item: MenuItemType,
  isActive: boolean,
  isCollapsed: boolean,
  compact: boolean,
  onNavigate: (path: string) => void,
) {
  const Icon = item.icon;

  return (
    <div key={item.id} className="relative mb-0.5">
      {isActive && (
        <div
          className="bg-primary absolute top-1/2 z-10 h-5 w-1 -translate-y-1/2 rounded-r"
          style={{ left: compact ? "-6px" : isCollapsed ? "-10px" : "-16px" }}
        />
      )}
      <button
        onClick={() => onNavigate(item.path)}
        className={cn(
          "flex w-full items-center rounded-lg transition-all",
          compact
            ? "justify-center px-1.5 py-1.5"
            : isCollapsed
              ? "justify-center gap-3 px-2.5 py-2"
              : "justify-start gap-3 px-3 py-2",
          isActive
            ? "bg-primary/5 dark:bg-primary/10"
            : "hover:bg-black/3 dark:hover:bg-white/4",
        )}
      >
        <span className={cn("relative shrink-0", isCollapsed ? "" : "flex w-8 justify-center")}>
          <Icon size={20} className={isActive ? "text-primary" : "text-muted-foreground"} />
        </span>
        {!isCollapsed && (
          <span
            className={cn(
              "truncate text-[13px] tracking-tight",
              isActive ? "text-primary font-semibold" : "text-muted-foreground font-medium",
            )}
          >
            {item.label}
          </span>
        )}
      </button>
    </div>
  );
}

export function Sidebar({ open, onClose, collapsed }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
    if (open) onClose();
  };

  const isItemActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const renderSidebarContent = (isCollapsed: boolean, compact = false) => (
    <>
      <div
        onClick={() => handleNavigation("/dashboard")}
        className={cn(
          "flex cursor-pointer items-center justify-center",
          compact ? "px-1.5 pt-6 pb-3" : isCollapsed ? "p-4 pt-4" : "p-5 pt-4",
        )}
      >
        {isCollapsed && !compact ? (
          <span className="bg-primary flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold text-white">
            A
          </span>
        ) : (
          <span className="text-primary text-lg font-bold tracking-tight">AfriLingua</span>
        )}
      </div>

      <div className={cn("border-border mx-auto border-t", compact ? "mb-2 w-[80%]" : "mb-3 w-[85%]")} />

      <div
        className={cn(
          "scrollbar flex-1 overflow-y-auto",
          compact ? "px-1.5" : isCollapsed ? "px-2.5" : "px-4",
        )}
      >
        <nav>
          {menuItems.map((item) =>
            renderMenuItem(item, isItemActive(item.path), isCollapsed, compact, handleNavigation),
          )}
        </nav>
      </div>

      <div
        className={cn(
          "bg-background mt-auto pb-3",
          compact ? "px-1.5" : isCollapsed ? "px-2.5" : "px-4",
        )}
      >
        <nav>
          {bottomMenuItems.map((item) =>
            renderMenuItem(item, isItemActive(item.path), isCollapsed, compact, handleNavigation),
          )}
        </nav>

        <div className="border-border my-2 border-t" />

        <button
          onClick={() => handleNavigation("/profile")}
          className={cn(
            "flex w-full cursor-pointer items-center rounded-lg transition-all",
            "border-border/60 bg-muted/40 border",
            "hover:bg-muted hover:border-border",
            compact ? "justify-center p-1.5" : isCollapsed ? "justify-center p-2.5" : "gap-2.5 p-3",
          )}
        >
          <div
            className={cn(
              "bg-primary flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/80 shadow-sm dark:border-white/10",
              compact ? "h-[28px] w-[28px]" : "h-[34px] w-[34px]",
            )}
          >
            <span className="text-xs font-semibold text-white">{placeholderUser.initials}</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1 text-left">
              <span className="text-foreground truncate text-[13px] font-semibold tracking-tight">
                {placeholderUser.name}
              </span>
            </div>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="md:hidden">
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
            open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={onClose}
        />
        <aside
          className={cn(
            "bg-background fixed top-0 left-0 z-50 flex h-full w-72 flex-col shadow-2xl transition-transform duration-300 ease-in-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {renderSidebarContent(false)}
        </aside>
      </div>

      <aside
        className={cn(
          "bg-background border-border sticky top-0 hidden h-screen shrink-0 flex-col border-r transition-[width] duration-200 md:flex",
          collapsed ? "w-[72px]" : "w-52",
        )}
      >
        {renderSidebarContent(collapsed)}
      </aside>
    </>
  );
}
