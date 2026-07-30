"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Globe, Mail, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [name, setName] = useState(profile.name);
  const [savingName, setSavingName] = useState(false);
  const handle = profile.email.split("@")[0];

  const openNameDialog = () => {
    setName(profile.name);
    setNameDialogOpen(true);
  };

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name can't be empty.");
      return;
    }

    setSavingName(true);
    try {
      const updated = await api.patch<AccountProfile>("/users/me/profile", { name: trimmed });
      onProfileChange(updated);
      if (authUser) setAuthUser({ ...authUser, name: updated.name, initials: updated.initials });
      toast.success("Name updated");
      setNameDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't update your name.");
    } finally {
      setSavingName(false);
    }
  };

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

      <div className="mt-6 flex items-center gap-2">
        <h2 className="text-foreground text-xl font-bold tracking-tight">{profile.name}</h2>
        <button
          type="button"
          onClick={openNameDialog}
          aria-label="Edit name"
          className="text-muted-foreground hover:text-foreground"
        >
          <Pencil size={14} />
        </button>
      </div>
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

      <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit name</DialogTitle>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Name</Label>
            <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>

          <DialogFooter>
            <Button onClick={() => void handleSaveName()} disabled={savingName} className="w-full">
              {savingName ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
