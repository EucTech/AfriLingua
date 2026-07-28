import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-sm">Sign in to keep your streak alive.</p>
      </div>

      <LoginForm />

      <div className="border-border space-y-2 border-t pt-5 text-center text-sm">
        <p>
          <Link href="/forgot-password" className="text-primary font-medium hover:underline">
            Forgot your password?
          </Link>
        </p>
        <p className="text-muted-foreground">
          New here?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
