"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import type { AdminTrack, CourseLevel } from "@/features/admin/types";

const ALL_LEVELS: CourseLevel[] = ["beginner", "intermediate", "advanced"];

export function TrackFormDialog({
  courseId,
  track,
  usedLevels,
  open,
  onClose,
  onSaved,
}: {
  courseId: string;
  track: AdminTrack | null;
  usedLevels: CourseLevel[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const availableLevels = ALL_LEVELS.filter((level) => level === track?.level || !usedLevels.includes(level));
  const [level, setLevel] = useState<CourseLevel>(track?.level ?? availableLevels[0] ?? "beginner");
  const [cefr, setCefr] = useState(track?.cefr ?? "");
  const [description, setDescription] = useState(track?.description ?? "");
  const [locked, setLocked] = useState(track?.locked ?? true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLevel(track?.level ?? availableLevels[0] ?? "beginner");
      setCefr(track?.cefr ?? "");
      setDescription(track?.description ?? "");
      setLocked(track?.locked ?? true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, track]);

  const canSave = cefr.trim() && description.trim();

  const handleSave = async () => {
    setSaving(true);
    try {
      if (track) {
        await api.patch(`/admin/tracks/${track.id}`, { cefr, description, locked });
      } else {
        await api.post(`/admin/courses/${courseId}/tracks`, { level, cefr, description, locked });
      }
      toast.success(track ? "Level updated" : "Level added");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't save this level.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{track ? "Edit level" : "Add level"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!track && (
            <div className="space-y-1.5">
              <Label>Level</Label>
              <Select value={level} onValueChange={(value) => setLevel(value as CourseLevel)}>
                <SelectTrigger className="w-full capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableLevels.map((l) => (
                    <SelectItem key={l} value={l} className="capitalize">
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="track-cefr">CEFR code</Label>
            <Input id="track-cefr" value={cefr} onChange={(e) => setCefr(e.target.value)} placeholder="e.g. A1" className="w-24" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="track-description">Description</Label>
            <Textarea
              id="track-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What learners cover at this level"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="track-locked">Locked</Label>
            <Switch id="track-locked" checked={locked} onCheckedChange={setLocked} />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => void handleSave()} disabled={!canSave || saving} className="w-full">
            {saving ? "Saving…" : track ? "Save changes" : "Add level"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
