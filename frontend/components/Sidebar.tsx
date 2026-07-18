"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  MessageCircle,
  BookOpen,
  Trophy,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItemType {
  id: string;
  label: string;
  icon: (color: string) => React.ReactNode;
  path: string;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems: MenuItemType[] = [
  {
    id: "home",
    label: "Home",
    icon: (color) => <Home size={20} color={color} />,
    path: "/dashboard",
  },
  {
    id: "chats",
    label: "Chats",
    icon: (color) => <MessageCircle size={20} color={color} />,
    path: "/chats",
  },
  {
    id: "courses",
    label: "Courses",
    icon: (color) => <BookOpen size={20} color={color} />,
    path: "/courses",
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    icon: (color) => <Trophy size={20} color={color} />,
    path: "/leaderboard",
  },
];

const bottomMenuItems: MenuItemType[] = [
  {
    id: "settings",
    label: "Settings",
    icon: (color) => <Settings size={20} color={color} />,
    path: "/settings",
  },
];

const placeholderUser = {
  name: "Guest User",
  initials: "GU",
};

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
    if (open) onClose();
  };

  const renderMenuItem = (item: MenuItemType, isCollapsed: boolean, compact = false) => {
    const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
    const iconColor = isActive ? "#7C3AED" : "#A3A3A3";

    return (
      <div key={item.id} className="relative mb-0.5">
        {isActive && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-[#7C3AED] rounded-r z-10"
            style={{ left: compact ? "-6px" : isCollapsed ? "-10px" : "-16px" }}
          />
        )}
        <button
          onClick={() => handleNavigation(item.path)}
          className={cn(
            "flex items-center w-full rounded-lg transition-all",
            compact ? "px-1.5 py-1.5 justify-center" : isCollapsed ? "px-2.5 py-2 justify-center gap-3" : "px-3 py-2 justify-start gap-3",
            isActive
              ? "bg-[#7C3AED]/5 dark:bg-[#7C3AED]/10"
              : "hover:bg-black/3 dark:hover:bg-white/4"
          )}
        >
          <span className={cn("relative shrink-0", isCollapsed ? "" : "w-8 flex justify-center")}>
            {item.icon(iconColor)}
          </span>
          {!isCollapsed && (
            <span
              className={cn(
                "text-[13px] tracking-tight truncate",
                isActive
                  ? "font-semibold text-[#7C3AED]"
                  : "font-medium text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          )}
        </button>
      </div>
    );
  };

  const renderSidebarContent = (isCollapsed: boolean, compact = false) => (
    <>
      <div
        onClick={() => handleNavigation("/dashboard")}
        className={cn(
          "flex items-center justify-center cursor-pointer",
          compact ? "pt-6 pb-3 px-1.5" : isCollapsed ? "pt-4 p-4" : "pt-4 p-5"
        )}
      >
        {isCollapsed && !compact ? (
          <span className="w-8 h-8 rounded-md bg-[#7C3AED] text-white flex items-center justify-center text-sm font-bold">
            A
          </span>
        ) : (
          <span className="text-lg font-bold tracking-tight text-[#7C3AED]">AfriLingua</span>
        )}
      </div>

      <div className={cn("mx-auto border-t border-border", compact ? "w-[80%] mb-2" : "w-[85%] mb-3")} />

      <div
        className={cn(
          "flex-1 overflow-y-auto scrollbar",
          compact ? "px-1.5" : isCollapsed ? "px-2.5" : "px-4"
        )}
      >
        <nav>{menuItems.map((item) => renderMenuItem(item, isCollapsed, compact))}</nav>
      </div>

      <div
        className={cn(
          "mt-auto pb-3 bg-background",
          compact ? "px-1.5" : isCollapsed ? "px-2.5" : "px-4"
        )}
      >
        <nav>{bottomMenuItems.map((item) => renderMenuItem(item, isCollapsed, compact))}</nav>

        <div className="my-2 border-t border-border" />

        <button
          onClick={() => handleNavigation("/profile")}
          className={cn(
            "flex items-center w-full rounded-lg cursor-pointer transition-all",
            "bg-black/2 dark:bg-white/2 border border-black/3 dark:border-white/4",
            "hover:bg-black/4 dark:hover:bg-white/5 hover:border-black/6 dark:hover:border-white/8",
            compact ? "p-1.5 justify-center" : isCollapsed ? "p-2.5 justify-center" : "p-3 gap-2.5"
          )}
        >
          <div
            className={cn(
              "rounded-full bg-[#7C3AED] flex items-center justify-center shrink-0 overflow-hidden border-2 border-white/80 dark:border-white/10 shadow-[0_2px_8px_rgba(124,58,237,0.3)]",
              compact ? "w-[28px] h-[28px]" : "w-[34px] h-[34px]"
            )}
          >
            <span className="text-white text-xs font-semibold">{placeholderUser.initials}</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[13px] font-semibold tracking-tight truncate text-foreground">
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
            open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={onClose}
        />
        <aside
          className={cn(
            "fixed top-0 left-0 z-50 h-full w-72 bg-background shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {renderSidebarContent(false)}
        </aside>
      </div>

      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 h-screen sticky top-0 bg-background border-r border-border transition-[width] duration-200",
          collapsed ? "w-[72px]" : "w-52"
        )}
      >
        {renderSidebarContent(collapsed)}
      </aside>
    </>
  );
};

export default Sidebar;
