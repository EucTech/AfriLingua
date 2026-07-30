"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";
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
import type { AdminLesson, LessonFormValues } from "@/features/admin/types";

const MAX_OPTIONS = 4;
const MIN_OPTIONS = 2;

function emptyForm(): LessonFormValues {
  return {
    title: "",
    videoTitle: "",
    videoMinutes: 5,
    videoUrl: "",
    words: [],
    quiz: [],
  };
}

function toFormValues(lesson: AdminLesson): LessonFormValues {
  return {
    title: lesson.title,
    videoTitle: lesson.videoTitle,
    videoMinutes: lesson.videoMinutes,
    videoUrl: lesson.videoUrl,
    words: lesson.words.map((w) => ({ word: w.word, translation: w.translation })),
    quiz: lesson.quiz.map((q) => ({ prompt: q.prompt, options: [...q.options], correctIndex: q.correctIndex })),
  };
}

export function LessonFormDialog({
  chapterId,
  lesson,
  open,
  onClose,
  onSaved,
}: {
  chapterId: string;
  lesson: AdminLesson | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<LessonFormValues>(lesson ? toFormValues(lesson) : emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(lesson ? toFormValues(lesson) : emptyForm());
      setShowUrlInput(false);
    }
  }, [open, lesson]);

  const handleVideoFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const formData = new FormData();
    formData.append("video", file);

    setUploading(true);
    try {
      const { url } = await api.upload<{ url: string }>("/admin/uploads/video", formData);
      setForm((f) => ({ ...f, videoUrl: url }));
      toast.success("Video uploaded");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't upload the video.");
    } finally {
      setUploading(false);
    }
  };

  const addWord = () => setForm((f) => ({ ...f, words: [...f.words, { word: "", translation: "" }] }));
  const removeWord = (index: number) =>
    setForm((f) => ({ ...f, words: f.words.filter((_, i) => i !== index) }));
  const updateWord = (index: number, key: "word" | "translation", value: string) =>
    setForm((f) => ({
      ...f,
      words: f.words.map((w, i) => (i === index ? { ...w, [key]: value } : w)),
    }));

  const addQuestion = () =>
    setForm((f) => ({
      ...f,
      quiz: [...f.quiz, { prompt: "", options: ["", ""], correctIndex: 0 }],
    }));
  const removeQuestion = (index: number) =>
    setForm((f) => ({ ...f, quiz: f.quiz.filter((_, i) => i !== index) }));
  const updateQuestionPrompt = (index: number, prompt: string) =>
    setForm((f) => ({ ...f, quiz: f.quiz.map((q, i) => (i === index ? { ...q, prompt } : q)) }));
  const updateOption = (qIndex: number, oIndex: number, value: string) =>
    setForm((f) => ({
      ...f,
      quiz: f.quiz.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, j) => (j === oIndex ? value : o)) } : q,
      ),
    }));
  const setCorrectIndex = (qIndex: number, correctIndex: number) =>
    setForm((f) => ({ ...f, quiz: f.quiz.map((q, i) => (i === qIndex ? { ...q, correctIndex } : q)) }));
  const addOption = (qIndex: number) =>
    setForm((f) => ({
      ...f,
      quiz: f.quiz.map((q, i) => (i === qIndex && q.options.length < MAX_OPTIONS ? { ...q, options: [...q.options, ""] } : q)),
    }));
  const removeOption = (qIndex: number, oIndex: number) =>
    setForm((f) => ({
      ...f,
      quiz: f.quiz.map((q, i) =>
        i === qIndex && q.options.length > MIN_OPTIONS
          ? {
              ...q,
              options: q.options.filter((_, j) => j !== oIndex),
              correctIndex: q.correctIndex >= oIndex && q.correctIndex > 0 ? q.correctIndex - 1 : q.correctIndex,
            }
          : q,
      ),
    }));

  const canSave =
    form.title.trim() &&
    form.videoTitle.trim() &&
    form.videoUrl.trim() &&
    form.words.every((w) => w.word.trim() && w.translation.trim()) &&
    form.quiz.every((q) => q.prompt.trim() && q.options.every((o) => o.trim()));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (lesson) {
        await api.patch(`/admin/lessons/${lesson.id}`, form);
      } else {
        await api.post(`/admin/chapters/${chapterId}/lessons`, form);
      }
      toast.success(lesson ? "Lesson updated" : "Lesson added");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't save this lesson.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lesson ? "Edit lesson" : "Add lesson"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="lesson-title">Lesson title</Label>
              <Input
                id="lesson-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Saying hello"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="lesson-video-title">Video title</Label>
                <Input
                  id="lesson-video-title"
                  value={form.videoTitle}
                  onChange={(e) => setForm((f) => ({ ...f, videoTitle: e.target.value }))}
                  placeholder="e.g. Greetings in context"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lesson-video-minutes">Minutes</Label>
                <Input
                  id="lesson-video-minutes"
                  type="number"
                  min={0}
                  value={form.videoMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, videoMinutes: Number(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Video</Label>
              {showUrlInput ? (
                <Input
                  value={form.videoUrl}
                  onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                  placeholder="https://…"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload size={14} />
                    {uploading ? "Uploading…" : "Upload video"}
                  </Button>
                  {form.videoUrl && !uploading && (
                    <span className="text-muted-foreground max-w-[220px] truncate text-xs">{form.videoUrl}</span>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowUrlInput((prev) => !prev)}
                className="text-primary text-xs font-medium hover:underline"
              >
                {showUrlInput ? "Upload a file instead" : "or paste a URL"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={(e) => void handleVideoFile(e)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-sm font-semibold">Vocabulary</h3>
              <Button type="button" variant="outline" size="sm" onClick={addWord}>
                <Plus size={14} />
                Add word
              </Button>
            </div>
            {form.words.length === 0 && (
              <p className="text-muted-foreground text-xs">No words yet.</p>
            )}
            <div className="space-y-2">
              {form.words.map((word, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={word.word}
                    onChange={(e) => updateWord(index, "word", e.target.value)}
                    placeholder="Word"
                  />
                  <Input
                    value={word.translation}
                    onChange={(e) => updateWord(index, "translation", e.target.value)}
                    placeholder="Translation"
                  />
                  <button
                    type="button"
                    onClick={() => removeWord(index)}
                    aria-label="Remove word"
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-sm font-semibold">Quiz</h3>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <Plus size={14} />
                Add question
              </Button>
            </div>
            {form.quiz.length === 0 && (
              <p className="text-muted-foreground text-xs">No questions yet.</p>
            )}
            <div className="space-y-3">
              {form.quiz.map((question, qIndex) => (
                <div key={qIndex} className="border-border space-y-2.5 rounded-xl border p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={question.prompt}
                      onChange={(e) => updateQuestionPrompt(qIndex, e.target.value)}
                      placeholder="Question"
                    />
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      aria-label="Remove question"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="space-y-1.5 pl-1">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={question.correctIndex === oIndex}
                          onChange={() => setCorrectIndex(qIndex, oIndex)}
                          className="accent-primary size-4 shrink-0"
                          aria-label={`Mark option ${oIndex + 1} as correct`}
                        />
                        <Input
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                        />
                        {question.options.length > MIN_OPTIONS && (
                          <button
                            type="button"
                            onClick={() => removeOption(qIndex, oIndex)}
                            aria-label="Remove option"
                            className="text-muted-foreground hover:text-destructive flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    {question.options.length < MAX_OPTIONS && (
                      <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="text-primary pl-6 text-xs font-medium hover:underline"
                      >
                        + Add option
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => void handleSave()} disabled={!canSave || saving} className="w-full">
            {saving ? "Saving…" : lesson ? "Save changes" : "Add lesson"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
