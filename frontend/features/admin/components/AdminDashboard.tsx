"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, BookOpen, GraduationCap } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/lib/api";
import type { AdminStats } from "@/features/admin/types";

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="flex flex-col gap-2 p-6">
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
        <Icon size={13} className="text-primary" />
        {label}
      </div>
      <p className="text-foreground text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover text-popover-foreground ring-foreground/5 rounded-xl px-3 py-2 text-xs shadow-lg ring-1">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold">{payload[0].value}</p>
    </div>
  );
}

function formatDay(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AdminStats>("/admin/stats")
      .then(setStats)
      .catch(() => toast.error("Couldn't load admin stats."))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="bg-card border-border h-24 animate-pulse rounded-2xl border" />
        <div className="bg-card border-border h-72 animate-pulse rounded-2xl border" />
      </div>
    );
  }

  const signupData = stats.signups.map((entry) => ({ ...entry, label: formatDay(entry.date) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">Platform overview at a glance.</p>
      </div>

      <div className="bg-card border-border rounded-2xl border">
        <div className="divide-border grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <StatTile label="Total users" value={stats.totalUsers} icon={Users} />
          <StatTile label="Total courses" value={stats.totalCourses} icon={BookOpen} />
          <StatTile label="Total lessons" value={stats.totalLessons} icon={GraduationCap} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card border-border rounded-2xl border p-6">
          <h2 className="text-foreground text-base font-semibold">Signups, last 14 days</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={signupData} margin={{ left: -20, top: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--color-border)" }}
                  tickLine={false}
                  interval={1}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-muted)" }} />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-6">
          <h2 className="text-foreground text-base font-semibold">Top languages learners want</h2>
          {stats.topLearningLanguages.length === 0 ? (
            <p className="text-muted-foreground mt-4 text-sm">No language profile data yet.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.topLearningLanguages}
                  layout="vertical"
                  margin={{ left: 8, top: 8 }}
                >
                  <CartesianGrid horizontal={false} stroke="var(--color-border)" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="language"
                    tick={{ fill: "var(--color-foreground)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-muted)" }} />
                  <Bar dataKey="count" fill="var(--color-accent)" radius={[0, 4, 4, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
