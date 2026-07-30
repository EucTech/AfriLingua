"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";
import type { AdminChapter } from "@/features/admin/types";

export function ChapterFormDialog({
  trackId,
  chapter,
  open,
  onClose,
  onSaved,
}: {
  trackId: string;
  chapter: AdminChapter | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(chapter?.title ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setTitle(chapter?.title ?? "");
  }, [open, chapter]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (chapter) {
        await api.patch(`/admin/chapters/${chapter.id}`, { title });
      } else {
        await api.post(`/admin/tracks/${trackId}/chapters`, { title });
      }
      toast.success(chapter ? "Chapter updated" : "Chapter added");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't save this chapter.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{chapter ? "Edit chapter" : "Add chapter"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="chapter-title">Title</Label>
          <Input
            id="chapter-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Greetings"
          />
        </div>

        <DialogFooter>
          <Button onClick={() => void handleSave()} disabled={!title.trim() || saving} className="w-full">
            {saving ? "Saving…" : chapter ? "Save changes" : "Add chapter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
