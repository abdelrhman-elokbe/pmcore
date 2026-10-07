import { createTenantStore } from "@/lib/platform/tenantStore";
import { getTenant, type Tenant } from "@/lib/platform/data";
import {
  getAssignment,
  mockWorkflows,
  permissionColumns,
  type Phase,
  type Role,
  type WorkflowDef,
} from "@/components/project-core/data";
import {
  brandingStore,
  featuresStore,
  lookupsStore,
  notifRulesStore,
  phasesStore,
  proposalStore,
  rolesStore,
  scopeRules,
  type BrandingSettings,
  type FeaturesState,
  type ProposalSettings,
} from "@/components/project-core/configStores";
import type { TenantLookups } from "@/components/project-core/lookupsData";
import { globalDefaultRules } from "@/components/project-core/notificationsData";
import { toolkitStore, type Tool } from "@/components/project-core/toolkitData";

/* ---------------- Derived configuration ---------------- */

export type FlatStage = {
  id: string;
  name: string;
  nameAr: string;
  label: string;
  phaseId: string;
  phaseName: string;
  phaseNameAr: string;
  index: number;
  config: string;
};

export type PreviewRole = {
  id: string;
  name: string;
  workflowOnly: boolean;
  matrix: Record<string, boolean[]>;
};

export type MenuId =
  | "dashboard"
  | "proposals"
  | "projects"
  | "pmo-dashboards"
  | "pmo-reports"
  | "change-requests"
  | "closure-requests"
  | "lessons"
  | "configurations";

export type AdminLink = { screen: string; tool?: string };
export type TraceLine = { kind: "info" | "hidden" | "warn" | "ok"; text: string; link?: AdminLink };

export type PreviewConfig = {
  tenant: Tenant;
  intake: string;
  intakePlural: string;
  phases: Phase[];
  stages: FlatStage[];
  disabledStages: FlatStage[];
  features: FeaturesState;
  roles: PreviewRole[];
  lookups: TenantLookups;
  branding: BrandingSettings;
  proposal: ProposalSettings;
  tools: Tool[];
};

export const featureOn = (f: FeaturesState, sectionId: string, item?: string) => {
  if (f.enabled[sectionId] === false) return false;
  if (!item) return true;
  const sec = f.sections.find((s) => s.id === sectionId);
  return !!sec?.items.find((i) => i.name.startsWith(item))?.enabled;
};

export function buildConfig(
  tenantId: string,
  parts: {
    phases: Phase[];
    features: FeaturesState;
    roles: Role[];
    lookups: TenantLookups;
    branding: BrandingSettings;
    proposal: ProposalSettings;
    tools: Tool[];
  },
): PreviewConfig {
  const tenant = getTenant(tenantId);
  const intake = tenant.intakeLabel;
  const all: FlatStage[] = [];
  parts.phases.forEach((ph) =>
    ph.stages.forEach((s) =>
      all.push({
        id: s.id,
        name: s.name,
        nameAr: s.nameAr,
        label: s.id === "proposal" ? intake : s.name,
        phaseId: ph.id,
        phaseName: ph.name,
        phaseNameAr: ph.nameAr,
        index: 0,
        config: s.config,
      }),
    ),
  );
  const enabledIds = new Set(
    parts.phases.flatMap((ph) => ph.stages.filter((s) => s.enabled).map((s) => s.id)),
  );
  const stages = all.filter((s) => enabledIds.has(s.id)).map((s, i) => ({ ...s, index: i }));
  const disabledStages = all.filter((s) => !enabledIds.has(s.id));

  const roles: PreviewRole[] = parts.roles.map((r) => ({
    id: r.id,
    name: r.name,
    workflowOnly: false,
    matrix: r.matrix,
  }));
  const wfRoles = new Set(
    mockWorkflows
      .filter((w) => w.consumer === "Project Core")
      .flatMap((w) => w.steps.map((s) => s.assigneeRole)),
  );
  wfRoles.forEach((name) => {
    if (!roles.some((r) => r.name === name))
      roles.push({
        id: `wf:${name}`,
        name,
        workflowOnly: true,
        matrix: { Projects: [true, false, false, true, false, false] },
      });
  });

  return {
    tenant,
    intake,
    intakePlural: intake === "Proposal" ? "Project Proposals" : `${intake}s`,
    phases: parts.phases,
    stages,
    disabledStages,
    features: parts.features,
    roles,
    lookups: parts.lookups,
    branding: parts.branding,
    proposal: parts.proposal,
    tools: parts.tools,
  };
}

export function usePreviewConfig(tenantId: string, tools: Tool[]) {
  const [phases] = phasesStore.use(tenantId);
  const [features] = featuresStore.use(tenantId);
  const [roles] = rolesStore.use(tenantId);
  const [lookups] = lookupsStore.use(tenantId);
  const [branding] = brandingStore.use(tenantId);
  const [proposal] = proposalStore.use(tenantId);
  // subscribe so notification rule edits re-render
  notifRulesStore.use(tenantId);
  return buildConfig(tenantId, { phases, features, roles, lookups, branding, proposal, tools });
}

export type Action = (typeof permissionColumns)[number];
export const can = (role: PreviewRole, feature: string, action: Action) =>
  !!role.matrix[feature]?.[permissionColumns.indexOf(action)];

/* ---------------- Menu visibility ---------------- */

export type MenuItemState = { id: MenuId; label: string; visible: boolean; reason: string; link: AdminLink };

export function menuItems(cfg: PreviewConfig, role: PreviewRole): MenuItemState[] {
  const f = cfg.features;
  const perm = (feat: string) => can(role, feat, "View");
  const closureOn = cfg.stages.some((s) => s.id === "closure");
  const firstStage = cfg.stages[0];
  const item = (
    id: MenuId,
    label: string,
    feature: boolean,
    featureReason: string,
    permOk: boolean,
    permFeat: string,
    link: AdminLink,
  ): MenuItemState => ({
    id,
    label,
    visible: feature && permOk,
    reason: !feature
      ? featureReason
      : !permOk
        ? `${role.name} has no View permission on ${permFeat}`
        : "Visible",
    link: !feature ? link : { screen: "roles" },
  });
  return [
    item("dashboard", "Dashboard", featureOn(f, "pm-dashboard"), "PM Dashboard feature disabled", true, "", { screen: "features" }),
    item("proposals", cfg.intakePlural, !!firstStage, "No enabled stage in lifecycle", perm("Projects"), "Projects", { screen: "stages" }),
    item("projects", "Projects", true, "", perm("Projects"), "Projects", { screen: "roles" }),
    item("pmo-dashboards", "PMO Dashboards", featureOn(f, "dashboard"), "PMO Dashboard section disabled", perm("PMO Dashboard"), "PMO Dashboard", { screen: "features" }),
    item("pmo-reports", "PMO Reports", featureOn(f, "reports"), "PMO Reports Center disabled", perm("PMO Reports"), "PMO Reports", { screen: "features" }),
    item("change-requests", "Change Requests", featureOn(f, "cr"), "Change requests feature disabled", perm("Change requests"), "Change requests", { screen: "features" }),
    item("closure-requests", "Closure Requests", closureOn, "Closure stage disabled", perm("Projects"), "Projects", { screen: "stages" }),
    item("lessons", "Lessons Learned Hub", featureOn(f, "project", "Lessons learned hub"), "Lessons learned hub feature disabled", perm("Projects"), "Projects", { screen: "features" }),
    item("configurations", "Configurations", true, "", perm("Configurations"), "Configurations", { screen: "roles" }),
  ];
}

/* ---------------- Workflows ---------------- */

export function stageWorkflow(
  stageId: string,
  confidential: boolean,
): { wf: WorkflowDef | null; note: string } {
  const a = getAssignment(stageId);
  const id = confidential && a.useConfidential && a.confidential ? a.confidential : a.standard;
  if (!id) return { wf: null, note: "No approval workflow assigned — stage auto-advances on submit" };
  const wf = mockWorkflows.find((w) => w.id === id) ?? null;
  if (!wf || wf.status !== "Enabled")
    return { wf: null, note: `Assigned workflow ${id} is unavailable — auto-advances` };
  return { wf, note: `${wf.title} ${wf.version} (${wf.key})` };
}

export const firstApprovalStep = (wf: WorkflowDef) =>
  wf.steps[0]?.assigneeRole === "Project Manager" ? 1 : 0;

/* ---------------- Demo projects ---------------- */

export type HistoryEntry = {
  at: string;
  role: string;
  text: string;
};

export type Approval = { workflowId: string; stepIdx: number };

export type ToolStatus = "Not started" | "In progress" | "Completed" | "Pending approval" | "Approved" | "Returned";

export type AttachedTool = {
  toolId: string;
  stageId: string;
  locked: boolean;
  status: ToolStatus;
  reason: string;
  data: Record<string, string>;
  approval: Approval | null;
};

export type ProjectStatus = "In progress" | "Pending approval" | "Returned" | "Rejected" | "Completed";

export type PProject = {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  type: string;
  source: string;
  benefitType: string;
  entity: string;
  budget: number;
  pm: string;
  confidential: boolean;
  stageId: string;
  status: ProjectStatus;
  health: number;
  approval: Approval | null;
  tools: AttachedTool[];
  createdAt: string;
  history: HistoryEntry[];
};

/** Resolve a tool's default stage (phase ids map to their first enabled stage). */
export function resolveStage(cfg: PreviewConfig, id: string | null): FlatStage | null {
  if (!id) return null;
  return cfg.stages.find((s) => s.id === id) ?? cfg.stages.find((s) => s.phaseId === id) ?? null;
}

export function mandatoryTools(
  cfg: PreviewConfig,
  category: string,
  type: string,
): { attach: AttachedTool[]; skipped: { tool: Tool; reason: string }[] } {
  const attach: AttachedTool[] = [];
  const skipped: { tool: Tool; reason: string }[] = [];
  cfg.tools
    .filter((t) => t.status === "Active" && t.mode === "Mandatory")
    .forEach((t) => {
      const { projectTypes, categories } = t.mandatoryScope;
      if (projectTypes.length && !projectTypes.includes(type)) {
        skipped.push({ tool: t, reason: `type "${type}" not in mandatory scope` });
        return;
      }
      if (categories.length && !categories.includes(category)) {
        skipped.push({ tool: t, reason: `category "${category}" not in scope (${categories.join(", ")})` });
        return;
      }
      const st = resolveStage(cfg, t.defaultStage);
      if (!st) {
        skipped.push({ tool: t, reason: "default stage is disabled or not set" });
        return;
      }
      const scope =
        !projectTypes.length && !categories.length
          ? "all projects"
          : [projectTypes.join(", "), categories.join(", ")].filter(Boolean).join(" · ");
      attach.push({
        toolId: t.id,
        stageId: st.id,
        locked: true,
        status: "Not started",
        reason: `Mandatory → attached at ${st.label} (rule: ${scope})`,
        data: {},
        approval: null,
      });
    });
  return { attach, skipped };
}

const names = (l: { name: string; active: boolean }[]) => l.filter((x) => x.active).map((x) => x.name);

function seedProjects(tid: string): PProject[] {
  const phases = phasesStore.get(tid);
  const cfg = buildConfig(tid, {
    phases,
    features: featuresStore.get(tid),
    roles: rolesStore.get(tid),
    lookups: lookupsStore.get(tid),
    branding: brandingStore.get(tid),
    proposal: proposalStore.get(tid),
    tools: toolkitStore.get(),
  });
  const cats = names(cfg.lookups.categories);
  const types = names(cfg.lookups.types);
  const srcs = names(cfg.lookups.sources);
  const bens = names(cfg.lookups["benefit-types"]);
  const ents = cfg.lookups["external-entities"].filter((e) => e.active).map((e) => e.name);
  const pick = (l: string[], i: number) => l[i % Math.max(1, l.length)] ?? "—";
  const at = (s: string) => cfg.stages.find((x) => x.id === s)?.id ?? cfg.stages[0]?.id ?? "proposal";
  const dcaa = tid === "dcaa";
  const rows: [string, string, number, ProjectStatus, number, Approval | null][] = dcaa
    ? [
        ["Heritage Site Digitisation", "execution", 84, "In progress", 2400000, null],
        ["Al Shindagha Museum Expansion", "proposal", 100, "Pending approval", 18500000, { workflowId: "wf-standard-stage", stepIdx: 1 }],
        ["Dubai Design Week 2026", "execution", 42, "In progress", 6200000, null],
        ["Community Arts Grant Portal", "closure", 66, "In progress", 950000, null],
        ["Hatta Cultural Trail", "proposal", 100, "In progress", 1300000, null],
      ]
    : [
        ["King Salman Park Wayfinding", "execution", 81, "In progress", 3100000, null],
        ["Diriyah Gate Utilities", "proposal", 100, "Pending approval", 42000000, { workflowId: "wf-standard-stage", stepIdx: 1 }],
        ["Metro Line 7 Feasibility", "execution", 28, "In progress", 8800000, null],
        ["Urban Greening Phase 2", "closure", 70, "In progress", 2600000, null],
      ];
  return rows.map(([name, stage, health, status, budget, approval], i) => {
    const category = pick(cats, i);
    const type = pick(types, i);
    const stageId = at(stage);
    const stageIdx = cfg.stages.findIndex((s) => s.id === stageId);
    const tools = mandatoryTools(cfg, category, type).attach.map((t) => {
      const tIdx = cfg.stages.findIndex((s) => s.id === t.stageId);
      return tIdx < stageIdx || status === "Pending approval"
        ? { ...t, status: "Approved" as ToolStatus }
        : t;
    });
    return {
      id: `p${i + 1}`,
      code: `${cfg.tenant.code}-PRJ-${String(1040 + i)}`,
      name,
      description: `${name} — sample project seeded for the preview.`,
      category,
      type,
      source: pick(srcs, i),
      benefitType: pick(bens, i),
      entity: pick(ents, i),
      budget,
      pm: i % 2 ? "Mariam Tarek" : "Saeed Al Mansoori",
      confidential: false,
      stageId,
      status,
      health,
      approval,
      tools,
      createdAt: new Date(2026, 3 + i, 4 + i * 3).toISOString(),
      history: [{ at: new Date(2026, 3 + i, 4 + i * 3).toISOString(), role: "Project Manager", text: "Project created" }],
    };
  });
}

export const projectsStore = createTenantStore<PProject[]>(seedProjects);

/* ---------------- Notifications ---------------- */

export type PNotif = {
  id: string;
  at: string;
  text: string;
  event: string;
  rule: string;
  recipients: string[];
  channels: string[];
  inApp: boolean;
  readBy: string[];
};

export const notifStore = createTenantStore<PNotif[]>(() => []);

const recipientMap: Record<string, string[]> = {
  "Project Manager": ["Project Manager"],
  Sponsor: ["Project Sponsor"],
  PMO: ["PMO Officer", "PMO Director"],
  "Stage owner": ["Project Manager"],
};

export function fireEvent(
  tid: string,
  stage: FlatStage,
  event: string,
  ctx: { project: string; actor: string; approverRole?: string; comment?: string; prefix?: string },
): PNotif[] {
  const all = notifRulesStore.get(tid);
  const st = scopeRules(all, stage.id, true);
  let rules = st.rules;
  let source = `Stage rule · ${stage.label}`;
  if (st.inherit) {
    rules = scopeRules(all, stage.phaseId, false).rules;
    source = `Stage rule · ${stage.phaseName} (inherited by ${stage.label})`;
  }
  let matched = rules.filter((r) => r.enabled && r.event === event);
  if (!matched.length) {
    matched = globalDefaultRules.filter((r) => r.enabled && r.event === event);
    source = "Global default (Notifications)";
  }
  const out: PNotif[] = matched.map((r) => {
    const recipients = Array.from(
      new Set(
        r.roles.flatMap((x) =>
          x === "Approver" ? (ctx.approverRole ? [ctx.approverRole] : []) : (recipientMap[x] ?? [x]),
        ),
      ),
    );
    const text = r.template
      .replaceAll("{{project.name}}", ctx.project)
      .replaceAll("{{stage.name}}", stage.label)
      .replaceAll("{{actor.name}}", ctx.actor)
      .replaceAll("{{comment}}", ctx.comment || "no comment")
      .replaceAll("{{days}}", String(r.daysBefore ?? 5));
    return {
      id: `n${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toISOString(),
      text: ctx.prefix ? `${ctx.prefix}: ${text}` : text,
      event,
      rule: `${source} · “${r.event}” (${r.id})`,
      recipients: [...recipients, ...r.specific],
      channels: r.channels,
      inApp: r.channels.includes("In-app"),
      readBy: [],
    };
  });
  if (out.length) notifStore.set(tid, (p) => [...out, ...p]);
  return out;
}

/* ---------------- Formatting ---------------- */

export function fmtDate(iso: string, format: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const y = d.getFullYear();
  if (format === "MM/DD/YYYY") return `${mm}/${dd}/${y}`;
  if (format === "YYYY-MM-DD") return `${y}-${mm}-${dd}`;
  return `${dd}/${mm}/${y}`;
}

export function fmtMoney(n: number, currency: string, numberFormat: string) {
  const locale = numberFormat === "1.234,56" ? "de-DE" : numberFormat === "1 234.56" ? "fr-FR" : "en-US";
  return `${currency} ${n.toLocaleString(locale)}`;
}

export type HealthState = { label: "On Track" | "At Risk" | "Off Track" | "Not Started" | "Closed"; tone: string };

export function healthState(cfg: PreviewConfig, p: PProject): HealthState {
  if (p.status === "Completed") return { label: "Closed", tone: "bg-muted text-cp-muted" };
  if (cfg.stages[0]?.id === p.stageId) return { label: "Not Started", tone: "bg-cp-blue-soft text-cp-blue" };
  const bands = [...cfg.lookups["health-score"]].sort((a, b) => a.from - b.from);
  const idx = bands.findIndex((b) => p.health >= b.from && p.health <= b.to);
  if (idx === bands.length - 1) return { label: "On Track", tone: "bg-cp-teal-soft text-cp-teal" };
  if (idx <= 0) return { label: "Off Track", tone: "bg-cp-red-soft text-cp-red" };
  return { label: "At Risk", tone: "bg-cp-amber-soft text-cp-amber" };
}
