import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <Image
        src="/images/logo-cropped.png"
        alt="AfriLingua"
        width={1190}
        height={284}
        className="h-8 w-auto"
        priority
      />

      <div className="space-y-3">
        <p className="text-primary text-7xl font-bold tracking-tight">404</p>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
