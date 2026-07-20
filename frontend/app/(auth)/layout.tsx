import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between p-4">
        <Link href="/" className="text-primary text-lg font-bold tracking-tight">
          AfriLingua
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="bg-card border-border w-full max-w-sm rounded-xl border p-6 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
