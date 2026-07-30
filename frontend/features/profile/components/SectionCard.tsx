"use client";

import type { ComponentType, ReactNode } from "react";
import { Pencil } from "lucide-react";

export function SectionCard({
  icon: Icon,
  title,
  onEdit,
  children,
}: {
  icon: ComponentType<{ className?: string; size?: number }>;
  title: string;
  onEdit?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="bg-card border-border rounded-xl border p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="text-primary" size={18} />
          <h2 className="text-foreground text-base font-semibold">{title}</h2>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-primary flex items-center gap-1 text-xs font-medium hover:underline"
          >
            <Pencil size={12} />
            Change
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

export function SummaryField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <div className="text-foreground mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

export function EmptyValue({ children = "Not set" }: { children?: ReactNode }) {
  return <span className="text-muted-foreground font-normal">{children}</span>;
}
