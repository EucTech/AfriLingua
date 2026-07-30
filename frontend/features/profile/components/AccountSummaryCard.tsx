"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Globe, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api, ApiError, resolveAssetUrl } from "@/lib/api";
import { useAuth } from "@/features/auth/store/useAuth";
import type { AccountProfile } from "@/features/profile/types";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AccountSummarySkeleton() {
  return (
    <section className="bg-card border-border animate-pulse rounded-xl border p-8 shadow-sm">
      <div className="bg-muted size-24 rounded-full" />
      <div className="bg-muted mt-6 h-6 w-40 rounded" />
      <div className="bg-muted mt-2 h-4 w-28 rounded" />
      <div className="mt-4 flex gap-2">
        <div className="bg-muted h-7 w-24 rounded-full" />
        <div className="bg-muted h-7 w-40 rounded-full" />
      </div>
    </section>
  );
}

export function AccountSummaryCard({
  profile,
  onProfileChange,
}: {
  profile: AccountProfile;
  onProfileChange: (profile: AccountProfile) => void;
}) {
  const setAuthUser = useAuth((state) => state.setUser);
  const authUser = useAuth((state) => state.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const handle = profile.email.split("@")[0];

  const handleAvatarPick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      toast.error("Avatar must be a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Avatar must be smaller than 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setUploading(true);
    try {
      const updated = await api.upload<AccountProfile>("/users/me/avatar", formData);
      onProfileChange(updated);
      if (authUser) setAuthUser({ ...authUser, avatarUrl: updated.avatarUrl });
      toast.success("Profile photo updated");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't upload your photo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="bg-card border-border rounded-xl border p-8 shadow-sm">
      <div className="group relative size-24">
        <Avatar className="size-24">
          {profile.avatarUrl && <AvatarImage src={resolveAssetUrl(profile.avatarUrl)} alt={profile.name} />}
          <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
            {profile.initials}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={handleAvatarPick}
          disabled={uploading}
          aria-label="Change profile photo"
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100 disabled:opacity-100"
        >
          <Camera size={20} className={uploading ? "animate-pulse" : ""} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => void handleAvatarChange(event)}
        />
      </div>

      <h2 className="text-foreground mt-6 text-xl font-bold tracking-tight">{profile.name}</h2>
      <p className="text-primary text-sm font-medium">@{handle}</p>
      {profile.bio && <p className="text-muted-foreground mt-2 max-w-md text-sm">{profile.bio}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {profile.country && (
          <span className="border-border bg-card text-foreground flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium">
            <Globe className="text-muted-foreground" size={14} />
            {profile.country}
          </span>
        )}
        <span className="border-border bg-card text-foreground flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium">
          <Mail className="text-muted-foreground" size={14} />
          {profile.email}
        </span>
      </div>
    </section>
  );
}
