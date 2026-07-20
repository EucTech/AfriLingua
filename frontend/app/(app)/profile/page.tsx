import { LanguageProfileForm } from "@/features/profile/components/LanguageProfileForm";

export default function ProfilePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">Language profile</h1>
        <p className="text-muted-foreground text-sm">
          This helps us match you with the right courses and tandem partners.
        </p>
      </div>

      <LanguageProfileForm />
    </div>
  );
}
