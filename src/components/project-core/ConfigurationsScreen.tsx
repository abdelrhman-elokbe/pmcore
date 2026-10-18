import { Link } from "@tanstack/react-router";
import { usePlatform } from "@/lib/platform/context";
import { brandingStore } from "./configStores";
import { Palette, Globe2, Network, Activity, KeyRound } from "lucide-react";
import { CURRENCIES, RATES_TO_AED } from "@/components/client-preview/currency";
import { Field, SelectField, TextField, SectionHeader } from "./primitives";

export function ConfigurationsScreen() {
  const { tenantId } = usePlatform();
  const [b, setB] = brandingStore.use(tenantId);
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <SectionHeader icon={Palette} title="Branding" tone="text-primary bg-primary-soft" />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Platform name (English)">
            <TextField value={b.nameEn} onChange={(e) => setB((p) => ({ ...p, nameEn: e.target.value }))} />
          </Field>
          <Field label="Platform name (Arabic)">
            <TextField dir="rtl" value={b.nameAr} onChange={(e) => setB((p) => ({ ...p, nameAr: e.target.value }))} />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <SectionHeader icon={Globe2} title="Regional settings" tone="text-teal bg-teal-soft" />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Date format">
            <SelectField value={b.dateFormat} onChange={(e) => setB((p) => ({ ...p, dateFormat: e.target.value }))} options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]} />
          </Field>
          <Field label="Number format">
            <SelectField value={b.numberFormat} onChange={(e) => setB((p) => ({ ...p, numberFormat: e.target.value }))} options={["1,234.56", "1.234,56", "1 234.56"]} />
          </Field>
        </div>
        <p className="mt-4 text-xs font-semibold text-muted-foreground">Project currencies (fixed list · read-only rates, 1 unit = AED)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CURRENCIES.map((c) => (
            <span key={c} className="rounded-xl border border-border px-3 py-1.5 text-sm">{c} · {RATES_TO_AED[c]}</span>
          ))}
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
          icon={Activity}
          title="Health score thresholds"
          tone="text-success bg-success-soft"
        />
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border p-4">
          <p className="min-w-0 flex-1 text-sm text-muted-foreground">
            Health score bands are now maintained in one place, under Lookups → Health Score
            Configuration.
          </p>
          <Link
            to="/project-core"
            search={{ screen: "lookups" }}
            className="flex h-10 items-center rounded-xl border border-border px-4 text-sm font-semibold text-primary transition-colors hover:bg-muted"
          >
            Open Health Score Configuration
          </Link>
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
          </Field>
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
