"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, ShieldCheck, ShieldOff, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import type { AdminUserList } from "@/features/admin/types";

const PAGE_SIZE = 10;

export function UsersAdmin() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timeout);
  }, [search]);

  const queryKey = ["admin", "users", { search: debouncedSearch, page }] as const;

  const {
    data,
    isLoading: loading,
    isError,
  } = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
      if (debouncedSearch) params.set("search", debouncedSearch);
      return api.get<AdminUserList>(`/admin/users?${params.toString()}`);
    },
  });

  useEffect(() => {
    if (isError) toast.error("Couldn't load users.");
  }, [isError]);

  const roleMutation = useMutation({
    mutationFn: ({ userId, nextRole }: { userId: string; nextRole: "user" | "admin" }) =>
      api.patch(`/admin/users/${userId}/role`, { role: nextRole }),
    onMutate: ({ userId }) => setUpdatingId(userId),
    onSuccess: (_result, { nextRole }) => {
      queryClient.setQueryData<AdminUserList>(queryKey, (prev) =>
        prev
          ? {
              ...prev,
              users: prev.users.map((u) => (u.id === roleMutation.variables?.userId ? { ...u, role: nextRole } : u)),
            }
          : prev,
      );
      toast.success(nextRole === "admin" ? "Promoted to admin" : "Removed admin access");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Couldn't update this user.");
    },
    onSettled: () => setUpdatingId(null),
  });

  const toggleRole = (userId: string, currentRole: "user" | "admin") => {
    roleMutation.mutate({ userId, nextRole: currentRole === "admin" ? "user" : "admin" });
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-1 text-sm">{data?.total ?? "…"} people on the platform.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" size={16} />
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email"
          className="pl-9"
        />
      </div>

      <div className="bg-card border-border overflow-hidden rounded-2xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-xs tracking-wide uppercase">
                <th className="px-5 py-3 text-left font-medium">Name</th>
                <th className="px-5 py-3 text-left font-medium">Country</th>
                <th className="px-5 py-3 text-left font-medium">XP</th>
                <th className="px-5 py-3 text-left font-medium">Streak</th>
                <th className="px-5 py-3 text-left font-medium">Joined</th>
                <th className="px-5 py-3 text-left font-medium">Role</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center">
                    <div className="bg-muted mx-auto h-4 w-40 animate-pulse rounded" />
                  </td>
                </tr>
              ) : data?.users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-muted-foreground px-5 py-8 text-center">
                    No users match your search.
                  </td>
                </tr>
              ) : (
                data?.users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
                          {user.initials}
                        </span>
                        <div className="min-w-0">
                          <p className="text-foreground truncate font-medium">{user.name}</p>
                          <p className="text-muted-foreground truncate text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-foreground px-5 py-3.5">{user.country ?? "—"}</td>
                    <td className="text-foreground px-5 py-3.5">{user.xp}</td>
                    <td className="text-foreground px-5 py-3.5">{user.streakDays}d</td>
                    <td className="text-muted-foreground px-5 py-3.5">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"} className="capitalize">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => toggleRole(user.id, user.role)}
                        disabled={updatingId === user.id}
                        className="text-primary inline-flex items-center gap-1.5 text-xs font-medium hover:underline disabled:opacity-50"
                      >
                        {user.role === "admin" ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                        {user.role === "admin" ? "Remove admin" : "Make admin"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.total > 0 && (
          <div className="border-border flex items-center justify-between border-t px-5 py-3">
            <p className="text-muted-foreground text-xs">
              Page {data.page} of {totalPages}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="hover:bg-muted flex h-7 w-7 items-center justify-center rounded-full disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="hover:bg-muted flex h-7 w-7 items-center justify-center rounded-full disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
