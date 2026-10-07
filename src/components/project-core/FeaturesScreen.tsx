import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { type FeatureSection } from "./data";
import { usePlatform } from "@/lib/platform/context";
import { featuresStore } from "./configStores";
import { Toggle } from "./primitives";

export function FeaturesScreen() {
  const { tenantId } = usePlatform();
  const [state, setState] = featuresStore.use(tenantId);
  const sections = state.sections;
  const sectionEnabled = state.enabled;
  const setSections = (fn: (p: FeatureSection[]) => FeatureSection[]) =>
    setState((s) => ({ ...s, sections: fn(s.sections) }));
  const setSectionEnabled = (fn: (p: Record<string, boolean>) => Record<string, boolean>) =>
    setState((s) => ({ ...s, enabled: fn(s.enabled) }));
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
        const active = sectionEnabled[section.id] !== false;
        const expanded = active && open.includes(section.id);
        const count = section.items.filter((i) => i.enabled).length;
        const Icon = section.icon;
        return (
          <section
            key={section.id}
            className={cn(
              "overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-opacity",
              !active && "opacity-50",
            )}
          >
            <div className="flex w-full items-center gap-3 px-5 py-4">
              <button
                type="button"
                aria-expanded={expanded}
                disabled={!active}
                onClick={() =>
                  setOpen((p) =>
                    p.includes(section.id) ? p.filter((x) => x !== section.id) : [...p, section.id],
                  )
                }
                className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-not-allowed"
              >
                <span className={cn("flex size-9 items-center justify-center rounded-xl", section.tone)}>
                  <Icon className="size-[18px]" />
                </span>
                <span className="text-[15px] font-semibold text-foreground">{section.title}</span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  {active ? `${count} / ${section.items.length} enabled` : "Disabled"}
                </span>
                <ChevronDown
                  className={cn(
                    "ml-auto size-4 text-muted-foreground transition-transform",
                    expanded && "rotate-180",
                  )}
                />
              </button>
              <Toggle
                checked={active}
                onChange={(v) => setSectionEnabled((p) => ({ ...p, [section.id]: v }))}
                label={`Enable ${section.title}`}
              />
            </div>

            {expanded && (
              <div className="grid gap-2 border-t border-border p-4 md:grid-cols-2">
                {section.items.map((item, i) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => toggleItem(section.id, i, !item.enabled)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left transition-opacity",
                      !item.enabled && "bg-muted/40 text-muted-foreground opacity-40",
                    )}
                  >
                    <span className={cn("flex-1 text-sm", item.enabled ? "text-foreground" : "text-muted-foreground")}>
                      {item.name}
                    </span>
                    <span className="ml-auto">
                      <Toggle
                        checked={item.enabled}
                        onChange={(v) => toggleItem(section.id, i, v)}
                        label={item.name}
                      />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
