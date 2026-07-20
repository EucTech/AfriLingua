"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  GOAL_OPTIONS,
  SPOKEN_LANGUAGE_OPTIONS,
  TARGET_LANGUAGE_OPTIONS,
} from "@/features/profile/data/options";
import type { CourseLevel } from "@/types/course";

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-muted",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function LanguageProfileForm() {
  const router = useRouter();
  const [spokenLanguages, setSpokenLanguages] = useState<string[]>(["English"]);
  const [targetLanguages, setTargetLanguages] = useState<string[]>(["Swahili"]);
  const [proficiency, setProficiency] = useState<CourseLevel>("beginner");
  const [goals, setGoals] = useState<string[]>([]);

  const canSave = spokenLanguages.length > 0 && targetLanguages.length > 0;

  const handleSave = () => {
    toast.success("Language profile saved");
    router.push("/dashboard");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div>
          <h2 className="text-foreground text-sm font-semibold">Languages you speak</h2>
          <p className="text-muted-foreground text-xs">Pick at least one.</p>
        </div>
        <ChipGroup
          options={SPOKEN_LANGUAGE_OPTIONS}
          selected={spokenLanguages}
          onToggle={(value) => setSpokenLanguages((prev) => toggle(prev, value))}
        />
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-foreground text-sm font-semibold">Languages you want to learn</h2>
          <p className="text-muted-foreground text-xs">Pick at least one.</p>
        </div>
        <ChipGroup
          options={TARGET_LANGUAGE_OPTIONS}
          selected={targetLanguages}
          onToggle={(value) => setTargetLanguages((prev) => toggle(prev, value))}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-foreground text-sm font-semibold">Your current level</h2>
        <Select value={proficiency} onValueChange={(value) => setProficiency(value as CourseLevel)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-foreground text-sm font-semibold">What&apos;s your goal?</h2>
          <p className="text-muted-foreground text-xs">Optional, pick as many as apply.</p>
        </div>
        <ChipGroup
          options={GOAL_OPTIONS}
          selected={goals}
          onToggle={(value) => setGoals((prev) => toggle(prev, value))}
        />
      </div>

      <Button onClick={handleSave} disabled={!canSave} className="w-full sm:w-auto">
        Save profile
      </Button>
    </div>
  );
}
