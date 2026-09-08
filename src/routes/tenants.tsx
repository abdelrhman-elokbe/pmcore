import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Building2, Check, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";
import { Field, SelectField, TextField, Toggle } from "@/components/project-core/primitives";
import { platformProducts, tenants } from "@/lib/platform/data";
import { usePlatform } from "@/lib/platform/context";

export const Route = createFileRoute("/tenants")({
  head: () => ({
    meta: [
      { title: "Tenants & Licensing | Blackstone Product 2.0" },
      {
        name: "description",
        content:
          "Manage client tenants, subscribed products, user entitlements, licence expiry and onboarding of new instances.",
      },
      { property: "og:title", content: "Tenants & Licensing | Blackstone Product 2.0" },
      {
        property: "og:description",
        content: "Tenant registry, licence entitlements and the new-tenant onboarding wizard.",
      },
    ],
  }),
  component: TenantsPage,
});

const steps = [
  "Tenant identity",
  "Products & licence",
  "Start from blueprint",
  "Organisation structure",
  "Users & roles",
  "Branding & review",
] as const;

function Wizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [products, setProducts] = useState<string[]>(["Project Core"]);
  const [blueprint, setBlueprint] = useState("DCAA template");
  const [sso, setSso] = useState(true);
  const [depth, setDepth] = useState(4);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30">
      <div className="flex h-full w-full max-w-[720px] flex-col bg-card shadow-raised">
        <header className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-[16px] font-semibold text-foreground">New tenant</h2>
            <p className="text-xs text-muted-foreground">
              Step {step + 1} of {steps.length} · {steps[step]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close wizard"
            className="ml-auto rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </header>

        <ol className="flex gap-1 overflow-x-auto border-b border-border px-5 py-3">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs transition-colors",
                  i === step
                    ? "bg-primary-soft font-semibold text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                    i < step ? "bg-success text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {i < step ? <Check className="size-3" /> : i + 1}
                </span>
                {s}
              </button>
            </li>
          ))}
        </ol>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tenant name (English)">
                <TextField placeholder="e.g. Dubai Culture" />
              </Field>
              <Field label="Tenant name (Arabic)">
                <TextField dir="rtl" placeholder="اسم الجهة" />
              </Field>
              <Field label="Tenant code">
                <TextField placeholder="DCAA" className="font-mono uppercase" />
              </Field>
              <Field label="Region">
                <SelectField options={["United Arab Emirates", "Saudi Arabia", "Qatar", "Egypt"]} />
              </Field>
              <Field label="Timezone">
                <SelectField options={["Asia/Dubai (GMT+4)", "Asia/Riyadh (GMT+3)", "Africa/Cairo (GMT+2)"]} />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid gap-2 md:grid-cols-2">
                {platformProducts.map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm text-foreground"
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--primary)]"
                      checked={products.includes(p)}
                      onChange={(e) =>
                        setProducts((prev) =>
                          e.target.checked ? [...prev, p] : prev.filter((x) => x !== p),
                        )
                      }
                    />
                    {p}
                  </label>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Max active users">
                  <TextField type="number" defaultValue={250} min={1} />
                </Field>
                <Field label="Licence expiry">
                  <TextField type="date" defaultValue="2027-03-12" />
                </Field>
                <Field label="Licence key">
                  <TextField defaultValue="PC20-9F3A-7BD1-42EE-C5A8" className="font-mono tracking-wider" />
                </Field>
                <Field label="Licensed modules">
                  <TextField defaultValue="Project Core, PMO Dashboard, Reports Center" />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-3 md:grid-cols-2">
              {["Blank instance", "DCAA template", "RDA template", "Import JSON blueprint"].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBlueprint(b)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-colors",
                    blueprint === b ? "border-primary bg-primary-soft" : "border-border hover:bg-muted",
                  )}
                >
                  <p className="text-sm font-semibold text-foreground">{b}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {b === "Blank instance"
                      ? "Start with platform defaults only."
                      : b === "Import JSON blueprint"
                        ? "Upload a previously exported tenant blueprint."
                        : "Copy lifecycle, features, roles and rules from this tenant."}
                  </p>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Field label="Hierarchy depth" hint="Between 2 and 6 levels.">
                <input
                  type="range"
                  min={2}
                  max={6}
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                  className="h-1.5 w-full accent-[var(--primary)]"
                />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: depth }).map((_, i) => (
                  <Field key={i} label={`L${i} label`}>
                    <TextField defaultValue={["Entity", "Sector", "Department", "Team", "Sub-team", "Unit"][i]} />
                  </Field>
                ))}
              </div>
              <button
                type="button"
                onClick={() => toast("CSV import — pick a hierarchy file")}
                className="rounded-xl border border-dashed border-primary px-4 py-2 text-sm font-semibold text-primary"
              >
                Import hierarchy CSV
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => toast("CSV import — pick a users file")}
                className="w-full rounded-2xl border border-dashed border-primary px-4 py-6 text-sm font-semibold text-primary"
              >
                Import users CSV
              </button>
              <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <span className="text-sm text-foreground">Enable single sign-on (SSO)</span>
                <Toggle checked={sso} onChange={setSso} label="Enable SSO" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Initial admin name">
                  <TextField placeholder="Full name" />
                </Field>
                <Field label="Initial admin email">
                  <TextField type="email" placeholder="admin@tenant.gov" />
                </Field>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Primary colour">
                  <TextField type="color" defaultValue="#6d3ff5" className="h-11 p-1" />
                </Field>
                <Field label="Secondary colour">
                  <TextField type="color" defaultValue="#0f9d8f" className="h-11 p-1" />
                </Field>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-sm font-semibold text-foreground">Review</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Products: {products.join(", ") || "none selected"}</li>
                  <li>Blueprint: {blueprint}</li>
                  <li>Organisation depth: {depth} levels</li>
                  <li>SSO: {sso ? "enabled" : "disabled"}</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <footer className="flex items-center gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex h-10 items-center gap-1 rounded-xl border border-border px-4 text-sm font-medium text-foreground disabled:opacity-40"
          >
            <ChevronLeft className="size-4" /> Back
          </button>
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="ml-auto flex h-10 items-center gap-1 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Next <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                toast.success("Tenant created and configuration published");
                onClose();
              }}
              className="ml-auto flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Publish tenant
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

function TenantsPage() {
  const [wizard, setWizard] = useState(false);
  const { setTenantId } = usePlatform();

  return (
    <AppShell
      title="Tenants & Licensing"
      subtitle="Every deployed client instance, their products, entitlements and licence status"
      actions={
        <button
          type="button"
          onClick={() => setWizard(true)}
          className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" /> New Tenant
        </button>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {["Tenant", "Products", "Users", "Licence expiry", "Status", "Last publish", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <Building2 className="size-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.code} · {t.region} · {t.currency}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{t.products.join(", ")}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {t.users.active} / {t.users.max}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-semibold",
                      t.licenseDaysLeft < 30
                        ? "bg-warning-soft text-warning"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {t.licenseExpiry} · {t.licenseDaysLeft}d
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-success-soft px-2 py-1 text-xs font-semibold text-success">
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{t.lastPublish}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to="/tenant"
                      onClick={() => setTenantId(t.id)}
                      className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      Open
                    </Link>
                    <button
                      type="button"
                      onClick={() => toast.success(`Configuration cloned from ${t.name}`)}
                      className="rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                    >
                      Clone config
                    </button>
                    <button
                      type="button"
                      onClick={() => toast(`${t.name} suspended`)}
                      className="rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                    >
                      Suspend
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.success("Blueprint exported as JSON")}
                      className="rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                    >
                      Export blueprint
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {wizard ? <Wizard onClose={() => setWizard(false)} /> : null}
    </AppShell>
  );
}
