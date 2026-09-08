import { useState } from "react";
import {
  GripVertical,
  Check,
  RotateCcw,
  X,
  ChevronDown,
  Lock,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  availableWorkflows,
  businessRules,
  entryCriteria,
  exitCriteria,
  getAssignment,
  initialPhases,
  mockWorkflows,
  workflowAssignments,
  type Phase,
  type Stage,
  type WorkflowDef,
} from "./data";
import { CheckRow, Field, SelectField, TextField, Toggle } from "./primitives";
import { StageConfig } from "./StageConfigPanels";

const tabs = [
  "General",
  "Entry criteria",
  "Exit criteria",
  "Business rules",
  "Approval workflow",
  "Stage config",
] as const;
type Tab = (typeof tabs)[number];

function CriteriaList({ items, id }: { items: string[]; id: string }) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map((_, i) => i < 3));
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Select the conditions that must be satisfied before the stage can{" "}
        {id === "entry" ? "be started" : "be completed"}.
      </p>
      <div className="grid gap-2 md:grid-cols-2">
        {items.map((item, i) => (
          <CheckRow
            key={item}
            checked={checked[i] ?? false}
            onChange={(v) => setChecked((prev) => prev.map((p, j) => (j === i ? v : p)))}
          >
            {item}
          </CheckRow>
        ))}
      </div>
    </div>
  );
}

function ApprovalStep({ index, name, role }: { index: number; name: string; role: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
      <span className="flex size-8 items-center justify-center rounded-full bg-navy text-sm font-semibold text-navy-foreground">
        {index}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
          <Check className="size-3" /> Approve
        </span>
        <span className="flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning">
          <RotateCcw className="size-3" /> Return
        </span>
        <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
          <X className="size-3" /> Reject
        </span>
      </div>
    </div>
  );
}

function WorkflowPreview({ workflow }: { workflow: WorkflowDef }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Steps are inherited from the Workflows module and cannot be edited here.
        </p>
        <Link
          to="/workflows"
          className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-soft"
        >
          <ExternalLink className="size-3.5" /> Manage in Workflows
        </Link>
      </div>
      {workflow.steps.map((s) => (
        <ApprovalStep
          key={s.order}
          index={s.order}
          name={s.name}
          role={`Assignee: ${s.assigneeRole}`}
        />
      ))}
    </div>
  );
}

function WorkflowSelect({
  label,
  value,
  onChange,
  confidential,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  confidential: boolean;
}) {
  const options = availableWorkflows(confidential);
  const selectedRaw = value ? mockWorkflows.find((w) => w.id === value) : undefined;
  const unavailable =
    !!value && (!selectedRaw || selectedRaw.status === "Disabled" || selectedRaw.consumer !== "Project Core");
  const selected = unavailable ? undefined : selectedRaw;

  return (
    <div className="space-y-3">
      <Field label={label}>
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="">— None —</option>
          {options.map((w) => (
            <option key={w.id} value={w.id}>
              {`${w.title} · ${w.key} · ${w.version} · ${w.steps.length} states`}
            </option>
          ))}
        </select>
      </Field>

      {unavailable ? (
        <p className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning-soft px-4 py-3 text-sm text-warning">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          The assigned workflow is no longer available. Select a replacement.
        </p>
      ) : null}

      {selected ? (
        <>
          <p className="text-sm font-semibold text-foreground">
            {selected.title}{" "}
            <span className="text-xs font-medium text-muted-foreground">
              {selected.key} · {selected.version}
            </span>
          </p>
          <WorkflowPreview workflow={selected} />
        </>
      ) : !unavailable ? (
        <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          No workflow assigned. Select a workflow to define the approval path for this stage.
        </p>
      ) : null}
    </div>
  );
}

function ApprovalWorkflowTab({
  stageId,
  onChanged,
}: {
  stageId: string;
  onChanged?: (() => void) | undefined;
}) {
  const [assignment, setAssignment] = useState(() => getAssignment(stageId));
  const update = (patch: Partial<typeof assignment>) =>
    setAssignment((prev) => {
      const next = { ...prev, ...patch };
      workflowAssignments[stageId] = next;
      onChanged?.();
      return next;
    });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">
          Workflow assignment (standard projects)
        </h3>
        <WorkflowSelect
          label="Assigned workflow"
          value={assignment.standard}
          onChange={(v) => update({ standard: v })}
          confidential={false}
        />
      </div>

      <div className="space-y-3 border-t border-border pt-5">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
          <span className="text-sm text-foreground">
            Use a different workflow for confidential projects
          </span>
          <Toggle
            checked={assignment.useConfidential}
            onChange={(v) => update({ useConfidential: v })}
            label="Use a different workflow for confidential projects"
          />
        </div>
        {assignment.useConfidential ? (
          <WorkflowSelect
            label="Assigned workflow (confidential projects)"
            value={assignment.confidential}
            onChange={(v) => update({ confidential: v })}
            confidential
          />
        ) : null}
      </div>
    </div>
  );
}


function DetailPanel({
  stage,
  onChange,
  onAssignmentChange,
}: {
  stage: Stage;
  onChange: (patch: Partial<Stage>) => void;
  onAssignmentChange?: (() => void) | undefined;
}) {
  const [tab, setTab] = useState<Tab>("General");
  const [scope, setScope] = useState("new");

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="shrink-0 bg-primary px-5 py-3">
        <p className="text-[15px] font-semibold text-primary-foreground">{stage.name}</p>
        <p className="text-xs text-primary-foreground/80">Stage configuration · Project Core</p>
      </div>

      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border px-3 pt-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-t-xl px-4 py-2 text-sm font-medium transition-colors",
              tab === t
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {tab === "General" && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Stage name (English)">
                <TextField
                  value={stage.name}
                  onChange={(e) => onChange({ name: e.target.value })}
                />
              </Field>
              <Field label="Stage name (Arabic)">
                <TextField
                  dir="rtl"
                  value={stage.nameAr}
                  onChange={(e) => onChange({ nameAr: e.target.value })}
                />
              </Field>
              <Field label="Description" className="md:col-span-2">
                <textarea
                  defaultValue={stage.meta}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </Field>
              <Field label="Stage type">
                <SelectField
                  options={["Optional", "Mandatory"]}
                  value={stage.mandatory ? "Mandatory" : "Optional"}
                  onChange={(e) => onChange({ mandatory: e.target.value === "Mandatory" })}
                />
              </Field>
              <Field label="Hold feature">
                <SelectField options={["Enabled", "Disabled"]} defaultValue="Enabled" />
              </Field>
              <Field label="Hold duration (days)">
                <TextField type="number" defaultValue={30} min={0} />
              </Field>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-foreground">
                Apply config changes to
              </legend>
              <div className="flex flex-wrap gap-4">
                {[
                  { v: "new", l: "New projects only" },
                  { v: "all", l: "Existing + new projects" },
                ].map((o) => (
                  <label key={o.v} className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="radio"
                      name="scope"
                      value={o.v}
                      checked={scope === o.v}
                      onChange={() => setScope(o.v)}
                      className="size-4 accent-[var(--primary)]"
                    />
                    {o.l}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {tab === "Entry criteria" && <CriteriaList items={entryCriteria} id="entry" />}
        {tab === "Exit criteria" && <CriteriaList items={exitCriteria} id="exit" />}

        {tab === "Business rules" && (
          <div className="grid gap-4 md:grid-cols-2">
            {businessRules.map((r) => (
              <Field key={r.label} label={r.label}>
                <SelectField options={r.options} defaultValue={r.options[0]} />
              </Field>
            ))}
          </div>
        )}

        {tab === "Approval workflow" && (
          <ApprovalWorkflowTab stageId={stage.id} onChanged={onAssignmentChange} />
        )}


        {tab === "Stage config" && <StageConfig stage={stage} />}
      </div>
    </section>
  );
}

export function StagesScreen() {
  const [phases, setPhases] = useState<Phase[]>(initialPhases);
  const [selected, setSelected] = useState<string | null>("feasibility");
  const [, setTick] = useState(0);

  const patch = (id: string, p: Partial<Stage>) =>
    setPhases((prev) =>
      prev.map((ph) => ({
        ...ph,
        stages: ph.stages.map((s) => (s.id === id ? { ...s, ...p } : s)),
      })),
    );

  const selectedStage = phases
    .flatMap((phase) => phase.stages)
    .find((stage) => stage.id === selected);

  return (
    <div className="flex h-[calc(100vh-110px)] min-h-[620px] flex-col gap-3 overflow-hidden">
      <div className="grid shrink-0 grid-cols-1 gap-3 xl:grid-cols-[3fr_1fr_2fr]">
        {phases.map((phase, pi) => (
          <section key={phase.id} className="min-w-0 rounded-xl border border-border bg-card p-2.5">
            <div className="mb-2 flex min-w-0 items-center gap-2 px-1">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-navy text-xs font-semibold text-navy-foreground">
                {pi + 1}
              </span>
              <p className="truncate text-sm font-semibold text-foreground">{phase.name}</p>
              <Lock className="ml-auto size-3.5 shrink-0 text-muted-foreground" aria-label="Fixed phase" />
            </div>

            <div className="flex gap-2">
              {phase.stages.map((stage, i) => {
                const isActive = stage.id === selected;
                const needsWorkflow = stage.mandatory && !getAssignment(stage.id).standard;
                return (
                  <div
                    key={stage.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(stage.id)}
                    onKeyDown={(e) => e.key === "Enter" && setSelected(stage.id)}
                    className={cn(
                      "group min-w-0 flex-1 cursor-pointer rounded-xl border px-3 py-2.5 transition-colors",
                      isActive
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-card hover:bg-muted/50",
                      !stage.enabled && "opacity-60",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="size-3.5 shrink-0 cursor-grab text-muted-foreground" />
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                        {pi + 1}.{i + 1}
                      </span>
                      <p className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">{stage.name}</p>
                      <span onClick={(e) => e.stopPropagation()}>
                        <Toggle
                          checked={stage.enabled}
                          onChange={(v) => patch(stage.id, { enabled: v })}
                          label={`Enable ${stage.name}`}
                        />
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 pl-5">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          stage.mandatory
                            ? "bg-secondary-soft text-secondary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {stage.mandatory ? "Mandatory" : "Optional"}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {stage.steps} steps
                      </span>
                      {needsWorkflow ? (
                        <span title="Assign an approval workflow before saving." className="text-warning">
                          <AlertTriangle className="size-3.5" />
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {selectedStage ? (
        <DetailPanel
          key={selectedStage.id}
          stage={selectedStage}
          onChange={(p) => patch(selectedStage.id, p)}
          onAssignmentChange={() => setTick((t) => t + 1)}
        />
      ) : null}
    </div>
  );
}

