import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Briefcase,
  Building,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Gauge,
  Layers,
  LayoutGrid,
  ListChecks,
  Lock,
  LogOut,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Users,
  Wrench,
  X,
  Check,
  Clock,
  AlertTriangle,
  Info,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePlatform } from "@/lib/platform/context";
import { mockWorkflows, scheduleComponents } from "@/components/project-core/data";
import { useTools, type Tool } from "@/components/project-core/toolkitData";
import {
  can,
  featureOn,
  fmtDate,
  fmtMoney,
  healthState,
  mandatoryTools,
  menuItems,
  notifStore,
  projectsStore,
  resolveStage,
  stageWorkflow,
  usePreviewConfig,
  type AdminLink,
  type AttachedTool,
  type MenuId,
  type PProject,
  type PreviewConfig,
  type PreviewRole,
  type TraceLine,
} from "./engine";
import { actOnStage, actOnTool, createProject, submitStage, submitTool, updateTool } from "./actions";
import { ToolBody } from "./ToolViews";

type View = { kind: "menu"; id: MenuId } | { kind: "new" } | { kind: "project"; id: string };

const card = "rounded-xl border border-cp-border bg-cp-card";
const outlineBtn =
  "flex h-9 items-center gap-2 rounded-lg border border-cp-border bg-cp-card px-3 text-sm font-medium text-cp-text2 hover:bg-cp-bg";
const primaryBtn =
  "flex h-9 items-center gap-2 rounded-lg bg-cp-purple px-4 text-sm font-semibold text-primary-foreground hover:bg-cp-purple-deep disabled:opacity-50";

export function ClientPreview({ from }: { from: string }) {
  const { tenantId } = usePlatform();
  const tools = useTools();
  const cfg = usePreviewConfig(tenantId, tools);
  const [projects] = projectsStore.use(tenantId);
  const [notifs, setNotifs] = notifStore.use(tenantId);
  const [roleId, setRoleId] = useState("pm");
  const role: PreviewRole = cfg.roles.find((r) => r.id === roleId) ?? cfg.roles[0]!;
  const [view, setView] = useState<View>({ kind: "menu", id: "projects" });
  const [ar, setAr] = useState(false);
  const [traceOpen, setTraceOpen] = useState(true);
  const [bellOpen, setBellOpen] = useState(false);
  const [toolOpen, setToolOpen] = useState<string | null>(null);

  const menu = menuItems(cfg, role);
  const visibleMenu = menu.filter((m) => m.visible);
  const activeMenu: MenuId | null = view.kind === "menu" ? view.id : view.kind === "new" ? "proposals" : "projects";
  // fall back if the current menu item became hidden
  if (view.kind === "menu" && !visibleMenu.some((m) => m.id === view.id) && visibleMenu[0]) {
    queueMicrotask(() => setView({ kind: "menu", id: visibleMenu[0]!.id }));
  }

  const myInbox = notifs.filter((n) => n.inApp && n.recipients.includes(role.name));
  const unread = myInbox.filter((n) => !n.readBy.includes(role.name)).length;

  const pendingForMe = projects.filter((p) => {
    const wf = mockWorkflows.find((w) => w.id === p.approval?.workflowId);
    return wf && p.approval && wf.steps[p.approval.stepIdx]?.assigneeRole === role.name;
  });

  const project = view.kind === "project" ? projects.find((p) => p.id === view.id) ?? null : null;
  const exitSearch = from === "platform" ? null : from;

  const trace = buildTrace(cfg, role, menu, project);
  const firstStage = cfg.stages[0];
  const intakeCount = projects.filter((p) => p.stageId === firstStage?.id && p.status !== "Completed").length;
  const counts: Partial<Record<MenuId, number>> = {
    proposals: intakeCount,
    projects: projects.length,
    "closure-requests": projects.filter((p) => p.stageId === "closure").length,
  };
  const userName = role.workflowOnly ? role.name : role.id === "pm" ? "Saeed Al Mansoori" : `${role.name.split(" ")[0]} User`;
  const initials = userName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const crumb =
    view.kind === "project" ? project?.name ?? "Project" : view.kind === "new" ? `New ${cfg.intake}` : menu.find((m) => m.id === activeMenu)?.label;

  return (
    <div className="min-h-screen bg-cp-bg font-cp text-cp-text" dir={ar ? "rtl" : "ltr"}>
      {/* Preview banner */}
      <div dir="ltr" className="sticky top-0 z-50 flex flex-wrap items-center gap-3 bg-cp-purple-deep px-4 py-1.5 text-xs text-primary-foreground">
        <Eye className="size-3.5" />
        <span className="font-semibold">Preview mode</span>
        <span>· {cfg.tenant.name} · Draft configuration — nothing is saved</span>
        <label className="ml-auto flex items-center gap-2">
          Previewing as:
          <select
            aria-label="Previewing as role"
            value={role.id}
            onChange={(e) => setRoleId(e.target.value)}
            className="h-7 rounded-md bg-cp-card px-2 text-xs text-cp-text"
          >
            {cfg.roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
                {r.workflowOnly ? " (workflow role)" : ""}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => setTraceOpen((v) => !v)} className="flex h-7 items-center gap-1 rounded-md border border-primary-foreground/30 px-2 hover:bg-primary-foreground/10">
          <ListChecks className="size-3.5" /> Config trace
        </button>
        <button
          type="button"
          onClick={() => {
            projectsStore.reset(tenantId);
            notifStore.reset(tenantId);
            setView({ kind: "menu", id: "projects" });
            toast("Demo data reset");
          }}
          className="flex h-7 items-center gap-1 rounded-md border border-primary-foreground/30 px-2 hover:bg-primary-foreground/10"
        >
          <RotateCcw className="size-3.5" /> Reset demo data
        </button>
        {exitSearch ? (
          <Link to="/project-core" search={{ screen: exitSearch as "stages" }} className="flex h-7 items-center gap-1 rounded-md bg-cp-card px-2 font-semibold text-cp-purple-deep">
            <LogOut className="size-3.5" /> Exit preview
          </Link>
        ) : (
          <Link to="/" className="flex h-7 items-center gap-1 rounded-md bg-cp-card px-2 font-semibold text-cp-purple-deep">
            <LogOut className="size-3.5" /> Exit preview
          </Link>
        )}
      </div>

      {/* Client header */}
      <header className="flex items-center gap-4 border-b border-cp-border bg-cp-card px-5 py-3">
        {tenantId === "dcaa" ? (
          <div className="leading-none">
            <p className="text-[11px] font-bold tracking-[0.3em] text-cp-text">DUBAI</p>
            <p className="text-xl font-light italic text-cp-purple">Culture</p>
          </div>
        ) : (
          <div className="leading-tight">
            <p className="text-sm font-bold text-cp-text">{cfg.tenant.name}</p>
            <p className="text-[11px] text-cp-muted">{cfg.branding.nameEn}</p>
          </div>
        )}
        <span className="h-8 w-px bg-cp-border" />
        <p className="text-sm text-cp-text2">
          {ar ? "المشاريع" : "Projects"} <span className="text-cp-muted">·</span>{" "}
          <span className="font-semibold text-cp-text">{crumb}</span>
        </p>
        <div className="ms-auto flex items-center gap-3">
          <div className="relative">
            <button type="button" aria-label="Notifications" onClick={() => setBellOpen((v) => !v)} className="relative flex size-9 items-center justify-center rounded-lg border border-cp-border hover:bg-cp-bg">
              <Bell className="size-4 text-cp-text2" />
              {unread ? (
                <span className="absolute -end-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-cp-orange px-1 text-[10px] font-bold text-primary-foreground">{unread}</span>
              ) : null}
            </button>
            {bellOpen ? (
              <div className={cn(card, "absolute end-0 top-11 z-40 w-96 p-3 shadow-lg")}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">Notifications for {role.name}</p>
                  <button
                    type="button"
                    className="text-xs text-cp-purple"
                    onClick={() => setNotifs((p) => p.map((n) => (n.recipients.includes(role.name) ? { ...n, readBy: [...n.readBy, role.name] } : n)))}
                  >
                    Mark all read
                  </button>
                </div>
                {myInbox.length === 0 ? <p className="py-4 text-center text-xs text-cp-muted">No notifications for this role yet.</p> : null}
                <ul className="max-h-80 space-y-2 overflow-y-auto">
                  {myInbox.map((n) => (
                    <li key={n.id} className={cn("rounded-lg border border-cp-border p-2.5", !n.readBy.includes(role.name) && "bg-cp-purple-soft")}>
                      <p className="text-sm text-cp-text">{n.text}</p>
                      <p className="mt-1 text-[11px] text-cp-muted">Rule: {n.rule}</p>
                      <p className="text-[11px] text-cp-muted">To: {n.recipients.join(", ")} · {n.channels.join(" + ")}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="text-end">
            <p className="text-sm font-semibold text-cp-text">{userName}</p>
            <p className="text-[11px] text-cp-muted">{role.name}</p>
          </div>
          <span className="flex size-9 items-center justify-center rounded-lg bg-cp-purple text-sm font-bold text-primary-foreground">{initials}</span>
          <button type="button" onClick={() => setAr((v) => !v)} className="rounded-lg border border-cp-border px-3 py-1.5 text-sm font-semibold text-cp-purple">
            {ar ? "English" : "عربي"}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Icon rail */}
        <nav className="flex w-[76px] shrink-0 flex-col items-center gap-1 border-e border-cp-border bg-cp-card py-3">
          {[
            { l: "Dashboards", i: LayoutGrid },
            { l: "Performance", i: Gauge },
            { l: "Services", i: Layers },
            { l: "Projects", i: Briefcase, active: true, badge: pendingForMe.length },
            ...(can(role, "Configurations", "View") ? [{ l: "Admin", i: Settings }] : []),
            { l: "Committees", i: Users },
            { l: "BAU", i: Building },
          ].map((r) => (
            <button
              key={r.l}
              type="button"
              onClick={() => !r.active && toast(`${r.l} is outside Project Core — not part of this preview`)}
              className="relative flex w-16 flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium text-cp-text2"
            >
              <span className={cn("flex size-9 items-center justify-center rounded-lg", r.active ? "bg-cp-purple text-primary-foreground" : "text-cp-muted")}>
                <r.i className="size-[18px]" />
              </span>
              {r.l}
              {"badge" in r && r.badge ? (
                <span className="absolute end-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cp-orange px-1 text-[9px] font-bold text-primary-foreground">{r.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* Secondary menu */}
        <aside className="w-[240px] shrink-0 border-e border-cp-border bg-cp-card p-3">
          <label className="relative mb-3 block">
            <Search className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-cp-muted" />
            <input placeholder="Search" className="h-9 w-full rounded-lg border border-cp-border bg-cp-bg ps-8 text-sm outline-none" />
          </label>
          <ul className="space-y-0.5">
            {visibleMenu.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setView({ kind: "menu", id: m.id })}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm",
                    activeMenu === m.id ? "bg-cp-purple-soft font-semibold text-cp-purple" : "text-cp-text2 hover:bg-cp-bg",
                  )}
                >
                  <span className="flex-1">{m.label}</span>
                  {counts[m.id] ? (
                    <span className="rounded-full bg-cp-orange-soft px-2 py-0.5 text-[11px] font-bold text-cp-orange">{counts[m.id]}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="min-w-0 flex-1 p-6">
          {view.kind === "new" ? (
            <NewRequest cfg={cfg} tenantId={tenantId} onDone={(id) => setView(id ? { kind: "project", id } : { kind: "menu", id: "proposals" })} />
          ) : project ? (
            <ProjectView cfg={cfg} tenantId={tenantId} p={project} role={role} ar={ar} openTool={setToolOpen} back={() => setView({ kind: "menu", id: "projects" })} />
          ) : view.kind === "menu" ? (
            <MenuScreen
              id={view.id}
              cfg={cfg}
              role={role}
              projects={projects}
              pendingForMe={pendingForMe.length}
              open={(id) => setView({ kind: "project", id })}
              onNew={() => setView({ kind: "new" })}
              ar={ar}
            />
          ) : null}
        </main>

        {traceOpen ? (
          <aside dir="ltr" className="w-[320px] shrink-0 border-s border-cp-border bg-cp-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Config trace</p>
              <button type="button" aria-label="Close trace" onClick={() => setTraceOpen(false)}>
                <X className="size-4 text-cp-muted" />
              </button>
            </div>
            <p className="mb-3 text-[11px] text-cp-muted">Admin-only. Why the preview looks the way it does.</p>
            <ul className="space-y-2">
              {trace.map((t, i) => (
                <li key={i} className="flex gap-2 text-xs">
                  {t.kind === "hidden" ? (
                    <EyeOff className="mt-0.5 size-3.5 shrink-0 text-cp-muted" />
                  ) : t.kind === "warn" ? (
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-cp-orange" />
                  ) : t.kind === "ok" ? (
                    <Check className="mt-0.5 size-3.5 shrink-0 text-cp-teal" />
                  ) : (
                    <Info className="mt-0.5 size-3.5 shrink-0 text-cp-blue" />
                  )}
                  <span className="flex-1 text-cp-text2">
                    {t.text}
                    {t.link ? <AdminLinkEl link={t.link} /> : null}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>

      {project && toolOpen ? (
        <ToolDrawer cfg={cfg} tenantId={tenantId} p={project} toolId={toolOpen} role={role} close={() => setToolOpen(null)} />
      ) : null}
    </div>
  );
}

function AdminLinkEl({ link }: { link: AdminLink }) {
  return (
    <Link
      to="/project-core"
      search={link.tool ? { screen: "toolkit", tool: link.tool } : { screen: link.screen as "stages" }}
      className="ms-1 inline-flex items-center font-semibold text-cp-purple"
    >
      Open <ChevronRight className="size-3" />
    </Link>
  );
}

/* ---------------- Trace ---------------- */

function buildTrace(
  cfg: PreviewConfig,
  role: PreviewRole,
  menu: ReturnType<typeof menuItems>,
  p: PProject | null,
): TraceLine[] {
  const out: TraceLine[] = [];
  out.push({ kind: "info", text: `Lifecycle: ${cfg.stages.map((s) => s.label).join(" → ") || "none"}`, link: { screen: "stages" } });
  cfg.disabledStages.forEach((s) => out.push({ kind: "hidden", text: `${s.name} hidden — stage disabled`, link: { screen: "stages" } }));
  if (cfg.intake !== "Proposal") out.push({ kind: "info", text: `Terminology: "Proposal" shown as "${cfg.intake}"` });
  menu.filter((m) => !m.visible).forEach((m) => out.push({ kind: "hidden", text: `${m.label} hidden — ${m.reason}`, link: m.link }));
  const f = cfg.features;
  if (!featureOn(f, "project", "Health score system")) out.push({ kind: "hidden", text: "Health score hidden — feature disabled", link: { screen: "features" } });
  if (!featureOn(f, "project", "Risk management")) out.push({ kind: "hidden", text: "Risk register hidden — feature disabled", link: { screen: "features" } });
  if (!featureOn(f, "project", "Gantt chart")) out.push({ kind: "hidden", text: "Gantt chart hidden — feature disabled", link: { screen: "features" } });
  out.push({
    kind: "info",
    text: `${role.name}: ${(["View", "Create", "Edit", "Approve", "Delete", "Export"] as const).filter((a) => can(role, "Projects", a)).join(", ") || "no"} on Projects${role.workflowOnly ? " (workflow-only role)" : ""}`,
    link: { screen: "roles" },
  });
  cfg.stages.forEach((s) => {
    const { wf, note } = stageWorkflow(s.id, false);
    if (!wf) out.push({ kind: "warn", text: `${s.label}: ${note}`, link: { screen: "stages" } });
    else
      wf.steps.forEach((st, i) =>
        out.push({ kind: "info", text: `${s.label} · step ${i + 1} = ${st.assigneeRole} (workflow ${wf.title} ${wf.version})`, link: { screen: "stages" } }),
      );
  });
  if (p) {
    p.tools.forEach((t) => {
      const tool = cfg.tools.find((x) => x.id === t.toolId);
      out.push({ kind: "ok", text: `${tool?.name}: ${t.reason}`, link: { screen: "toolkit", tool: t.toolId } });
    });
    mandatoryTools(cfg, p.category, p.type).skipped.forEach((s) =>
      out.push({ kind: "hidden", text: `${s.tool.name} not attached — ${s.reason}`, link: { screen: "toolkit", tool: s.tool.id } }),
    );
    if (!cfg.stages.some((s) => s.id === p.stageId))
      out.push({ kind: "warn", text: `Project sits in a stage that is now disabled (${p.stageId})`, link: { screen: "stages" } });
  } else {
    cfg.tools
      .filter((t) => t.mode === "Mandatory" && t.status === "Active")
      .forEach((t) => {
        const st = resolveStage(cfg, t.defaultStage);
        out.push({
          kind: st ? "ok" : "warn",
          text: st ? `${t.name}: Mandatory → auto-attached at ${st.label}` : `${t.name}: Mandatory but default stage disabled — not attached`,
          link: { screen: "toolkit", tool: t.id },
        });
      });
  }
  out.push({ kind: "info", text: `Branding: ${cfg.branding.nameEn} · ${cfg.tenant.currency} · ${cfg.branding.dateFormat}`, link: { screen: "configurations" } });
  return out;
}

/* ---------------- Menu screens ---------------- */

function Pill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", tone)}>{children}</span>;
}

const statusTone: Record<string, string> = {
  "In progress": "bg-cp-blue-soft text-cp-blue",
  "Pending approval": "bg-cp-orange-soft text-cp-orange",
  Returned: "bg-cp-amber-soft text-cp-amber",
  Rejected: "bg-cp-red-soft text-cp-red",
  Completed: "bg-muted text-cp-muted",
};

function Kpi({ icon: Icon, label, value, tone }: { icon: typeof Briefcase; label: string; value: number | string; tone: string }) {
  return (
    <div className={cn(card, "flex items-center gap-3 p-4")}>
      <span className={cn("flex size-10 items-center justify-center rounded-lg", tone)}>
        <Icon className="size-5" />
      </span>
      <span className="text-sm text-cp-text2">{label}</span>
      <span className="ms-auto text-2xl font-bold text-cp-purple">{value}</span>
    </div>
  );
}

function MenuScreen({
  id,
  cfg,
  role,
  projects,
  pendingForMe,
  open,
  onNew,
  ar,
}: {
  id: MenuId;
  cfg: PreviewConfig;
  role: PreviewRole;
  projects: PProject[];
  pendingForMe: number;
  open: (id: string) => void;
  onNew: () => void;
  ar: boolean;
}) {
  const [tab, setTab] = useState("All");
  const first = cfg.stages[0];
  const label = menuItems(cfg, role).find((m) => m.id === id)?.label ?? "";
  const canExport = can(role, "Projects", "Export");
  const canCreate = can(role, "Projects", "Create");

  if (id === "projects" || id === "proposals" || id === "closure-requests" || id === "dashboard") {
    let list = projects;
    if (id === "proposals") list = projects.filter((p) => p.stageId === first?.id);
    if (id === "closure-requests") list = projects.filter((p) => p.stageId === "closure");
    const hs = list.map((p) => healthState(cfg, p).label);
    const tabs = ["All", "On Track", "At Risk", "Off Track", "Not Started", "Closed"];
    const filtered = tab === "All" ? list : list.filter((p) => healthState(cfg, p).label === tab);
    const showHealth = featureOn(cfg.features, "project", "Health score system");
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold">{label}</h1>
          <div className="ms-auto flex gap-2">
            {(id === "proposals" || id === "projects") && canCreate && first ? (
              <button type="button" onClick={onNew} className={outlineBtn}>
                <Plus className="size-4" /> New {cfg.intake}
              </button>
            ) : null}
            {canExport ? (
              <button type="button" onClick={() => toast("Export generated (preview)")} className={primaryBtn}>
                <Download className="size-4" /> Export
              </button>
            ) : null}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <Kpi icon={Briefcase} label="Total" value={list.length} tone="bg-cp-purple-soft text-cp-purple" />
          <Kpi icon={Check} label="On Track" value={hs.filter((h) => h === "On Track").length} tone="bg-cp-teal-soft text-cp-teal" />
          <Kpi icon={AlertTriangle} label="Off Track" value={hs.filter((h) => h === "Off Track").length} tone="bg-cp-orange-soft text-cp-orange" />
          <Kpi icon={Clock} label="Awaiting my approval" value={pendingForMe} tone="bg-cp-blue-soft text-cp-blue" />
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn("rounded-full border px-4 py-1.5 text-sm", tab === t ? "border-cp-purple bg-cp-card font-semibold text-cp-purple" : "border-cp-border bg-cp-card text-cp-text2")}
            >
              {t}
            </button>
          ))}
        </div>
        <div className={cn(card, "overflow-x-auto")}>
          <table className="w-full text-sm">
            <thead className="bg-cp-bg text-start text-xs text-cp-muted">
              <tr>
                {["Code", "Project", "Category", "Stage", "Status", ...(showHealth ? ["Health"] : []), "Budget", "Created"].map((h) => (
                  <th key={h} className="px-4 py-3 text-start font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const st = cfg.stages.find((s) => s.id === p.stageId);
                const h = healthState(cfg, p);
                return (
                  <tr key={p.id} onClick={() => open(p.id)} className="cursor-pointer border-t border-cp-border hover:bg-cp-bg">
                    <td className="px-4 py-3 text-cp-muted">{p.code}</td>
                    <td className="px-4 py-3 font-medium text-cp-text">{p.name}</td>
                    <td className="px-4 py-3 text-cp-text2">{p.category}</td>
                    <td className="px-4 py-3 text-cp-text2">{st ? (ar ? st.nameAr : st.label) : "—"}</td>
                    <td className="px-4 py-3"><Pill tone={statusTone[p.status]!}>{p.status}</Pill></td>
                    {showHealth ? <td className="px-4 py-3"><Pill tone={h.tone}>{h.label}</Pill></td> : null}
                    <td className="px-4 py-3 text-cp-text2">{fmtMoney(p.budget, cfg.tenant.currency, cfg.branding.numberFormat)}</td>
                    <td className="px-4 py-3 text-cp-text2">{fmtDate(p.createdAt, cfg.branding.dateFormat)}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-cp-muted">No projects.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const sectionFor: Partial<Record<MenuId, string>> = { "pmo-dashboards": "dashboard", "pmo-reports": "reports", "change-requests": "cr" };
  const sec = cfg.features.sections.find((s) => s.id === sectionFor[id]);
  const items =
    id === "lessons"
      ? cfg.lookups["lessons-learned"].filter((l) => l.active).map((l) => l.name)
      : id === "configurations"
        ? ["Lookups", "Organisation structure", "Notification preferences"]
        : (sec?.items.filter((i) => i.enabled).map((i) => i.name) ?? []);
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">{label}</h1>
        {canExport ? (
          <button type="button" onClick={() => toast("Export generated (preview)")} className={cn(primaryBtn, "ms-auto")}>
            <Download className="size-4" /> Export
          </button>
        ) : null}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((name) => (
          <div key={name} className={cn(card, "flex items-center gap-3 p-4")}>
            <span className="flex size-9 items-center justify-center rounded-lg bg-cp-purple-soft text-cp-purple">
              {id === "pmo-reports" ? <FileText className="size-4" /> : <BarChart3 className="size-4" />}
            </span>
            <span className="text-sm font-medium">{name}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-cp-muted">Only features enabled in the admin Features screen are listed.</p>
    </div>
  );
}

/* ---------------- New request ---------------- */

function NewRequest({ cfg, tenantId, onDone }: { cfg: PreviewConfig; tenantId: string; onDone: (id?: string) => void }) {
  const act = (l: { name: string; active: boolean }[]) => l.filter((x) => x.active).map((x) => x.name);
  const cats = act(cfg.lookups.categories);
  const types = act(cfg.lookups.types);
  const srcs = act(cfg.lookups.sources);
  const bens = act(cfg.lookups["benefit-types"]);
  const ents = cfg.lookups["external-entities"].filter((e) => e.active).map((e) => e.name);
  const [v, setV] = useState<Record<string, string>>({
    Category: cats[0] ?? "",
    Type: types[0] ?? "",
    Source: srcs[0] ?? "",
    Benefits: bens[0] ?? "",
    Entity: "",
  });
  const [confidential, setConfidential] = useState(false);
  const req = cfg.proposal.required;
  const set = (k: string, x: string) => setV((p) => ({ ...p, [k]: x }));
  const preview = useMemo(() => mandatoryTools(cfg, v["Category"] ?? "", v["Type"] ?? ""), [cfg, v]);
  const first = cfg.stages[0]!;

  const text = ["Project name", "Description", "Rationale", "Objective", "In scope", "Out of scope", "Strategic KPIs", "Risks"];
  const selects: [string, string[]][] = [
    ["Category", cats],
    ["Type", types],
    ["Source", srcs],
    ["Benefits", bens],
  ];
  const input = "h-10 w-full rounded-lg border border-cp-border bg-cp-card px-3 text-sm outline-none focus:border-cp-purple";

  const submit = () => {
    const missing = [...text, "Category", "Type", "Source", "Budget", "Benefits"].filter((f) => req[f] && !v[f]?.trim());
    if (missing.length) {
      toast.error(`Required: ${missing.join(", ")}`);
      return;
    }
    const id = `p${Date.now()}`;
    createProject(tenantId, {
      id,
      code: `${cfg.tenant.code}-PRJ-${String(Date.now()).slice(-4)}`,
      name: v["Project name"] ?? "Untitled",
      description: v["Description"] ?? "",
      category: v["Category"] ?? "",
      type: v["Type"] ?? "",
      source: v["Source"] ?? "",
      benefitType: v["Benefits"] ?? "",
      entity: v["Entity"] ?? "",
      budget: Number(v["Budget"] || 0),
      pm: "Saeed Al Mansoori",
      confidential,
      stageId: first.id,
      status: "In progress",
      health: 100,
      approval: null,
      tools: preview.attach,
      createdAt: new Date().toISOString(),
      history: [{ at: new Date().toISOString(), role: "Project Manager", text: `${cfg.intake} created in ${first.label}` }],
    });
    toast.success(`${cfg.intake} created — ${preview.attach.length} mandatory toolkit item(s) attached`);
    onDone(id);
  };

  return (
    <div className="max-w-4xl space-y-5">
      <h1 className="text-xl font-semibold">New {cfg.intake}</h1>
      <div className={cn(card, "grid gap-4 p-5 md:grid-cols-2")}>
        {text.map((f) => (
          <label key={f} className={cn("block text-sm text-cp-text2", f !== "Project name" && f !== "Objective" && "md:col-span-2")}>
            {f} {req[f] ? <span className="text-cp-orange">*</span> : null}
            <input className={input} value={v[f] ?? ""} onChange={(e) => set(f, e.target.value)} aria-label={f} />
          </label>
        ))}
        {selects.map(([f, opts]) => (
          <label key={f} className="block text-sm text-cp-text2">
            {f === "Benefits" ? "Benefit type" : f} {req[f] ? <span className="text-cp-orange">*</span> : null}
            <select className={input} value={v[f]} onChange={(e) => set(f, e.target.value)} aria-label={f}>
              {opts.map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
        ))}
        <label className="block text-sm text-cp-text2">
          External entity
          <select className={input} value={v["Entity"]} onChange={(e) => set("Entity", e.target.value)}>
            <option value="">—</option>
            {ents.map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label className="block text-sm text-cp-text2">
          Budget ({cfg.tenant.currency}) {req["Budget"] ? <span className="text-cp-orange">*</span> : null}
          <input type="number" className={input} value={v["Budget"] ?? ""} onChange={(e) => set("Budget", e.target.value)} aria-label="Budget" />
        </label>
        {cfg.proposal.confidential ? (
          <label className="flex items-center gap-2 text-sm text-cp-text2 md:col-span-2">
            <input type="checkbox" checked={confidential} onChange={(e) => setConfidential(e.target.checked)} /> Confidential project (uses confidential workflow)
          </label>
        ) : null}
      </div>
      <div className={cn(card, "p-4")}>
        <p className="mb-2 text-sm font-semibold">Toolkit items that will be attached</p>
        {preview.attach.length === 0 ? <p className="text-xs text-cp-muted">None for this category/type.</p> : null}
        {preview.attach.map((a) => (
          <p key={a.toolId} className="flex items-center gap-2 text-sm text-cp-text2">
            <Lock className="size-3.5 text-cp-purple" /> {cfg.tools.find((t) => t.id === a.toolId)?.name} — {a.reason}
          </p>
        ))}
        {preview.skipped.map((s) => (
          <p key={s.tool.id} className="text-xs text-cp-muted">{s.tool.name} skipped: {s.reason}</p>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className={outlineBtn} onClick={() => onDone()}>Cancel</button>
        <button type="button" className={primaryBtn} onClick={submit}>Create {cfg.intake}</button>
      </div>
    </div>
  );
}

/* ---------------- Project view ---------------- */

function ProjectView({
  cfg,
  tenantId,
  p,
  role,
  ar,
  openTool,
  back,
}: {
  cfg: PreviewConfig;
  tenantId: string;
  p: PProject;
  role: PreviewRole;
  ar: boolean;
  openTool: (id: string) => void;
  back: () => void;
}) {
  const [comment, setComment] = useState("");
  const [picker, setPicker] = useState(false);
  const curIdx = cfg.stages.findIndex((s) => s.id === p.stageId);
  const stage = cfg.stages[curIdx];
  const wf = mockWorkflows.find((w) => w.id === p.approval?.workflowId);
  const step = wf && p.approval ? wf.steps[p.approval.stepIdx] : undefined;
  const myTurn = !!step && step.assigneeRole === role.name;
  const isPM = role.name === "Project Manager" && can(role, "Projects", "Edit");
  const canSubmit = isPM && stage && (p.status === "In progress" || p.status === "Returned");
  const stageTools = p.tools.filter((t) => t.stageId === p.stageId);
  const otherTools = p.tools.filter((t) => t.stageId !== p.stageId);
  const optional = cfg.tools.filter(
    (t) =>
      t.status === "Active" &&
      t.mode === "Optional" &&
      stage &&
      (t.allowedStages.includes(stage.id) || t.allowedStages.includes(stage.phaseId)) &&
      !p.tools.some((x) => x.toolId === t.id),
  );
  const h = healthState(cfg, p);
  const f = cfg.features;
  const wfInfo = stage ? stageWorkflow(stage.id, p.confidential) : null;

  return (
    <div className="space-y-5">
      <button type="button" onClick={back} className="text-sm text-cp-purple">← Projects</button>
      <div className={cn(card, "p-5")}>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold">{p.name}</h1>
          <Pill tone={statusTone[p.status]!}>{p.status}</Pill>
          {featureOn(f, "project", "Health score system") ? <Pill tone={h.tone}>{h.label} · {p.health}%</Pill> : null}
          {p.confidential ? <Pill tone="bg-cp-purple-soft text-cp-purple">Confidential</Pill> : null}
          {canSubmit ? (
            <button type="button" className={cn(primaryBtn, "ms-auto")} onClick={() => submitStage(tenantId, cfg, p, role.name)}>
              Submit for approval
            </button>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-cp-muted">
          {p.code} · {p.category} · {p.type} · {p.source} · {fmtMoney(p.budget, cfg.tenant.currency, cfg.branding.numberFormat)} · PM {p.pm} · {fmtDate(p.createdAt, cfg.branding.dateFormat)}
        </p>
      </div>

      {/* Stepper */}
      <div className={cn(card, "flex flex-wrap items-start gap-1 p-4")}>
        {cfg.stages.map((s, i) => {
          const done = p.status === "Completed" || i < curIdx;
          const current = i === curIdx && p.status !== "Completed";
          const newPhase = i === 0 || cfg.stages[i - 1]!.phaseId !== s.phaseId;
          return (
            <div key={s.id} className="flex min-w-[140px] flex-1 flex-col gap-1">
              <p className="h-4 text-[10px] font-semibold uppercase tracking-wide text-cp-muted">{newPhase ? (ar ? s.phaseNameAr : s.phaseName) : ""}</p>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    done ? "bg-cp-teal text-primary-foreground" : current ? "bg-cp-purple text-primary-foreground" : "bg-cp-bg text-cp-muted",
                  )}
                >
                  {done ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span className={cn("text-sm", current ? "font-semibold text-cp-purple" : "text-cp-text2")}>{ar ? s.nameAr : s.label}</span>
                {i < cfg.stages.length - 1 ? <span className="h-px flex-1 bg-cp-border" /> : null}
              </div>
            </div>
          );
        })}
      </div>

      {p.approval && wf && step ? (
        <div className={cn(card, "space-y-3 border-cp-orange p-4")}>
          <p className="text-sm font-semibold">Approval in progress · {wf.title} {wf.version} ({wf.key})</p>
          <ol className="flex flex-wrap gap-2">
            {wf.steps.map((s, i) => (
              <li
                key={s.order}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs",
                  i < p.approval!.stepIdx ? "border-cp-teal bg-cp-teal-soft text-cp-teal" : i === p.approval!.stepIdx ? "border-cp-orange bg-cp-orange-soft font-semibold text-cp-orange" : "border-cp-border text-cp-muted",
                )}
              >
                {s.order}. {s.name} · {s.assigneeRole}
              </li>
            ))}
          </ol>
          {myTurn ? (
            <div className="flex flex-wrap items-center gap-2">
              <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comment (optional)" className="h-9 flex-1 rounded-lg border border-cp-border px-3 text-sm" />
              {step.actions.includes("approve") ? (
                <button type="button" className={primaryBtn} onClick={() => { actOnStage(tenantId, cfg, p, "approve", role.name, comment); setComment(""); }}>Approve</button>
              ) : null}
              {step.actions.includes("return") ? (
                <button type="button" className={outlineBtn} onClick={() => actOnStage(tenantId, cfg, p, "return", role.name, comment)}>Return</button>
              ) : null}
              {step.actions.includes("reject") ? (
                <button type="button" className={cn(outlineBtn, "text-cp-red")} onClick={() => actOnStage(tenantId, cfg, p, "reject", role.name, comment)}>Reject</button>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-cp-muted">Waiting for <b>{step.assigneeRole}</b>. Switch “Previewing as” to act on this step.</p>
          )}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className={cn(card, "p-5")}>
            <p className="mb-3 text-sm font-semibold">{stage ? (ar ? stage.nameAr : stage.label) : "Stage not in lifecycle"}</p>
            {stage?.config === "proposal" ? (
              <dl className="grid gap-3 text-sm md:grid-cols-2">
                {[
                  ["Description", p.description],
                  ["Benefit type", p.benefitType],
                  ["External entity", p.entity || "—"],
                  ["Approval workflow", wfInfo?.note ?? "—"],
                ].map(([k, val]) => (
                  <div key={k}>
                    <dt className="text-xs text-cp-muted">{k}</dt>
                    <dd className="text-cp-text">{val}</dd>
                  </div>
                ))}
              </dl>
            ) : stage?.config === "execution" ? (
              <div className="space-y-3">
                <div className="grid gap-2 md:grid-cols-4">
                  {scheduleComponents.map((c, i) => (
                    <div key={c} className="rounded-lg bg-cp-bg p-3">
                      <p className="text-xs text-cp-muted">{c}</p>
                      <p className="text-lg font-bold text-cp-purple">{[4, 9, 14, 38][i]}</p>
                    </div>
                  ))}
                </div>
                {featureOn(f, "project", "Gantt chart") ? <div className="rounded-lg border border-dashed border-cp-border p-3 text-xs text-cp-muted">Gantt chart</div> : null}
                {featureOn(f, "project", "Risk management") ? <div className="rounded-lg border border-cp-border p-3 text-sm">Risk register · 3 open risks</div> : null}
              </div>
            ) : stage?.config === "closure" ? (
              <p className="text-sm text-cp-text2">Closure prerequisites, sign-off{featureOn(f, "project", "Lessons learned hub") ? " and lessons learned" : ""}.</p>
            ) : (
              <p className="text-sm text-cp-text2">{wfInfo?.note}</p>
            )}
          </div>

          <div className={cn(card, "p-5")}>
            <div className="mb-3 flex items-center gap-2">
              <Wrench className="size-4 text-cp-purple" />
              <p className="text-sm font-semibold">Toolkit items in this stage</p>
              {isPM && optional.length ? (
                <button type="button" onClick={() => setPicker((v) => !v)} className={cn(outlineBtn, "ms-auto")}>
                  <Plus className="size-4" /> Add from toolkit
                </button>
              ) : null}
            </div>
            {picker ? (
              <div className="mb-3 space-y-1 rounded-lg bg-cp-bg p-2">
                {optional.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      projectsStore.set(tenantId, (all) =>
                        all.map((x) =>
                          x.id === p.id
                            ? { ...x, tools: [...x.tools, { toolId: t.id, stageId: stage!.id, locked: false, status: "Not started", reason: `Optional → added by PM at ${stage!.label}`, data: {}, approval: null }] }
                            : x,
                        ),
                      );
                      setPicker(false);
                      toast.success(`${t.name} added`);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm hover:bg-cp-card"
                  >
                    <Plus className="size-3.5" /> {t.name} <span className="text-xs text-cp-muted">{t.category}</span>
                  </button>
                ))}
              </div>
            ) : null}
            <ToolList cfg={cfg} list={stageTools} p={p} tenantId={tenantId} isPM={isPM} openTool={openTool} />
            {otherTools.length ? (
              <>
                <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-cp-muted">Other stages</p>
                <ToolList cfg={cfg} list={otherTools} p={p} tenantId={tenantId} isPM={false} openTool={openTool} />
              </>
            ) : null}
          </div>
        </div>

        <div className={cn(card, "h-fit p-4")}>
          <p className="mb-2 text-sm font-semibold">History</p>
          <ol className="space-y-2">
            {[...p.history].reverse().map((e, i) => (
              <li key={i} className="border-s-2 border-cp-purple-soft ps-3 text-xs">
                <p className="text-cp-text">{e.text}</p>
                <p className="text-cp-muted">{e.role} · {fmtDate(e.at, cfg.branding.dateFormat)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

const toolTone: Record<string, string> = {
  "Not started": "bg-cp-blue-soft text-cp-blue",
  "In progress": "bg-cp-amber-soft text-cp-amber",
  Completed: "bg-cp-teal-soft text-cp-teal",
  Approved: "bg-cp-teal-soft text-cp-teal",
  "Pending approval": "bg-cp-orange-soft text-cp-orange",
  Returned: "bg-cp-red-soft text-cp-red",
};

function ToolList({
  cfg,
  list,
  p,
  tenantId,
  isPM,
  openTool,
}: {
  cfg: PreviewConfig;
  list: AttachedTool[];
  p: PProject;
  tenantId: string;
  isPM: boolean;
  openTool: (id: string) => void;
}) {
  if (!list.length) return <p className="text-xs text-cp-muted">No toolkit items.</p>;
  return (
    <ul className="space-y-2">
      {list.map((a) => {
        const t = cfg.tools.find((x) => x.id === a.toolId);
        if (!t) return null;
        const Icon = t.icon;
        return (
          <li key={a.toolId} className="flex items-center gap-3 rounded-lg border border-cp-border p-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-cp-purple-soft text-cp-purple"><Icon className="size-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                {t.name} {a.locked ? <Lock className="size-3 text-cp-muted" aria-label="Mandatory" /> : null}
              </p>
              <p className="text-[11px] text-cp-muted">{a.locked ? "Mandatory — cannot be removed" : "Optional"} · {cfg.stages.find((s) => s.id === a.stageId)?.label}</p>
            </div>
            <Pill tone={toolTone[a.status]!}>{a.status}</Pill>
            <button type="button" className={outlineBtn} onClick={() => openTool(a.toolId)}>Open</button>
            {isPM && !a.locked ? (
              <button
                type="button"
                aria-label={`Remove ${t.name}`}
                onClick={() => projectsStore.set(tenantId, (all) => all.map((x) => (x.id === p.id ? { ...x, tools: x.tools.filter((y) => y.toolId !== a.toolId) } : x)))}
              >
                <X className="size-4 text-cp-muted" />
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function ToolDrawer({
  cfg,
  tenantId,
  p,
  toolId,
  role,
  close,
}: {
  cfg: PreviewConfig;
  tenantId: string;
  p: PProject;
  toolId: string;
  role: PreviewRole;
  close: () => void;
}) {
  const att = p.tools.find((t) => t.toolId === toolId);
  const tool: Tool | undefined = cfg.tools.find((t) => t.id === toolId);
  if (!att || !tool) return null;
  const isPM = role.name === "Project Manager" && can(role, "Projects", "Edit");
  const editable = isPM && (att.status === "Not started" || att.status === "In progress" || att.status === "Returned");
  const wf = mockWorkflows.find((w) => w.id === att.approval?.workflowId);
  const step = wf && att.approval ? wf.steps[att.approval.stepIdx] : undefined;
  const myTurn = step?.assigneeRole === role.name;
  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-cp-text/30" onClick={close}>
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-cp-card p-6 font-cp" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start gap-3">
          <div className="flex-1">
            <p className="flex items-center gap-2 text-lg font-semibold">
              {tool.name} {att.locked ? <Lock className="size-4 text-cp-muted" /> : null}
            </p>
            <p className="text-xs text-cp-muted">{att.reason}</p>
            <p className="text-xs text-cp-muted">
              {tool.requiresApproval ? `Requires approval · workflow ${mockWorkflows.find((w) => w.id === tool.workflowId)?.title ?? "—"}` : "No approval required"}
            </p>
          </div>
          <Pill tone={toolTone[att.status]!}>{att.status}</Pill>
          <button type="button" onClick={close} aria-label="Close tool"><X className="size-5 text-cp-muted" /></button>
        </div>
        <ToolBody
          tool={tool}
          data={att.data}
          readOnly={!editable}
          currency={cfg.tenant.currency}
          set={(k, val) => updateTool(tenantId, p.id, toolId, (t) => ({ ...t, data: { ...t.data, [k]: val }, status: t.status === "Not started" ? "In progress" : t.status }))}
        />
        {step ? (
          <div className="mt-4 rounded-lg bg-cp-orange-soft p-3 text-sm">
            Step {step.order} · {step.name} — waiting for <b>{step.assigneeRole}</b>
            {myTurn ? (
              <div className="mt-2 flex gap-2">
                <button type="button" className={primaryBtn} onClick={() => actOnTool(tenantId, cfg, p, att, "approve", role.name)}>Approve</button>
                <button type="button" className={outlineBtn} onClick={() => actOnTool(tenantId, cfg, p, att, "return", role.name)}>Return</button>
              </div>
            ) : null}
          </div>
        ) : null}
        {editable ? (
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" className={primaryBtn} onClick={() => submitTool(tenantId, cfg, p, att, role.name)}>
              {tool.requiresApproval && tool.workflowId ? "Submit for approval" : "Mark complete"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
