"use client";

import React from "react";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-40 pt-2 px-3 bg-background">
      <div
        className={cn(
          "flex items-center justify-between py-2.5 px-3 sm:px-4 md:px-6",
          "bg-card rounded-t-xl border border-border"
        )}
      >
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onMenuClick}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-black/3 dark:bg-white/4 hover:bg-black/6 dark:hover:bg-white/8 transition-colors"
          >
            <Menu size={18} className="text-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
