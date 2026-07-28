import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
          Create your account
        </h1>
        <p className="text-muted-foreground text-sm">Start learning an African language today.</p>
      </div>

      <RegisterForm />

      <p className="text-muted-foreground border-border border-t pt-5 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
