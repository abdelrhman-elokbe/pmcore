import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, Plus, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { initialPhases } from "@/components/project-core/data";
import { toolsForStage, useTools } from "@/components/project-core/toolkitData";

export const Route = createFileRoute("/project-preview")({
  head: () => ({
    meta: [
      { title: "Project View (PM Preview) | Blackstone Product 2.0" },
      { name: "description", content: "Preview how a Project Manager sees stages, locked mandatory tools and optional toolkit items." },
      { property: "og:title", content: "Project View (PM Preview) | Blackstone Product 2.0" },
      { property: "og:description", content: "Sample project with mandatory and optional toolkit items per stage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectPreview,
});

function ProjectPreview() {
  const tools = useTools();
  const [added, setAdded] = useState<Record<string, string[]>>({ execution: ["raci"] });
  const [picker, setPicker] = useState<string | null>(null);

  return (
    <AppShell title="Project view (PM)" subtitle="Preview · Heritage Site Digitisation · Strategic · Archaeological Projects"
      actions={
        <Link to="/project-core" search={{ screen: "toolkit" }} className="flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-foreground hover:bg-muted">
          <ArrowLeft className="size-4" /> Project Toolkit
        </Link>
      }
    >
      <div className="space-y-5">
        {initialPhases.map((ph, pi) => (
          <section key={ph.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-navy text-sm font-semibold text-navy-foreground">{pi + 1}</span>
              <p className="text-[15px] font-semibold text-foreground">{ph.name}</p>
            </div>
            <div className="space-y-3">
              {ph.stages.filter((s) => s.enabled).map((s) => {
                const { mandatory, optional } = toolsForStage(tools, s.id);
                const mine = (added[s.id] ?? []).map((id) => tools.find((t) => t.id === id)).filter((t) => !!t);
                const remaining = optional.filter((t) => !(added[s.id] ?? []).includes(t.id));
                return (
                  <div key={s.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-foreground">{s.name}</p>
                      <button
                        type="button"
                        disabled={remaining.length === 0}
                        onClick={() => setPicker(picker === s.id ? null : s.id)}
                        className="ml-auto flex items-center gap-1.5 rounded-xl border border-dashed border-primary px-3 py-1.5 text-xs font-semibold text-primary disabled:opacity-40"
                      >
                        <Plus className="size-3.5" /> Add from toolkit
                      </button>
                    </div>
                    {picker === s.id ? (
                      <div className="mt-3 flex flex-wrap gap-2 rounded-xl bg-muted p-3">
                        {remaining.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setAdded((p) => ({ ...p, [s.id]: [...(p[s.id] ?? []), t.id] }));
                              setPicker(null);
                            }}
                            className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground hover:border-primary"
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {mandatory.map((t) => (
                        <span key={t.id} title="Mandatory — required by your organisation" className="flex items-center gap-1.5 rounded-full bg-secondary-soft px-3 py-1.5 text-xs font-semibold text-secondary">
                          <Lock className="size-3" /> {t.name}
                        </span>
                      ))}
                      {mine.map((t) => (
                        <span key={t.id} className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
                          {t.name}
                          <button type="button" aria-label={`Remove ${t.name}`} onClick={() => setAdded((p) => ({ ...p, [s.id]: (p[s.id] ?? []).filter((x) => x !== t.id) }))}>
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                      {mandatory.length + mine.length === 0 ? <span className="text-xs text-muted-foreground">No tools attached</span> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
