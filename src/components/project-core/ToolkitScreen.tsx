import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Eye, Lock, Plus, Search, Wrench } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { availableWorkflows } from "./data";
import { Field, SelectField, TextField, Toggle } from "./primitives";
import { BusinessCaseConfig, FeasibilityConfig } from "./StageConfigPanels";
import { AssessmentTypesSection } from "./AssessmentTypesSection";
import {
  allStageOptions,
  projectCategoryOptions,
  projectTypeOptions,
  stageLabel,
  toolkitStore,
  useTools,
  type Tool,
} from "./toolkitData";

/** Returns an error message if the toolkit config can't be saved. */
export function validateToolkit(list: Tool[]): string | null {
  const bad = list.find((t) => t.mode === "Mandatory" && !t.defaultStage);
  return bad ? `${bad.name} is mandatory but has no default stage.` : null;
}

function BackLink() {
  return (
    <Link
      to="/project-core"
      search={{ screen: "toolkit" }}
      className="flex h-9 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-foreground hover:bg-muted"
    >
      <ArrowLeft className="size-4" /> Toolkit
    </Link>
  );
}

function AddToolButton({ count }: { count: number }) {
  return (
          <button
            type="button"
            onClick={() => {
              const id = `tool-${count + 1}`;
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
  );
}

export function ToolkitList() {
  const tools = useTools();
  const [q, setQ] = useState("");
  const list = tools.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Link
          to="/project-preview"
          search={{ from: "toolkit" }}
          className="flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-foreground hover:bg-muted"
        >
          <Eye className="size-4" /> Project view (PM)
        </Link>
        <AddToolButton count={tools.length} />
      </div>
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
                        to="/project-core"
                        search={{ screen: "toolkit", tool: t.id }}
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
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <p className="mb-4 text-[15px] font-semibold text-foreground">{title}</p>
      {children}
    </section>
  );
}

function MultiChips({ options, value, onChange }: { options: { id: string; label: string }[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(on ? value.filter((x) => x !== o.id) : [...value, o.id])}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
              on ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function ToolDetail({ toolId }: { toolId: string }) {
  const tool = useTools().find((t) => t.id === toolId);
  if (!tool) return <p className="text-sm text-muted-foreground">Tool not found. <BackLink /></p>;
  const set = (p: Partial<Tool>) => toolkitStore.update(tool.id, p);
  const Icon = tool.icon;
  const workflows = availableWorkflows(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <BackLink />
        <p className="text-[15px] font-semibold text-foreground">{tool.name}</p>
        <span className="text-xs text-muted-foreground">Tool configuration</span>
      </div>
      <div className="space-y-5">
        <Card title="General">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon className="size-5" />
            </span>
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              {tool.status}
              <Toggle checked={tool.status === "Active"} onChange={(v) => set({ status: v ? "Active" : "Inactive" })} label="Active" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name (English)"><TextField value={tool.name} onChange={(e) => set({ name: e.target.value })} /></Field>
            <Field label="Name (Arabic)"><TextField dir="rtl" value={tool.nameAr} onChange={(e) => set({ nameAr: e.target.value })} /></Field>
            <Field label="Description" className="md:col-span-2"><TextField value={tool.description} onChange={(e) => set({ description: e.target.value })} /></Field>
            <Field label="Category">
              <SelectField options={["Analysis", "Governance", "Financial", "Planning"]} value={tool.category} onChange={(e) => set({ category: e.target.value as Tool["category"] })} />
            </Field>
          </div>
        </Card>

        <Card title="Governance">
          <div className="inline-flex rounded-xl bg-muted p-1">
            {(["Optional", "Mandatory"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set({ mode: m })}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                  tool.mode === m ? "bg-card text-primary shadow-card" : "text-muted-foreground",
                )}
              >
                {m === "Mandatory" ? <Lock className="size-3.5" /> : null}
                {m}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {tool.mode === "Optional"
              ? "Available in the library. The Project Manager decides per project whether to add it, and to which allowed stage."
              : "Auto-attached to every matching new project in its default stage. The PM cannot remove it."}
          </p>
          {tool.mode === "Mandatory" ? (
            <div className="mt-4 space-y-4">
              <Field label="Default stage">
                <select
                  value={tool.defaultStage ?? ""}
                  onChange={(e) => set({ defaultStage: e.target.value || null })}
                  className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="">— Select stage —</option>
                  {allStageOptions.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </Field>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Apply to project types (none = all)</p>
                <MultiChips options={projectTypeOptions.map((x) => ({ id: x, label: x }))} value={tool.mandatoryScope.projectTypes} onChange={(v) => set({ mandatoryScope: { ...tool.mandatoryScope, projectTypes: v } })} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Apply to project categories (none = all)</p>
                <MultiChips options={projectCategoryOptions.map((x) => ({ id: x, label: x }))} value={tool.mandatoryScope.categories} onChange={(v) => set({ mandatoryScope: { ...tool.mandatoryScope, categories: v } })} />
              </div>
            </div>
          ) : null}
        </Card>

        <Card title="Allowed stages">
          <p className="mb-3 text-sm text-muted-foreground">The tool can be attached to any of these stages or sub-stages.</p>
          <MultiChips options={allStageOptions} value={tool.allowedStages} onChange={(v) => set({ allowedStages: v })} />
        </Card>

        <Card title="Fields & template">
          {tool.config === "feasibility" ? (
            <div className="space-y-5">
              <FeasibilityConfig />
              <AssessmentTypesSection />
            </div>
          ) : tool.config === "businessCase" ? (
            <BusinessCaseConfig />
          ) : (
            <Field label="Template sections (one per line)">
              <textarea rows={4} defaultValue={"Summary\nDetails\nConclusion"} className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-primary" />
            </Field>
          )}
        </Card>

        <Card title="Approval">
          <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <span className="text-sm text-foreground">Requires approval</span>
            <Toggle checked={tool.requiresApproval} onChange={(v) => set({ requiresApproval: v })} label="Requires approval" />
          </div>
          {tool.requiresApproval ? (
            <Field label="Approval workflow" className="mt-4">
              <select value={tool.workflowId ?? ""} onChange={(e) => set({ workflowId: e.target.value || null })} className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary">
                <option value="">— None —</option>
                {workflows.map((w) => <option key={w.id} value={w.id}>{`${w.title} · ${w.version}`}</option>)}
              </select>
            </Field>
          ) : null}
        </Card>

        <Card title="Output & attachments">
          <Field label="Outputs (comma separated)">
            <TextField value={tool.outputs.join(", ")} onChange={(e) => set({ outputs: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
          </Field>
        </Card>
      </div>
    </div>
  );
}
