import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { SocialAuthButtons } from "@/features/auth/components/SocialAuthButtons";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-muted-foreground text-sm">Start learning an African language today.</p>
      </div>

      <RegisterForm />

      <div className="flex items-center gap-3">
        <div className="border-border h-px flex-1 border-t" />
        <span className="text-muted-foreground text-xs">or</span>
        <div className="border-border h-px flex-1 border-t" />
      </div>

      <SocialAuthButtons />

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
