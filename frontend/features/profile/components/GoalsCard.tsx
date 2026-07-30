"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";
import { SectionCard, SummaryField, EmptyValue } from "@/features/profile/components/SectionCard";
import { ChipGroup, toggleValue } from "@/features/profile/components/pickers";
import { GOAL_OPTIONS } from "@/features/profile/data/options";
import type { CourseLevel } from "@/types/course";

const LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function GoalsSkeleton() {
  return (
    <section className="bg-card border-border animate-pulse rounded-xl border p-6 shadow-sm">
      <div className="bg-muted mb-5 h-5 w-36 rounded" />
      <div className="flex gap-2">
        <div className="bg-muted h-7 w-20 rounded-full" />
        <div className="bg-muted h-7 w-28 rounded-full" />
      </div>
    </section>
  );
}

export function GoalsCard({
  proficiency,
  goals,
  onSaved,
}: {
  proficiency: CourseLevel;
  goals: string[];
  onSaved: (data: { proficiency: CourseLevel; goals: string[] }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftProficiency, setDraftProficiency] = useState(proficiency);
  const [draftGoals, setDraftGoals] = useState(goals);
  const [saving, setSaving] = useState(false);

  const openDialog = () => {
    setDraftProficiency(proficiency);
    setDraftGoals(goals);
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/users/me/language-profile", {
        proficiency: draftProficiency,
        goals: draftGoals,
      });
      onSaved({ proficiency: draftProficiency, goals: draftGoals });
      toast.success("Learning goals saved");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't save your goals.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SectionCard icon={Target} title="Why you're learning" onEdit={openDialog}>
        <div className="space-y-4">
          <SummaryField label="Level" value={LEVEL_LABELS[proficiency]} />
          <SummaryField
            label="Goals"
            value={
              goals.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {goals.map((goal) => (
                    <span
                      key={goal}
                      className="bg-success/10 text-success rounded-full px-2.5 py-1 text-xs font-medium"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyValue>None yet</EmptyValue>
              )
            }
          />
        </div>
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Why you&apos;re learning</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-foreground text-sm font-medium">Your current level</p>
              <Select
                value={draftProficiency}
                onValueChange={(value) => setDraftProficiency(value as CourseLevel)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="p-1.5">
                  <SelectItem value="beginner" className="py-2.5">Beginner</SelectItem>
                  <SelectItem value="intermediate" className="py-2.5">Intermediate</SelectItem>
                  <SelectItem value="advanced" className="py-2.5">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-foreground text-sm font-medium">What&apos;s your goal?</p>
              <ChipGroup
                options={GOAL_OPTIONS}
                selected={draftGoals}
                onToggle={(value) => setDraftGoals((prev) => toggleValue(prev, value))}
              />
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
