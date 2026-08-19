import { useState } from "react";
import { GripVertical, Plus, Check, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  approvalChain,
  businessRules,
  confidentialChain,
  entryCriteria,
  exitCriteria,
  initialStages,
  type Stage,
} from "./data";
import { CheckRow, Field, SelectField, TextField, Toggle } from "./primitives";

const tabs = [
  "General",
  "Entry criteria",
  "Exit criteria",
  "Business rules",
  "Approval chain",
  "Stage config",
] as const;
type Tab = (typeof tabs)[number];

function CriteriaList({ items, id }: { items: string[]; id: string }) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map((_, i) => i < 3));
  const [custom, setCustom] = useState("");
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
      <Field label="Custom rule">
        <TextField
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Describe an additional rule for this client"
        />
      </Field>
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

function StageConfig({ stage }: { stage: Stage }) {
  const [fsTypes, setFsTypes] = useState([true, true]);
  const [exec, setExec] = useState<Record<string, boolean>>({
    Phases: true,
    Milestones: true,
    Deliverables: true,
    Tasks: true,
    "Gantt chart": false,
    "CR types per type": true,
  });
  const [closure, setClosure] = useState({ strict: true, lessons: true });
  const [reasons, setReasons] = useState(["Completed", "Cancelled", "Merged", "On hold"]);
  const [reason, setReason] = useState("");

  if (stage.config === "feasibility") {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-foreground">FS types available</p>
        <div className="grid gap-2 md:grid-cols-2">
          {["Simplified", "Detailed"].map((t, i) => (
            <CheckRow
              key={t}
              checked={fsTypes[i] ?? false}
              onChange={(v) => setFsTypes((p) => p.map((x, j) => (j === i ? v : x)))}
            >
              {t}
            </CheckRow>
          ))}
        </div>
        <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          Assessment types are managed from Configurations.
        </p>
      </div>
    );
  }

  if (stage.config === "execution") {
    return (
      <div className="grid gap-2 md:grid-cols-2">
        {Object.entries(exec).map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
          >
            <span className="text-sm text-foreground">{k}</span>
            <Toggle checked={v} onChange={(nv) => setExec((p) => ({ ...p, [k]: nv }))} label={k} />
          </div>
        ))}
      </div>
    );
  }

  if (stage.config === "closure") {
    return (
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Closure reasons</p>
          <div className="flex flex-wrap gap-2">
            {reasons.map((r) => (
              <span
                key={r}
                className="flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-sm font-medium text-accent-foreground"
              >
                {r}
                <button
                  type="button"
                  aria-label={`Remove ${r}`}
                  onClick={() => setReasons((p) => p.filter((x) => x !== r))}
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!reason.trim()) return;
              setReasons((p) => [...p, reason.trim()]);
              setReason("");
            }}
          >
            <TextField
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Add closure reason"
              className="max-w-xs"
            />
            <button
              type="submit"
              className="h-11 rounded-xl border border-dashed border-primary px-4 text-sm font-semibold text-primary"
            >
              Add
            </button>
          </form>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <span className="text-sm text-foreground">Strict prerequisites</span>
            <Toggle
              checked={closure.strict}
              onChange={(v) => setClosure((p) => ({ ...p, strict: v }))}
              label="Strict prerequisites"
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <span className="text-sm text-foreground">Lessons learned required</span>
            <Toggle
              checked={closure.lessons}
              onChange={(v) => setClosure((p) => ({ ...p, lessons: v }))}
              label="Lessons learned required"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
      This stage has no stage-specific configuration.
    </p>
  );
}

function DetailPanel({
  stage,
  onChange,
}: {
  stage: Stage;
  onChange: (patch: Partial<Stage>) => void;
}) {
  const [tab, setTab] = useState<Tab>("General");
  const [scope, setScope] = useState("new");

  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="bg-primary px-5 py-4">
        <p className="text-[15px] font-semibold text-primary-foreground">{stage.name}</p>
        <p className="text-xs text-primary-foreground/80">Stage configuration · Project Core</p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border px-3 pt-3">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-t-xl px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-5">
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

        {tab === "Approval chain" && (
          <div className="space-y-6">
            <div className="space-y-2">
              {approvalChain.map((s, i) => (
                <ApprovalStep key={s.name} index={i + 1} name={s.name} role={s.role} />
              ))}
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
              >
                <Plus className="size-4" /> Add step
              </button>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Confidential projects — separate approval chain
              </h3>
              <div className="space-y-2">
                {confidentialChain.map((s, i) => (
                  <ApprovalStep key={s.name} index={i + 1} name={s.name} role={s.role} />
                ))}
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
                >
                  <Plus className="size-4" /> Add step
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "Stage config" && <StageConfig stage={stage} />}
      </div>
    </section>
  );
}

export function StagesScreen() {
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [selected, setSelected] = useState<string | null>("feasibility");
  const active = stages.find((s) => s.id === selected) ?? null;

  const patch = (id: string, p: Partial<Stage>) =>
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, ...p } : s)));

  return (
    <div>
      <div className="space-y-2">
        {stages.map((stage, i) => {
          const isActive = stage.id === selected;
          return (
            <div
              key={stage.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(stage.id)}
              onKeyDown={(e) => e.key === "Enter" && setSelected(stage.id)}
              className={cn(
                "flex cursor-pointer flex-wrap items-center gap-3 rounded-2xl border px-4 py-3.5 transition-colors",
                isActive
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-card hover:bg-muted/50",
                !stage.enabled && "opacity-60",
              )}
            >
              <GripVertical className="size-4 cursor-grab text-muted-foreground" />
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-foreground">{stage.name}</p>
                <p className="truncate text-xs text-muted-foreground">{stage.meta}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    stage.mandatory
                      ? "bg-secondary-soft text-secondary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {stage.mandatory ? "Mandatory" : "Optional"}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  {stage.steps} steps
                </span>
                <span onClick={(e) => e.stopPropagation()}>
                  <Toggle
                    checked={stage.enabled}
                    onChange={(v) => patch(stage.id, { enabled: v })}
                    label={`Enable ${stage.name}`}
                  />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {active ? <DetailPanel stage={active} onChange={(p) => patch(active.id, p)} /> : null}
    </div>
  );
}
