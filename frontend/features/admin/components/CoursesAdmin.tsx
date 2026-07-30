"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
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
import type { AdminCourse } from "@/features/admin/types";

interface CourseFormState {
  id: string;
  language: string;
  nativeName: string;
  flagEmoji: string;
  description: string;
}

const emptyForm: CourseFormState = { id: "", language: "", nativeName: "", flagEmoji: "", description: "" };

export function CoursesAdmin() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<AdminCourse | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<CourseFormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminCourse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCourses = () => {
    setLoading(true);
    api
      .get<AdminCourse[]>("/admin/courses")
      .then(setCourses)
      .catch(() => toast.error("Couldn't load courses."))
      .finally(() => setLoading(false));
  };

  useEffect(loadCourses, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (course: AdminCourse) => {
    setEditing(course);
    setForm({
      id: course.id,
      language: course.language,
      nativeName: course.nativeName,
      flagEmoji: course.flagEmoji,
      description: course.description,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/admin/courses/${editing.id}`, {
          language: form.language,
          nativeName: form.nativeName,
          flagEmoji: form.flagEmoji,
          description: form.description,
        });
        toast.success("Course updated");
      } else {
        await api.post("/admin/courses", form);
        toast.success("Course created");
      }
      setFormOpen(false);
      loadCourses();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't save the course.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/courses/${deleteTarget.id}`);
      toast.success("Course deleted");
      setDeleteTarget(null);
      loadCourses();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't delete the course.");
    } finally {
      setDeleting(false);
    }
  };

  const canSave =
    form.id.trim() && form.language.trim() && form.nativeName.trim() && form.flagEmoji.trim() && form.description.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Courses</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage the language courses learners see.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          New course
        </Button>
      </div>

      <div className="bg-card border-border rounded-2xl border">
        {loading ? (
          <div className="p-6">
            <div className="bg-muted h-40 animate-pulse rounded-xl" />
          </div>
        ) : courses.length === 0 ? (
          <p className="text-muted-foreground p-6 text-sm">No courses yet. Create the first one.</p>
        ) : (
          <ul className="divide-border divide-y">
            {courses.map((course) => (
              <li key={course.id} className="flex items-center gap-4 p-4 sm:p-5">
                <Link href={`/admin/courses/${course.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <span className="bg-muted flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl">
                    {course.flagEmoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate font-medium">
                      {course.language}
                      <span className="text-muted-foreground font-normal"> · {course.nativeName}</span>
                    </p>
                    <p className="text-muted-foreground truncate text-sm">{course.description}</p>
                  </div>
                  <span className="text-muted-foreground hidden shrink-0 text-xs sm:block">
                    {course._count.tracks} level{course._count.tracks === 1 ? "" : "s"}
                  </span>
                  <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                </Link>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(course)}
                    aria-label={`Edit ${course.language}`}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(course)}
                    aria-label={`Delete ${course.language}`}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit course" : "New course"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!editing && (
              <div className="space-y-1.5">
                <Label htmlFor="course-id">ID (slug)</Label>
                <Input
                  id="course-id"
                  value={form.id}
                  onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
                  placeholder="e.g. igbo"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="course-language">Language</Label>
                <Input
                  id="course-language"
                  value={form.language}
                  onChange={(event) => setForm((prev) => ({ ...prev, language: event.target.value }))}
                  placeholder="e.g. Igbo"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="course-native">Native name</Label>
                <Input
                  id="course-native"
                  value={form.nativeName}
                  onChange={(event) => setForm((prev) => ({ ...prev, nativeName: event.target.value }))}
                  placeholder="e.g. Igbo"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-flag">Flag emoji</Label>
              <Input
                id="course-flag"
                value={form.flagEmoji}
                onChange={(event) => setForm((prev) => ({ ...prev, flagEmoji: event.target.value }))}
                placeholder="🇳🇬"
                className="w-24"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-description">Description</Label>
              <Textarea
                id="course-description"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="What learners will get from this course"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => void handleSave()} disabled={!canSave || saving} className="w-full">
              {saving ? "Saving…" : editing ? "Save changes" : "Create course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.language}?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            This permanently removes the course and all of its tracks, chapters, and lessons.
          </p>
          <DialogFooter>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleting} className="w-full">
              {deleting ? "Deleting…" : "Delete course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
