import { useState } from "react";
import { usePlatform } from "@/lib/platform/context";
import { proposalStore } from "./configStores";
import { X } from "lucide-react";
import {
  bcFinancialFields,
  crTypes,
  healthDeductionRules,
  proposalRequiredFields,
  scheduleComponents,
  type Stage,
} from "./data";
import { CheckRow, Field, SelectField, TextField, Toggle } from "./primitives";

function ToggleRow({
  label,
  checked,
  onChange,
  onLabel,
  offLabel,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  onLabel?: string;
  offLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
      <span className="min-w-0 text-sm text-foreground">{label}</span>
      <span className="flex shrink-0 items-center gap-2">
        {onLabel ? (
          <span className="text-xs font-medium text-muted-foreground">
            {checked ? onLabel : (offLabel ?? onLabel)}
          </span>
        ) : null}
        <Toggle checked={checked} onChange={onChange} label={label} />
      </span>
    </div>
  );
}

function useToggleMap(keys: string[], initial = true) {
  return useState<Record<string, boolean>>(() =>
    Object.fromEntries(keys.map((k) => [k, initial])),
  );
}

function ProposalConfig() {
  const { tenantId } = usePlatform();
  const [settings, setSettings] = proposalStore.use(tenantId);
  const fields = settings.required;
  const confidential = settings.confidential;
  const setFields = (fn: (p: Record<string, boolean>) => Record<string, boolean>) =>
    setSettings((s) => ({ ...s, required: fn(s.required) }));
  const setConfidential = (v: boolean) => setSettings((s) => ({ ...s, confidential: v }));
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Required fields</p>
        <div className="space-y-2">
          {proposalRequiredFields.map((f) => (
            <ToggleRow
              key={f}
              label={f}
              checked={fields[f] ?? false}
              onChange={(v) => setFields((p) => ({ ...p, [f]: v }))}
            />
          ))}
        </div>
      </div>
      <ToggleRow
        label="Confidential projects allowed"
        checked={confidential}
        onChange={setConfidential}
        onLabel="Yes"
        offLabel="No"
      />
    </div>
  );
}

export function FeasibilityConfig() {
  const [types, setTypes] = useState([true, true]);
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-foreground">FS types available</p>
      <div className="grid gap-2 md:grid-cols-2">
        {["Simplified", "Detailed"].map((t, i) => (
          <CheckRow
            key={t}
            checked={types[i] ?? false}
            onChange={(v) => setTypes((p) => p.map((x, j) => (j === i ? v : x)))}
          >
            {t}
          </CheckRow>
        ))}
      </div>
      <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
        Assessment types and parameters are managed in Project Toolkit → Feasibility Study.
      </p>
    </div>
  );
}

export function BusinessCaseConfig() {
  const [types, setTypes] = useState([true, true]);
  const [financial, setFinancial] = useToggleMap(bcFinancialFields);
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">BC types available</p>
        <div className="grid gap-2 md:grid-cols-2">
          {["Internal", "External"].map((t, i) => (
            <CheckRow
              key={t}
              checked={types[i] ?? false}
              onChange={(v) => setTypes((p) => p.map((x, j) => (j === i ? v : x)))}
            >
              {t}
            </CheckRow>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Required financial fields</p>
        <div className="space-y-2">
          {bcFinancialFields.map((f) => (
            <ToggleRow
              key={f}
              label={f}
              checked={financial[f] ?? false}
              onChange={(v) => setFinancial((p) => ({ ...p, [f]: v }))}
              onLabel="Mandatory"
              offLabel="Optional"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ExecutionConfig() {
  const [components, setComponents] = useToggleMap(scheduleComponents);
  const [crs, setCrs] = useToggleMap(crTypes);
  const [rules, setRules] = useState(healthDeductionRules);
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Schedule components</p>
        <div className="grid gap-2 md:grid-cols-2">
          {scheduleComponents.map((c) => (
            <ToggleRow
              key={c}
              label={c}
              checked={components[c] ?? false}
              onChange={(v) => setComponents((p) => ({ ...p, [c]: v }))}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Change request types</p>
        <div className="grid gap-2 md:grid-cols-2">
          {crTypes.map((c) => (
            <CheckRow
              key={c}
              checked={crs[c] ?? false}
              onChange={(v) => setCrs((p) => ({ ...p, [c]: v }))}
            >
              {c}
            </CheckRow>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Health score deduction rules</p>
        <div className="space-y-2">
          {rules.map((r, i) => (
            <div
              key={r.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-2.5"
            >
              <span className="min-w-0 text-sm text-foreground">{r.name}</span>
              <TextField
                type="number"
                aria-label={`${r.name} deduction points`}
                value={r.points}
                onChange={(e) =>
                  setRules((p) =>
                    p.map((x, j) => (j === i ? { ...x, points: Number(e.target.value) } : x)),
                  )
                }
                className="h-10 w-24 shrink-0 text-right"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClosureConfig() {
  const [closure, setClosure] = useState({ strict: true, lessons: true });
  const [reasons, setReasons] = useState(["Completed", "Cancelled", "Merged", "On hold"]);
  const [reason, setReason] = useState("");
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
        <ToggleRow
          label="Strict prerequisites"
          checked={closure.strict}
          onChange={(v) => setClosure((p) => ({ ...p, strict: v }))}
        />
        <ToggleRow
          label="Lessons learned required"
          checked={closure.lessons}
          onChange={(v) => setClosure((p) => ({ ...p, lessons: v }))}
        />
      </div>
    </div>
  );
}

function BenefitsConfig() {
  const [validation, setValidation] = useState(true);
  return (
    <div className="space-y-4">
      <ToggleRow
        label="PMO validation required"
        checked={validation}
        onChange={setValidation}
        onLabel="Yes"
        offLabel="No"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="KPI update frequency">
          <SelectField options={["Monthly", "Quarterly", "Custom"]} defaultValue="Quarterly" />
        </Field>
        <Field label="Realization period (months)">
          <TextField type="number" min={1} defaultValue={12} />
        </Field>
      </div>
    </div>
  );
}

export function StageConfig({ stage }: { stage: Stage }) {
  switch (stage.config) {
    case "proposal":
      return <ProposalConfig />;
    case "execution":
      return <ExecutionConfig />;
    case "closure":
      return <ClosureConfig />;
    case "benefits":
      return <BenefitsConfig />;
    default:
      return (
        <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          This stage has no stage-specific configuration.
        </p>
      );
  }
}
