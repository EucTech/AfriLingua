"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/features/auth/store/useAuth";
import type { AccountProfile } from "@/features/profile/types";
import { EmptyValue, SectionCard, SummaryField } from "@/features/profile/components/SectionCard";

const BIO_MAX_LENGTH = 280;

export function AboutSkeleton() {
  return (
    <section className="bg-card border-border animate-pulse rounded-xl border p-6 shadow-sm">
      <div className="bg-muted mb-5 h-5 w-32 rounded" />
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted h-9 rounded" />
        <div className="bg-muted h-9 rounded" />
      </div>
    </section>
  );
}

export function AboutCard({
  profile,
  onProfileChange,
}: {
  profile: AccountProfile;
  onProfileChange: (profile: AccountProfile) => void;
}) {
  const setAuthUser = useAuth((state) => state.setUser);
  const authUser = useAuth((state) => state.user);
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState(profile.country ?? "");
  const [address, setAddress] = useState(profile.address ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [saving, setSaving] = useState(false);

  const openDialog = () => {
    setCountry(profile.country ?? "");
    setAddress(profile.address ?? "");
    setBio(profile.bio ?? "");
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.patch<AccountProfile>("/users/me/profile", {
        country: country.trim() || null,
        address: address.trim() || null,
        bio: bio.trim() || null,
      });
      onProfileChange(updated);
      if (authUser) setAuthUser({ ...authUser, country: updated.country });
      toast.success("About section saved");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't save your details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SectionCard icon={UserRound} title="About" onEdit={openDialog}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <SummaryField label="Country" value={profile.country || <EmptyValue />} />
          <SummaryField label="Address" value={profile.address || <EmptyValue />} />
        </div>
        <div className="mt-4">
          <SummaryField label="Bio" value={profile.bio || <EmptyValue>No bio yet</EmptyValue>} />
        </div>
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                placeholder="e.g. Nigeria"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Street, city"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(event) => setBio(event.target.value.slice(0, BIO_MAX_LENGTH))}
                placeholder="Tell tandem partners a bit about yourself"
                className="min-h-24"
              />
              <p className="text-muted-foreground text-right text-xs">
                {bio.length}/{BIO_MAX_LENGTH}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => void handleSave()} disabled={saving} className="w-full">
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
