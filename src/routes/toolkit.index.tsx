import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Lock, Plus, Search, Wrench } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";
import { stageLabel, toolkitStore, useTools } from "@/components/project-core/toolkitData";

export const Route = createFileRoute("/toolkit/")({
  head: () => ({
    meta: [
      { title: "Project Toolkit | Blackstone Product 2.0" },
      {
        name: "description",
        content:
          "Library of reusable analysis and document tools — Feasibility Study, Business Case, SWOT, RACI, ROI — attachable to any lifecycle stage.",
      },
      { property: "og:title", content: "Project Toolkit | Blackstone Product 2.0" },
      {
        property: "og:description",
        content: "Configure reusable project tools as optional or mandatory per stage.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ToolkitPage,
});

function ToolkitPage() {
  const tools = useTools();
  const [q, setQ] = useState("");
  const list = tools.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell
      title="Project Toolkit"
      subtitle="Reusable analysis and document capabilities that can be attached to any stage"
      actions={
        <>
          <Link
            to="/project-preview"
            className="flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Eye className="size-4" /> Project view (PM)
          </Link>
          <button
            type="button"
            onClick={() => {
              const id = `tool-${tools.length + 1}`;
              toolkitStore.add({
                id,
                name: "New tool",
                nameAr: "أداة جديدة",
                description: "Describe this tool.",
                category: "Analysis",
                icon: Wrench,
                status: "Inactive",
                config: "generic",
                requiresApproval: false,
                workflowId: null,
                outputs: [],
                allowedStages: [],
                mode: "Optional",
                mandatoryScope: { projectTypes: [], categories: [] },
                defaultStage: null,
              });
              toast.success("Tool added — configure it to activate");
            }}
            className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" /> Add tool
          </button>
        </>
      }
    >
      <div className="rounded-2xl border border-border bg-card shadow-card">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <p className="text-[15px] font-semibold text-foreground">Tools ({list.length})</p>
          <label className="relative ml-auto w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tools"
              className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs font-semibold text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Tool</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Governance</th>
                <th className="px-4 py-3">Allowed stages</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => {
                const Icon = t.icon;
                return (
                  <tr key={t.id} className="border-t border-border hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <Link
                        to="/toolkit/$toolId"
                        params={{ toolId: t.id }}
                        className="flex items-center gap-3"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-foreground">{t.name}</span>
                          <span className="block text-xs text-muted-foreground">{t.description}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.category}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                          t.mode === "Mandatory"
                            ? "bg-secondary-soft text-secondary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {t.mode === "Mandatory" ? <Lock className="size-3" /> : null}
                        {t.mode}
                      </span>
                      {t.mode === "Mandatory" ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Default: {stageLabel(t.defaultStage)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {t.allowedStages.length} stage{t.allowedStages.length === 1 ? "" : "s"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          t.status === "Active"
                            ? "bg-success-soft text-success"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
