import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, Building2, UserCheck, FileClock, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";
import { licenceCards, recentChanges, tenants } from "@/lib/platform/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Platform Dashboard | Blackstone Product 2.0" },
      {
        name: "description",
        content:
          "Host admin view of active products, tenants, users, licence expiry alerts, system health and recent configuration changes.",
      },
      { property: "og:title", content: "Platform Dashboard | Blackstone Product 2.0" },
      {
        property: "og:description",
        content: "Products, tenants, licences, system health and configuration change feed.",
      },
    ],
  }),
  component: Dashboard,
});

const totalUsers = tenants.reduce((n, t) => n + t.users.active, 0);
const expiryAlerts = licenceCards.filter((l) => l.daysLeft > 0 && l.daysLeft < 30).length;

const stats = [
  { label: "Active Products", value: "4", icon: Boxes, tone: "text-primary bg-primary-soft" },
  { label: "Active Tenants", value: String(tenants.length), icon: Building2, tone: "text-teal bg-teal-soft" },
  { label: "Active Users", value: String(totalUsers), icon: UserCheck, tone: "text-secondary bg-secondary-soft" },
  {
    label: "Licence Expiry Alerts",
    value: String(expiryAlerts),
    icon: FileClock,
    tone: "text-warning bg-warning-soft",
  },
];

function Gauge({ value }: { value: number }) {
  const r = 62;
  const c = Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 160 90" className="w-[220px]">
        <path
          d={`M 18 80 A ${r} ${r} 0 0 1 142 80`}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={`M 18 80 A ${r} ${r} 0 0 1 142 80`}
          fill="none"
          stroke="var(--success)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * c} ${c}`}
        />
      </svg>
      <p className="-mt-6 text-3xl font-bold text-foreground">{value}%</p>
      <p className="mt-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
        Healthy
      </p>
    </div>
  );
}

function toneFor(days: number) {
  if (days < 7) return { bar: "bg-destructive", pill: "bg-destructive/10 text-destructive" };
  if (days < 30) return { bar: "bg-warning", pill: "bg-warning-soft text-warning" };
  return { bar: "bg-success", pill: "bg-success-soft text-success" };
}

function Dashboard() {
  return (
    <AppShell
      title="Platform Dashboard"
      subtitle="Products, tenants, licences and configuration activity across the platform"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <span className={cn("flex size-9 items-center justify-center rounded-xl", tone)}>
                  <Icon className="size-[18px]" />
                </span>
                <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-[15px] font-semibold text-foreground">Product licences</h2>
              <Link
                to="/tenants"
                className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-primary"
              >
                Tenants & licensing <ArrowUpRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {licenceCards.map((l) => {
                const tone = toneFor(l.daysLeft);
                return (
                  <div key={`${l.product}-${l.tenant}`} className="rounded-2xl border border-border p-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{l.product}</p>
                      <span
                        className={cn(
                          "ml-auto rounded-md px-2 py-0.5 text-[11px] font-semibold",
                          l.status === "Active"
                            ? "bg-success-soft text-success"
                            : l.status === "Trial"
                              ? "bg-primary-soft text-primary"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {l.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{l.tenant}</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", tone.bar)}
                        style={{ width: `${Math.max(3, (l.daysLeft / l.total) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {l.daysLeft > 0 ? `${l.daysLeft} days left` : "Expired"}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="mb-3 text-[15px] font-semibold text-foreground">System health</h2>
            <Gauge value={96} />
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="mb-3 text-[15px] font-semibold text-foreground">
              Recent configuration changes
            </h2>
            <ul className="space-y-3">
              {recentChanges.map((c) => (
                <li key={c.action} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <p className="text-sm text-foreground">{c.action}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.actor} · {c.tenant} · {c.section}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">{c.time}</span>
                    <Link to="/change-log" className="text-[11px] font-semibold text-primary">
                      View diff
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
