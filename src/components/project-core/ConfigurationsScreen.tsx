import { useState } from "react";
import { Palette, Globe2, Network, Activity, KeyRound, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { Field, SelectField, TextField, SectionHeader } from "./primitives";
import { AssessmentTypesSection } from "./AssessmentTypesSection";

const primaryColors = ["#6d3ff5", "#0f9d8f", "#e4436f", "#f0932b", "#2c3a5a"];
const secondaryColors = ["#8b5cf6", "#22c1a4", "#f472b6", "#fbbf24"];

function Swatches({
  colors,
  value,
  onChange,
  label,
}: {
  colors: string[];
  value: string;
  onChange: (c: string) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3" role="radiogroup" aria-label={label}>
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={`${label} ${c}`}
          onClick={() => onChange(c)}
          className={cn(
            "size-9 rounded-full border-2 transition-transform",
            value === c ? "scale-110 border-foreground" : "border-transparent",
          )}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

function Threshold({
  color,
  label,
  value,
  onChange,
  hint,
  disabled,
}: {
  color: string;
  label: string;
  value: number;
  onChange?: (v: number) => void;
  hint: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className={cn("size-2.5 shrink-0 rounded-full", color)} />
        <span className="w-20 shrink-0 text-sm font-medium text-foreground">{label}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          disabled={disabled}
          aria-label={`${label} threshold`}
          onChange={(e) => onChange?.(Number(e.target.value))}
          className="h-1.5 flex-1 accent-[var(--primary)] disabled:opacity-50"
        />
        <span className="w-12 text-right text-sm font-semibold text-foreground">{value}%</span>
      </div>
      <p className="mt-1.5 pl-[38px] text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function ConfigurationsScreen() {
  const [primary, setPrimary] = useState(primaryColors[0]!);
  const [secondary, setSecondary] = useState(secondaryColors[0]!);
  const [green, setGreen] = useState(80);
  const [yellow, setYellow] = useState(50);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <SectionHeader icon={Palette} title="Branding" tone="text-primary bg-primary-soft" />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Platform name (English)">
            <TextField defaultValue="Blackstone Project Core" />
          </Field>
          <Field label="Platform name (Arabic)">
            <TextField dir="rtl" defaultValue="بلاك ستون لإدارة المشاريع" />
          </Field>
          <Field label="Primary colour">
            <Swatches
              colors={primaryColors}
              value={primary}
              onChange={setPrimary}
              label="Primary colour"
            />
          </Field>
          <Field label="Secondary colour">
            <Swatches
              colors={secondaryColors}
              value={secondary}
              onChange={setSecondary}
              label="Secondary colour"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <SectionHeader icon={Globe2} title="Regional settings" tone="text-teal bg-teal-soft" />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Default language">
            <SelectField options={["English", "Arabic", "French"]} />
          </Field>
          <Field label="Currency">
            <SelectField options={["SAR", "AED", "USD", "EUR"]} />
          </Field>
          <Field label="Date format">
            <SelectField options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]} />
          </Field>
          <Field label="Number format">
            <SelectField options={["1,234.56", "1.234,56", "1 234.56"]} />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <SectionHeader
          icon={Network}
          title="Organisational structure"
          tone="text-secondary bg-secondary-soft"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="L0 label">
            <TextField defaultValue="Entity" />
          </Field>
          <Field label="L1 label">
            <TextField defaultValue="Sector" />
          </Field>
          <Field label="L2 label">
            <TextField defaultValue="Department" />
          </Field>
          <Field label="L3 label">
            <TextField defaultValue="Team" />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <SectionHeader
          icon={ListChecks}
          title="FS Assessment Types"
          tone="text-primary bg-primary-soft"
        />
        <AssessmentTypesSection />
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <SectionHeader
          icon={Activity}
          title="Health score thresholds"
          tone="text-success bg-success-soft"
        />
        <div className="max-w-[480px] space-y-5 rounded-2xl border border-border p-4">
          <Threshold
            color="bg-success"
            label="Green"
            value={green}
            onChange={(v) => setGreen(Math.max(v, yellow + 1))}
            hint="Projects scoring at or above this value are healthy."
          />
          <Threshold
            color="bg-warning"
            label="Yellow"
            value={yellow}
            onChange={(v) => setYellow(Math.min(v, green - 1))}
            hint="Projects between this value and the green threshold are at risk."
          />
          <div>
            <div className="flex items-center gap-3">
              <span className="size-2.5 shrink-0 rounded-full bg-destructive" />
              <span className="w-20 shrink-0 text-sm font-medium text-foreground">Red</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.max(yellow - 1, 0)}
                disabled
                readOnly
                aria-label="Red threshold"
                className="h-1.5 flex-1 accent-[var(--primary)] opacity-50"
              />
              <span className="w-28 text-right text-xs text-muted-foreground">Automatic</span>
            </div>
            <p className="mt-1.5 pl-[38px] text-xs text-muted-foreground">
              Computed automatically as everything below the yellow threshold.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <SectionHeader icon={KeyRound} title="License" tone="text-warning bg-warning-soft" />
        <p className="-mt-1 mb-4 text-xs text-muted-foreground">
          View only. Licensing is managed in Tenants &amp; Licensing.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Max active users">
            <TextField readOnly type="number" defaultValue={250} min={1} />
          </Field>
          <Field label="License expiry">
            <TextField readOnly type="date" defaultValue="2026-08-21" />
          <Field label="Licensed modules">
            <TextField readOnly defaultValue="Project Core, PMO Dashboard, Reports Center" />
          </Field>
          <Field label="License key">
            <TextField
              readOnly
              defaultValue="PC20-9F3A-7BD1-42EE-C5A8"
              className="font-mono tracking-wider"
            />
          </Field>
        </div>
      </section>
    </div>
  );
}
