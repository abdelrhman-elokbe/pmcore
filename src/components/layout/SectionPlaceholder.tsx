import type { ComponentType } from "react";
import { AppShell } from "@/components/layout/AppShell";

export function SectionPlaceholder({
  title,
  subtitle,
  icon: Icon,
  items,
}: {
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  items: string[];
}) {
  return (
    <AppShell title={title} subtitle={subtitle}>
      <section className="rounded-2xl border border-border bg-card p-8 shadow-card">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icon className="size-6" />
        </span>
        <h2 className="mt-4 text-[17px] font-semibold text-foreground">{title}</h2>
        <p className="mt-1 max-w-[560px] text-sm text-muted-foreground">{subtitle}</p>
        <ul className="mt-5 grid max-w-[720px] gap-2 sm:grid-cols-2">
          {items.map((i) => (
            <li
              key={i}
              className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground"
            >
              {i}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs text-muted-foreground">
          These sections are being built in the next delivery phase.
        </p>
      </section>
    </AppShell>
  );
}
