import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { initialFeatureSections, type FeatureSection } from "./data";
import { Toggle } from "./primitives";

export function FeaturesScreen() {
  const [sections, setSections] = useState<FeatureSection[]>(initialFeatureSections);
  const [open, setOpen] = useState<string[]>(["dashboard"]);

  const toggleItem = (sid: string, idx: number, v: boolean) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sid
          ? { ...s, items: s.items.map((it, i) => (i === idx ? { ...it, enabled: v } : it)) }
          : s,
      ),
    );

  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const expanded = open.includes(section.id);
        const count = section.items.filter((i) => i.enabled).length;
        const Icon = section.icon;
        return (
          <section
            key={section.id}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
          >
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() =>
                setOpen((p) =>
                  p.includes(section.id) ? p.filter((x) => x !== section.id) : [...p, section.id],
                )
              }
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/40"
            >
              <span className={cn("flex size-9 items-center justify-center rounded-xl", section.tone)}>
                <Icon className="size-[18px]" />
              </span>
              <span className="text-[15px] font-semibold text-foreground">{section.title}</span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                {count} / {section.items.length} enabled
              </span>
              <ChevronDown
                className={cn(
                  "ml-auto size-4 text-muted-foreground transition-transform",
                  expanded && "rotate-180",
                )}
              />
            </button>

            {expanded && (
              <div className="grid gap-2 border-t border-border p-4 md:grid-cols-2">
                {section.items.map((item, i) => (
                  <div
                    key={item.name}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-opacity",
                      !item.enabled && "bg-muted/40 text-muted-foreground opacity-40",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => toggleItem(section.id, i, e.target.checked)}
                      aria-label={`Select ${item.name}`}
                      className="size-4 accent-[var(--primary)]"
                    />
                    <span className={cn("text-sm", item.enabled ? "text-foreground" : "text-muted-foreground")}>
                      {item.name}
                    </span>
                    <span className="ml-auto">
                      <Toggle
                        checked={item.enabled}
                        onChange={(v) => toggleItem(section.id, i, v)}
                        label={item.name}
                      />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
