"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MessageCircle, Phone, Users, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, ApiError } from "@/lib/api";
import { useCourses } from "@/features/courses/hooks/useCourses";
import { courseProgress } from "@/features/courses/lib/progress";
import { useLessonProgress } from "@/features/courses/store/useLessonProgress";
import type { CallMode } from "@/types/call";

interface PracticeResponse {
  callSessionId: string;
  partner: { id: string; name: string; initials: string; country: string };
}

const modes: {
  id: CallMode;
  label: string;
  icon: typeof Video;
  title: string;
  description: (language: string) => string;
}[] = [
  {
    id: "video",
    label: "Video",
    icon: Video,
    title: "Video Call",
    description: (language) =>
      `You'll be connected with someone who speaks ${language} for a face-to-face conversation`,
  },
  {
    id: "audio",
    label: "Audio",
    icon: Phone,
    title: "Audio Call",
    description: (language) => `You'll be connected with someone who speaks ${language} for a voice conversation`,
  },
  {
    id: "chat",
    label: "Chat",
    icon: MessageCircle,
    title: "Text Chat",
    description: (language) => `You'll be connected with someone who speaks ${language} for a live text conversation`,
  },
];

type Status = "idle" | "searching" | "matched";

export function MatchingPage() {
  const router = useRouter();
  const { courses } = useCourses();
  const lessonCompletion = useLessonProgress((state) => state.completed);
  const activeCourse =
    courses.find((course) => {
      const progress = courseProgress(course, lessonCompletion);
      return progress.completed > 0 && progress.completed < progress.total;
    }) ?? courses[0];

  const [mode, setMode] = useState<CallMode>("video");
  const [status, setStatus] = useState<Status>("idle");
  const [matchedName, setMatchedName] = useState<string | null>(null);
  const cancelledRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeMode = modes.find((m) => m.id === mode) ?? modes[0];
  const Icon = activeMode.icon;

  if (!activeCourse) {
    return (
      <div className="mx-auto max-w-2xl animate-pulse space-y-6">
        <div className="flex items-center gap-2">
          <div className="bg-muted h-6 w-6 rounded-full" />
          <div className="space-y-2">
            <div className="bg-muted h-5 w-40 rounded" />
            <div className="bg-muted h-3 w-56 rounded" />
          </div>
        </div>
        <div className="bg-card border-border h-12 rounded-full border" />
        <div className="bg-primary/5 border-border h-72 rounded-2xl border" />
      </div>
    );
  }

  const startSearch = async () => {
    if (!activeCourse) return;
    cancelledRef.current = false;
    setStatus("searching");

    const minDelay = new Promise((resolve) => setTimeout(resolve, 1800));
    try {
      const [result] = await Promise.all([
        api.post<PracticeResponse>("/matching/practice", { mode, language: activeCourse.language }),
        minDelay,
      ]);
      if (cancelledRef.current) return;

      setMatchedName(result.partner.name);
      setStatus("matched");

      timeoutRef.current = setTimeout(() => {
        if (cancelledRef.current) return;
        router.push(`/call/${result.callSessionId}?mode=${mode}`);
      }, 1100);
    } catch (error) {
      if (cancelledRef.current) return;
      setStatus("idle");
      toast.error(error instanceof ApiError ? error.message : "Couldn't find a partner. Try again.");
    }
  };

  const cancelSearch = () => {
    cancelledRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus("idle");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Users className="text-primary" size={22} />
        <div>
          <h1 className="text-foreground text-xl font-semibold tracking-tight">Tandem partners</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Practice live with someone who speaks {activeCourse.language}.
          </p>
        </div>
      </div>

      <div className="bg-card border-border flex gap-1 rounded-full border p-1">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => status === "idle" && setMode(m.id)}
            disabled={status !== "idle"}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed",
              mode === m.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <m.icon size={16} />
            {m.label}
          </button>
        ))}
      </div>

      <div className="bg-primary/5 border-border rounded-2xl border px-14 py-10">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
          {status === "idle" && (
            <>
              <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full">
                <Icon size={28} />
              </div>
              <h2 className="text-foreground text-lg font-semibold tracking-tight">{activeMode.title}</h2>
              <p className="text-muted-foreground text-sm">{activeMode.description(activeCourse.language)}</p>

              <button
                onClick={startSearch}
                className="bg-primary text-primary-foreground mt-3 rounded-full px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              >
                Practice now
              </button>
            </>
          )}

          {status === "searching" && (
            <>
              <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full">
                <Loader2 size={28} className="animate-spin" />
              </div>
              <h2 className="text-foreground text-lg font-semibold tracking-tight">Looking for a partner…</h2>
              <p className="text-muted-foreground text-sm">
                Matching you with someone who speaks {activeCourse.language}.
              </p>
              <button
                onClick={cancelSearch}
                className="border-border text-muted-foreground hover:border-foreground/15 mt-3 rounded-full border px-6 py-2.5 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {status === "matched" && (
            <>
              <div className="bg-success/10 text-success flex h-16 w-16 items-center justify-center rounded-full">
                <Icon size={28} />
              </div>
              <h2 className="text-foreground text-lg font-semibold tracking-tight">Partner found!</h2>
              <p className="text-muted-foreground text-sm">Connecting you with {matchedName}…</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
