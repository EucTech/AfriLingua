import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { SocialAuthButtons } from "@/features/auth/components/SocialAuthButtons";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">Sign in to keep your streak alive.</p>
      </div>

      <LoginForm />

      <div className="flex items-center gap-3">
        <div className="border-border h-px flex-1 border-t" />
        <span className="text-muted-foreground text-xs">or</span>
        <div className="border-border h-px flex-1 border-t" />
      </div>

      <SocialAuthButtons />

      <div className="text-muted-foreground space-y-1 text-center text-sm">
        <p>
          <Link href="/forgot-password" className="text-primary font-medium hover:underline">
            Forgot your password?
          </Link>
        </p>
        <p>
          New here?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
