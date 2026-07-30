"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Users, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/features/auth/store/useAuth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuth((state) => state.token);
  const user = useAuth((state) => state.user);
  const hasHydrated = useAuth((state) => state.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [hasHydrated, token, user, router]);

  if (!hasHydrated || !token || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="bg-muted/30 flex min-h-screen">
      <aside className="bg-card border-border hidden w-56 shrink-0 flex-col border-r md:flex">
        <div className="p-5 pb-3">
          <Image src="/images/logo-cropped.png" alt="AfriLingua" width={1190} height={284} className="h-6 w-auto" />
          <p className="text-muted-foreground mt-1 text-xs font-medium tracking-wide uppercase">Admin</p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-border border-t p-3">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={17} />
            Back to app
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-card border-border flex items-center justify-between border-b px-4 py-3 md:px-8">
          <p className="text-muted-foreground text-sm">Signed in as {user?.name}</p>
          <ThemeToggle />
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
