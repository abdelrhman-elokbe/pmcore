import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Check, Minus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { usePlatform } from "@/lib/platform/context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tenant")({
  head: () => ({
    meta: [
      { title: "Tenant Overview | Blackstone Product 2.0" },
      {
        name: "description",
        content:
          "Configuration overview for the selected client instance: lifecycle, terminology, regional settings and enabled capabilities.",
      },
      { property: "og:title", content: "Tenant Overview | Blackstone Product 2.0" },
      {
        property: "og:description",
        content: "Everything configured for this client instance in one summary view.",
      },
    ],
  }),
  component: TenantOverview;
});

function Flag({ on, label }: { on: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border px-4 py-3">
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-full",
          on ? "bg-success-soft text-success" : "bg-muted text-muted-foreground",
        )}
      >
        {on ? <Check className="size-3.5" /> : <Minus className="size-3.5" />}
      </span>
      <span className={cn("text-sm", on ? "text-foreground" : "text-muted-foreground")}>{label}</span>
      <span className="ml-auto text-xs font-semibold text-muted-foreground">
        {on ? "Enabled" : "Disabled"}
      </span>
    </div>
  );
}

function TenantOverview() {
  const { tenant } = usePlatform();

  const facts = [
    ["Tenant code", tenant.code],
    ["Region", tenant.region],
    ["Timezone", tenant.timezone],
    ["Products", tenant.products.join(", ")],
    ["Users", `${tenant.users.active} active of ${tenant.users.max}`],
    ["Currency", tenant.currency],
    ["Default language", `${tenant.language}${tenant.rtl ? " · RTL layout" : ""}`],
    ["Organisation", `${tenant.orgGroups} groups · ${tenant.orgLevels.join(" › ")}`],
    ["Intake stage label", tenant.intakeLabel],
    ["Licence", `${tenant.licenseExpiry} · ${tenant.licenseDaysLeft} days left`],
    ["Last publish", tenant.lastPublish],
  ] as const;

  return (
    <AppShell title="Overview" subtitle={`Configuration summary for ${tenant.name}`}>
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Building2 className="size-5" />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-foreground">{tenant.name}</h2>
              <p className="text-xs text-muted-foreground" dir="rtl">
                {tenant.nameAr}
              </p>
            </div>
          </div>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {facts.map(([k, v]) => (
              <div key={k} className="border-b border-border pb-2">
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="text-sm text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="mb-3 text-[15px] font-semibold text-foreground">Lifecycle</h2>
            <ol className="space-y-2">
              {tenant.lifecycle.map((s, i) => (
                <li key={s} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">{s}</span>
                </li>
              ))}
            </ol>
            <Link
              to="/project-core"
              search={{ screen: "stages" }}
              className="mt-3 inline-block text-sm font-semibold text-primary"
            >
              Configure lifecycle
            </Link>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="mb-3 text-[15px] font-semibold text-foreground">Key switches</h2>
            <div className="space-y-2">
              <Flag on={tenant.atRiskEnabled} label="“At Risk” project status" />
              <Flag on={tenant.benefitsEnabled} label="Benefits realization" />
              <Flag on={tenant.lessonsLearnedEnabled} label="Lessons learned hub" />
              <Flag on={tenant.rtl} label="RTL layout" />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
