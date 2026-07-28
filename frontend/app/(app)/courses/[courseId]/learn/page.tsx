import { Suspense } from "react";
import { LessonPlayer } from "@/features/courses/components/LessonPlayer";

export default async function Page({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return (
    <Suspense>
      <LessonPlayer courseId={courseId} />
    </Suspense>
  );
}
