import { Lock, X } from 'lucide-react';
import { mockWorkflows } from '@/components/project-core/data';
import type { Tool } from '@/components/project-core/toolkitData';
import { cn } from '@/lib/utils';
import { can, projectsStore, type AttachedTool, type PProject, type PreviewConfig, type PreviewRole } from './engine';
import { actOnTool, submitTool, updateTool } from './actions';
import { ToolBody } from './ToolViews';
import { Badge, CpButton } from './PreviewUI';
const primaryBtn='cp-button-purple'; const outlineBtn='cp-button-outline';
function Pill({tone,children}:{tone:string;children:React.ReactNode}) {return <span className={cn('cp-badge',tone)}>{children}</span>;}
const toolTone: Record<string, string> = {
  "Not started": "bg-cp-blue-soft text-cp-blue",
  "In progress": "bg-cp-amber-soft text-cp-amber",
  Completed: "bg-cp-teal-soft text-cp-teal",
  Approved: "bg-cp-teal-soft text-cp-teal",
  "Pending approval": "bg-cp-orange-soft text-cp-orange",
  Returned: "bg-cp-red-soft text-cp-red",
};

export function ToolList({
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
            <Pill tone={toolTone[a.status] ?? ""}>{a.status}</Pill>
            <CpButton type="button" className={outlineBtn} onClick={() => openTool(a.toolId)}>Open</CpButton>
            {isPM && !a.locked ? (
              <CpButton
                type="button"
                aria-label={`Remove ${t.name}`}
                onClick={() => projectsStore.set(tenantId, (all) => all.map((x) => (x.id === p.id ? { ...x, tools: x.tools.filter((y) => y.toolId !== a.toolId) } : x)))}
              >
                <X className="size-4 text-cp-muted" />
              </CpButton>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function ToolDrawer({
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
          <Pill tone={toolTone[att.status] ?? ""}>{att.status}</Pill>
          <CpButton type="button" onClick={close} aria-label="Close tool"><X className="size-5 text-cp-muted" /></CpButton>
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
                <CpButton type="button" className={primaryBtn} onClick={() => actOnTool(tenantId, cfg, p, att, "approve", role.name)}>Approve</CpButton>
                <CpButton type="button" className={outlineBtn} onClick={() => actOnTool(tenantId, cfg, p, att, "return", role.name)}>Return</CpButton>
              </div>
            ) : null}
          </div>
        ) : null}
        {editable ? (
          <div className="mt-5 flex justify-end gap-2">
            <CpButton type="button" className={primaryBtn} onClick={() => submitTool(tenantId, cfg, p, att, role.name)}>
              {tool.requiresApproval && tool.workflowId ? "Submit for approval" : "Mark complete"}
            </CpButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}
