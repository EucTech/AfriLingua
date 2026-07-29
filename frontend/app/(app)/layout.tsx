"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useAuth } from "@/features/auth/store/useAuth";
import { useLessonProgress } from "@/features/courses/store/useLessonProgress";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuth((state) => state.token);
  const hasHydrated = useAuth((state) => state.hasHydrated);
  const loadProgress = useLessonProgress((state) => state.load);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace("/login");
    }
  }, [hasHydrated, token, router]);

  useEffect(() => {
    if (token) loadProgress();
  }, [token, loadProgress]);

  if (!hasHydrated || !token) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => {
            if (window.innerWidth < 768) {
              setSidebarOpen(!sidebarOpen);
            } else {
              setCollapsed(!collapsed);
            }
          }}
        />

        <main className="flex-1 p-3">
          <div className="bg-card rounded-b-2xl border border-t-0 border-border min-h-[calc(100vh-5.5rem)] p-6 md:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
