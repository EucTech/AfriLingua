"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Course } from "@/types/course";

export function useCourses() {
  const { data, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => api.get<Course[]>("/courses"),
    staleTime: 5 * 60_000,
  });

  return { courses: data ?? [], loading: isLoading };
}
