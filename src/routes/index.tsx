import { createFileRoute } from "@tanstack/react-router";
import { Users, UserCheck, FileClock, Heart } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | Blackstone IT Platform" },
      {
        name: "description",
        content:
          "Monitor active products, license expiry, platform service health and recent configuration changes across the Blackstone IT platform.",
      },
      { property: "og:title", content: "Dashboard | Blackstone IT Platform" },
      {
        property: "og:description",
        content:
          "Monitor products, licenses, system health and configuration changes in one operations dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { label: "Active Products", value: "13", icon: Users },
  { label: "Active Users", value: "158", icon: UserCheck },
  { label: "License Expiry Alerts", value: "0", icon: FileClock },
];

const products = [
  { name: "Project Core", days: 3, total: 180, tone: "warning" as const },
  { name: "Innovation Core", days: 136, total: 180, tone: "success" as const },
  { name: "Task Core", days: 136, total: 180, tone: "success" as const },
  { name: "Committee core", days: 136, total: 180, tone: "success" as const },
];

const services = [
  ["Auth Server", true],
  ["Administration Service", true],
  ["Identity Service", true],
  ["SaaS Service", true],
  ["Audit Logging Service", true],
  ["GDPR Service", false],
  ["File Management Service", true],
  ["Language Service", true],
  ["Workflow Service", true],
  ["Central Shared Service", true],
  ["Notification Service", true],
] as const;

const changes = [
  {
    time: "18/08/2026 11:21 · 10 mins ago",
    title: "Auto Translate",
    body: "admin auto-translated 'innovation_wf:Title' into 2 language(s): fr, ar",
    dot: false,
  },
  {
    time: "18/08/2026 11:14 · 17 mins ago",
    title: "Update",
    body: "admin updated localization key Menu:AuditMonitoring",
    dot: true,
  },
  {
    time: "18/08/2026 11:14 · 17 mins ago",
    title: "Auto Translate",
    body: "admin auto-translated 'LookupDictionary:Menu:AuditMonitoring:Description' into 2 language(s): fr, ar",
    dot: false,
  },
  {
    time: "18/08/2026 11:13 · 17 mins ago",
    title: "Update",
    body: "Workflow Template Updated",
    dot: true,
  },
  {
    time: "18/08/2026 11:13 · 18 mins ago",
    title: "Auto Translate",
    body: "admin auto-translated 'sylvia_workflow_test:Title' into 2 language(s): fr, ar",
    dot: false,
  },
];

function Gauge({ value }: { value: number }) {
  const r = 70;
  const c = Math.PI * r;
  return (
    <div className="relative mx-auto w-[200px] pt-2">
      <svg viewBox="0 0 180 100" className="w-full">
        <path
          d="M 20 95 A 70 70 0 0 1 160 95"
          fill="none"
          stroke="var(--warning-soft)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M 20 95 A 70 70 0 0 1 160 95"
          fill="none"
          stroke="var(--warning)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${(c * value) / 100} ${c}`}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 text-center">
        <p className="text-2xl font-bold text-foreground">{value}%</p>
        <p className="text-sm font-medium text-warning">Degraded</p>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <AppShell title="Dashboard">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl bg-surface p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <p className="text-[15px] font-medium text-foreground">{label}</p>
                  <Icon className="size-[18px] text-muted-foreground" />
                </div>
                <p className="mt-6 text-3xl font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          <section className="rounded-2xl bg-card p-5 shadow-card">
            <h2 className="mb-4 text-[17px] font-semibold text-foreground">
              Products & License Status
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {products.map((p) => (
                <div key={p.name} className="rounded-2xl border border-border p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">{p.name}</h3>
                    <span className="rounded-md bg-success-soft px-2 py-1 text-xs font-semibold text-success">
                      Active
                    </span>
                  </div>
                  <div className="mt-6 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">License</span>
                    <span
                      className={
                        p.tone === "warning"
                          ? "font-semibold text-warning"
                          : "font-semibold text-success"
                      }
                    >
                      {p.days} days left
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${p.tone === "warning" ? "bg-warning" : "bg-success"}`}
                      style={{ width: `${Math.max((p.days / p.total) * 100, 8)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-card p-5 shadow-card">
            <h2 className="mb-4 text-[17px] font-semibold text-foreground">
              Platform Services Health
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {services.map(([name, healthy]) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3.5"
                >
                  <span className="text-[15px] text-foreground">{name}</span>
                  <span
                    className={`flex items-center gap-2 text-sm font-medium ${healthy ? "text-success" : "text-destructive"}`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${healthy ? "bg-success" : "bg-destructive"}`}
                    />
                    {healthy ? "Healthy" : "Unhealthy"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl bg-card p-5 shadow-card">
            <div className="flex items-start justify-between">
              <h2 className="text-[17px] font-semibold text-foreground">System Health</h2>
              <Heart className="size-[18px] text-muted-foreground" />
            </div>
            <Gauge value={91} />
          </section>

          <section className="rounded-2xl bg-card p-5 shadow-card">
            <h2 className="mb-5 text-[17px] font-semibold text-foreground">
              Recent Configuration Changes
            </h2>
            <ol className="relative space-y-6 border-l border-border pl-6">
              {changes.map((c, i) => (
                <li key={i} className="relative">
                  <span
                    className={`absolute -left-[27px] top-1.5 size-2.5 rounded-full ${c.dot ? "bg-primary" : "bg-border"}`}
                  />
                  <p className="text-xs text-muted-foreground">{c.time}</p>
                  <p className="mt-1 font-semibold text-foreground">{c.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
