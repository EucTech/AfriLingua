"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";
import { SectionCard, SummaryField, EmptyValue } from "@/features/profile/components/SectionCard";
import { ChipGroup, MultiSelectDropdown, toggleValue } from "@/features/profile/components/pickers";
import { SPOKEN_LANGUAGE_OPTIONS, TARGET_LANGUAGE_OPTIONS } from "@/features/profile/data/options";

export function LanguagesSkeleton() {
  return (
    <section className="bg-card border-border animate-pulse rounded-xl border p-6 shadow-sm">
      <div className="bg-muted mb-5 h-5 w-28 rounded" />
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="bg-muted h-7 w-16 rounded-full" />
          <div className="bg-muted h-7 w-20 rounded-full" />
        </div>
        <div className="flex gap-2">
          <div className="bg-muted h-7 w-16 rounded-full" />
        </div>
      </div>
    </section>
  );
}

export function LanguagesCard({
  spokenLanguages,
  targetLanguages,
  onSaved,
}: {
  spokenLanguages: string[];
  targetLanguages: string[];
  onSaved: (data: { spokenLanguages: string[]; targetLanguages: string[] }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftSpoken, setDraftSpoken] = useState(spokenLanguages);
  const [draftTarget, setDraftTarget] = useState(targetLanguages);
  const [saving, setSaving] = useState(false);

  const openDialog = () => {
    setDraftSpoken(spokenLanguages);
    setDraftTarget(targetLanguages);
    setOpen(true);
  };

  const canSave = draftSpoken.length > 0 && draftTarget.length > 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/users/me/language-profile", {
        spokenLanguages: draftSpoken,
        targetLanguages: draftTarget,
      });
      onSaved({ spokenLanguages: draftSpoken, targetLanguages: draftTarget });
      toast.success("Languages saved");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't save your languages.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SectionCard icon={Languages} title="Languages" onEdit={openDialog}>
        <div className="space-y-4">
          <SummaryField
            label="Speaking"
            value={
              spokenLanguages.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {spokenLanguages.map((language) => (
                    <span
                      key={language}
                      className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-medium"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyValue />
              )
            }
          />
          <SummaryField
            label="Learning"
            value={
              targetLanguages.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {targetLanguages.map((language) => (
                    <span
                      key={language}
                      className="bg-accent/10 text-accent rounded-full px-2.5 py-1 text-xs font-medium"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyValue />
              )
            }
          />
        </div>
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Languages</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-foreground text-sm font-medium">Languages you speak</p>
              <MultiSelectDropdown
                options={SPOKEN_LANGUAGE_OPTIONS}
                selected={draftSpoken}
                onToggle={(value) => setDraftSpoken((prev) => toggleValue(prev, value))}
                placeholder="Select languages"
              />
            </div>

            <div className="space-y-2">
              <p className="text-foreground text-sm font-medium">Languages you want to learn</p>
              <ChipGroup
                options={TARGET_LANGUAGE_OPTIONS}
                selected={draftTarget}
                onToggle={(value) => setDraftTarget((prev) => toggleValue(prev, value))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => void handleSave()} disabled={!canSave || saving} className="w-full">
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
