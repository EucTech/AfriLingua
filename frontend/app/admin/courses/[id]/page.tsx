import { CourseDetailAdmin } from "@/features/admin/components/CourseDetailAdmin";

export default async function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CourseDetailAdmin courseId={id} />;
}
