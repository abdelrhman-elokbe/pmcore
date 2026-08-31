import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  Filter,
  ListFilter,
  MoreVertical,
  Search,
  Users,
  UserCog,
  Workflow,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/workflows")({
  head: () => ({
    meta: [
      { title: "Workflows | Blackstone IT Platform" },
      {
        name: "description",
        content:
          "Manage workflow templates, dynamic roles and delegations across platform products.",
      },
      { property: "og:title", content: "Workflows | Blackstone IT Platform" },
      {
        property: "og:description",
        content: "Workflow templates, dynamic roles and delegations in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workflows,
});

const tabs = [
  { label: "Templates", icon: Workflow },
  { label: "Dynamic Roles", icon: Users },
  { label: "Delegations", icon: UserCog },
] as const;
type TabLabel = (typeof tabs)[number]["label"];

type Template = {
  title: string;
  consumer: string;
  states: number;
  instances: number;
  sla: string;
  date: string;
  enabled: boolean;
};

const templates: Template[] = [
  { title: "test ob 4", consumer: "No Product", states: 0, instances: 0, sla: "0h", date: "30/08/2026", enabled: false },
  { title: "test ob 3", consumer: "No Product", states: 0, instances: 0, sla: "0h", date: "30/08/2026", enabled: false },
  { title: "Test 30/8", consumer: "ama2", states: 4, instances: 0, sla: "0h", date: "30/08/2026", enabled: true },
  { title: "ob test 2", consumer: "prod1", states: 0, instances: 0, sla: "0h", date: "27/08/2026", enabled: false },
  { title: "ob test 1", consumer: "prod1", states: 0, instances: 0, sla: "0h", date: "27/08/2026", enabled: false },
  { title: "approval workflow", consumer: "Projects-QA", states: 0, instances: 0, sla: "0h", date: "26/08/2026", enabled: false },
  { title: "escalation flow", consumer: "ama", states: 3, instances: 2, sla: "4h", date: "24/08/2026", enabled: true },
  { title: "onboarding v2", consumer: "Amazon", states: 6, instances: 12, sla: "12h", date: "21/08/2026", enabled: true },
  { title: "invoice review", consumer: "No Product", states: 2, instances: 0, sla: "0h", date: "19/08/2026", enabled: false },
  { title: "change request", consumer: "Projects-QA", states: 5, instances: 3, sla: "8h", date: "17/08/2026", enabled: false },
];

const dynamicRoles = [
  { code: "2", name: "2", nameAr: "2", product: "ama", date: "13/08/2026", by: "2" },
  { code: "2", name: "2", nameAr: "2", product: "ama2", date: "13/08/2026", by: "2" },
  { code: "1", name: "Elwakil", nameAr: "الوكيل", product: "Amazon", date: "05/08/2026", by: "Elwakil" },
  { code: "Test", name: "Test", nameAr: "اختبار", product: "No Product", date: "28/07/2026", by: "Test" },
  { code: "test 2", name: "test dy", nameAr: "اختبار DY", product: "ama2", date: "30/08/2026", by: "test dy" },
];

const delegations = [
  { delegator: "admin", delegate: "Elwakil", product: "ama2", from: "01/08/2026", to: "15/08/2026", status: "Active" },
  { delegator: "Elwakil", delegate: "shrouka", product: "Amazon", from: "10/08/2026", to: "20/08/2026", status: "Expired" },
  { delegator: "sada", delegate: "admin", product: "Projects-QA", from: "22/08/2026", to: "30/09/2026", status: "Active" },
];

function Chip({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
      {children}
    </span>
  );
}

function Th({ children }: { children: string }) {
  return (
    <th className="whitespace-nowrap px-4 py-3.5 text-left text-sm font-medium text-foreground">
      <span className="inline-flex items-center gap-2">
        {children}
        <ListFilter className="size-3.5 text-muted-foreground" />
        <Filter className="size-3.5 text-muted-foreground" />
      </span>
    </th>
  );
}

function Toggle({ on }: { on: boolean }) {
  const [checked, setChecked] = useState(on);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Enabled"
      onClick={() => setChecked((c) => !c)}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted-foreground/30",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-card transition-all",
          checked ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  );
}

function Filters({
  extra,
  action,
}: {
  extra: string[];
  action: string;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <label className="relative w-[220px]">
        <input
          placeholder="Search"
          className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
        />
      </label>
      {extra.map((f) => (
        <button
          key={f}
          className="flex h-11 min-w-[195px] items-center justify-between rounded-xl border border-border px-4 text-sm text-muted-foreground"
        >
          {f}
          <ChevronDown className="size-4" />
        </button>
      ))}
      <div className="ml-auto flex items-center gap-3">
        {action === "New template" && (
          <button className="h-11 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
            Export
          </button>
        )}
        <button className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
          {action}
        </button>
      </div>
    </div>
  );
}

function Pagination({ label }: { label: string }) {
  return (
    <div className="mt-5 flex items-center justify-end gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      {[ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight].map((Icon, i) => (
        <button key={i} className="text-muted-foreground hover:text-foreground" aria-label={`page-${i}`}>
          <Icon className="size-4" />
        </button>
      ))}
      <button
        aria-label="Column settings"
        className="flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted"
      >
        <Columns3 className="size-5" />
      </button>
    </div>
  );
}

function Workflows() {
  const [active, setActive] = useState<TabLabel>("Templates");
  const [showInsights, setShowInsights] = useState(true);

  const stats = useMemo(
    () => [
      ["Total Templates", String(templates.length * 8)],
      ["Enabled", String(templates.filter((t) => t.enabled).length)],
      ["Disabled", String(templates.filter((t) => !t.enabled).length + 74)],
      ["Active Instances", "34"],
    ],
    [],
  );

  return (
    <AppShell title="Workflows">
      <div className="rounded-2xl bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-border p-2">
          {tabs.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActive(label)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-[15px] transition-colors",
                active === label
                  ? "bg-accent font-semibold text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-[18px]" />
              {label}
            </button>
          ))}
        </div>

        {active === "Templates" && (
          <>
            <Filters extra={["States All", "Product All"]} action="New template" />

            {showInsights && (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-surface p-5">
                    <p className="text-[15px] text-muted-foreground">{label}</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowInsights((s) => !s)}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              {showInsights ? "Hide insights" : "Show insights"}
            </button>

            <Pagination label="1–10 of 80" />

            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Title", "Consumer", "States", "Instances", "SLA", "Activation Date", "Enabled"].map(
                      (h) => (
                        <Th key={h}>{h}</Th>
                      ),
                    )}
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {templates.map((t) => (
                    <tr key={t.title} className="border-b border-border last:border-0">
                      <td className="px-4 py-4 text-sm text-foreground">{t.title}</td>
                      <td className="px-4 py-4">
                        <Chip>{t.consumer}</Chip>
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">{t.states}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{t.instances}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{t.sla}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{t.date}</td>
                      <td className="px-4 py-4">
                        <Toggle on={t.enabled} />
                      </td>
                      <td className="px-2 py-4">
                        <button aria-label="Row actions" className="text-muted-foreground hover:text-foreground">
                          <MoreVertical className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {active === "Dynamic Roles" && (
          <>
            <Filters extra={["Product All"]} action="New Dynamic Role" />
            <Pagination label="1–5 of 5" />
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Code", "Name", "Arabic Name", "Product", "Creation Date", "Created By"].map((h) => (
                      <Th key={h}>{h}</Th>
                    ))}
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {dynamicRoles.map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-4 py-4 text-sm text-foreground">{r.code}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{r.name}</td>
                      <td className="px-4 py-4 text-sm text-foreground" dir="rtl">
                        {r.nameAr}
                      </td>
                      <td className="px-4 py-4">
                        <Chip>{r.product}</Chip>
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">{r.date}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{r.by}</td>
                      <td className="px-2 py-4">
                        <button aria-label="Row actions" className="text-muted-foreground hover:text-foreground">
                          <MoreVertical className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {active === "Delegations" && (
          <>
            <Filters extra={["Status All", "Product All"]} action="New Delegation" />
            <Pagination label="1–3 of 3" />
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Delegator", "Delegate", "Product", "From", "To", "Status"].map((h) => (
                      <Th key={h}>{h}</Th>
                    ))}
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {delegations.map((d, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-4 py-4 text-sm text-foreground">{d.delegator}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{d.delegate}</td>
                      <td className="px-4 py-4">
                        <Chip>{d.product}</Chip>
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">{d.from}</td>
                      <td className="px-4 py-4 text-sm text-foreground">{d.to}</td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            d.status === "Active"
                              ? "bg-success-soft text-success"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="px-2 py-4">
                        <button aria-label="Row actions" className="text-muted-foreground hover:text-foreground">
                          <MoreVertical className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
