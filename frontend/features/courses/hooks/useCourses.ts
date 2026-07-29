"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Course } from "@/types/course";

let cache: Course[] | null = null;

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    api
      .get<Course[]>("/courses")
      .then((data) => {
        if (cancelled) return;
        cache = data;
        setCourses(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { courses, loading };
}
