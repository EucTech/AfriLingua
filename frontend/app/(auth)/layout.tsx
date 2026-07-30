import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-accent/10 blur-3xl"
      />

      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/">
          <Image src="/images/logo-cropped.png" alt="AfriLingua" width={1190} height={284} className="h-7 w-auto" priority />
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="bg-card border-border w-full max-w-sm rounded-2xl border p-6 shadow-sm sm:max-w-md sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
