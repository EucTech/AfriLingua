"use client";

import { Globe, Apple, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const providers = [
  { id: "google", label: "Continue with Google", icon: Globe },
  { id: "apple", label: "Continue with Apple", icon: Apple },
  { id: "phone", label: "Continue with phone", icon: Phone },
];

export function SocialAuthButtons() {
  return (
    <div className="space-y-2">
      {providers.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          className="w-full justify-center"
          onClick={() => toast.info(`${label} isn't connected yet`)}
        >
          <Icon size={16} />
          {label}
        </Button>
      ))}
    </div>
  );
}
