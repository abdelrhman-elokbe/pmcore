import { toast } from "sonner";
import { mockWorkflows } from "@/components/project-core/data";
import {
  fireEvent,
  firstApprovalStep,
  projectsStore,
  stageWorkflow,
  type AttachedTool,
  type PNotif,
  type PProject,
  type PreviewConfig,
} from "./engine";

const now = () => new Date().toISOString();

function announce(list: PNotif[]) {
  list.forEach((n) =>
    toast(n.inApp ? "Notification fired" : "Email notification (simulated)", {
      description: `${n.text} — ${n.rule} → ${n.recipients.join(", ") || "no recipients"}`,
    }),
  );
}

const patch = (tid: string, id: string, fn: (p: PProject) => PProject) =>
  projectsStore.set(tid, (all) => all.map((p) => (p.id === id ? fn(p) : p)));

export function createProject(tid: string, p: PProject) {
  projectsStore.set(tid, (all) => [p, ...all]);
}

function advance(tid: string, cfg: PreviewConfig, p: PProject, actor: string) {
  const idx = cfg.stages.findIndex((s) => s.id === p.stageId);
  const cur = cfg.stages[idx];
  const next = cfg.stages[idx + 1];
  if (cur) announce(fireEvent(tid, cur, "Approved", { project: p.name, actor }));
  if (next) {
    patch(tid, p.id, (x) => ({
      ...x,
      stageId: next.id,
      status: "In progress",
      approval: null,
      history: [...x.history, { at: now(), role: actor, text: `${cur?.label} approved → moved to ${next.label}` }],
    }));
    announce(fireEvent(tid, next, "Stage entered", { project: p.name, actor }));
  } else {
    patch(tid, p.id, (x) => ({
      ...x,
      status: "Completed",
      approval: null,
      history: [...x.history, { at: now(), role: actor, text: "Final stage approved — project closed" }],
    }));
  }
}

export function submitStage(tid: string, cfg: PreviewConfig, p: PProject, actor: string) {
  const stage = cfg.stages.find((s) => s.id === p.stageId);
  if (!stage) return;
  const blocking = p.tools.filter(
    (t) => t.locked && t.stageId === p.stageId && (t.status === "Not started" || t.status === "In progress" || t.status === "Returned"),
  );
  if (blocking.length) {
    toast.error(`Complete mandatory toolkit items first: ${blocking.map((b) => cfg.tools.find((t) => t.id === b.toolId)?.name).join(", ")}`);
    return;
  }
  const { wf } = stageWorkflow(stage.id, p.confidential);
  if (!wf || firstApprovalStep(wf) >= wf.steps.length) {
    toast.success(`${stage.label} submitted — no approval steps, advancing`);
    advance(tid, cfg, p, actor);
    return;
  }
  const stepIdx = firstApprovalStep(wf);
  const first = wf.steps[stepIdx];
  if (!first) return;
  const approverRole = first.assigneeRole;
  patch(tid, p.id, (x) => ({
    ...x,
    status: "Pending approval",
    approval: { workflowId: wf.id, stepIdx },
    history: [...x.history, { at: now(), role: actor, text: `Submitted ${stage.label} for approval (${wf.title} ${wf.version})` }],
  }));
  toast.success(`Submitted — waiting for ${approverRole}`);
  announce(fireEvent(tid, stage, "Submitted for approval", { project: p.name, actor, approverRole }));
}

export function actOnStage(
  tid: string,
  cfg: PreviewConfig,
  p: PProject,
  action: "approve" | "return" | "reject",
  actor: string,
  comment: string,
) {
  const stage = cfg.stages.find((s) => s.id === p.stageId);
  const wf = mockWorkflows.find((w) => w.id === p.approval?.workflowId);
  if (!stage || !wf || !p.approval) return;
  const step = wf.steps[p.approval.stepIdx];
  if (!step || step.assigneeRole !== actor) return;
  if (action === "approve") {
    const nextIdx = p.approval.stepIdx + 1;
    if (nextIdx < wf.steps.length) {
      const nextStep = wf.steps[nextIdx];
      if (!nextStep) return;
      const nextRole = nextStep.assigneeRole;
      patch(tid, p.id, (x) => ({
        ...x,
        approval: { workflowId: wf.id, stepIdx: nextIdx },
        history: [...x.history, { at: now(), role: actor, text: `Approved step ${step.order} (${step.name})${comment ? ` — ${comment}` : ""}` }],
      }));
      toast.success(`Step ${step.order} approved — next: ${nextRole}`);
      announce(fireEvent(tid, stage, "Submitted for approval", { project: p.name, actor, approverRole: nextRole }));
    } else {
      patch(tid, p.id, (x) => ({
        ...x,
        history: [...x.history, { at: now(), role: actor, text: `Approved final step ${step.order} (${step.name})` }],
      }));
      toast.success(`${stage.label} fully approved`);
      const updated = projectsStore.get(tid).find((x) => x.id === p.id);
      if (updated) advance(tid, cfg, updated, actor);
    }
    return;
  }
  const returned = action === "return";
  patch(tid, p.id, (x) => ({
    ...x,
    status: returned ? "Returned" : "Rejected",
    approval: null,
    history: [...x.history, { at: now(), role: actor, text: `${returned ? "Returned" : "Rejected"} at step ${step.order}${comment ? ` — ${comment}` : ""}` }],
  }));
  toast(returned ? "Returned to Project Manager" : "Rejected");
  announce(fireEvent(tid, stage, returned ? "Returned" : "Rejected", { project: p.name, actor, comment }));
}

/* ---- toolkit items ---- */

export function updateTool(tid: string, pid: string, toolId: string, fn: (t: AttachedTool) => AttachedTool) {
  patch(tid, pid, (x) => ({ ...x, tools: x.tools.map((t) => (t.toolId === toolId ? fn(t) : t)) }));
}

export function submitTool(tid: string, cfg: PreviewConfig, p: PProject, att: AttachedTool, actor: string) {
  const tool = cfg.tools.find((t) => t.id === att.toolId);
  if (!tool) return;
  const stage = cfg.stages.find((s) => s.id === att.stageId) ?? cfg.stages[0];
  if (!stage) return;
  const wf = tool.requiresApproval ? mockWorkflows.find((w) => w.id === tool.workflowId && w.status === "Enabled") : undefined;
  if (!wf) {
    updateTool(tid, p.id, att.toolId, (t) => ({ ...t, status: "Completed" }));
    toast.success(`${tool.name} marked complete`);
    return;
  }
  const stepIdx = firstApprovalStep(wf);
  const role = wf.steps[stepIdx]?.assigneeRole;
  updateTool(tid, p.id, att.toolId, (t) => ({ ...t, status: "Pending approval", approval: { workflowId: wf.id, stepIdx } }));
  toast.success(`${tool.name} submitted — waiting for ${role}`);
  announce(fireEvent(tid, stage, "Submitted for approval", { project: p.name, actor, approverRole: role, prefix: tool.name }));
}

export function actOnTool(
  tid: string,
  cfg: PreviewConfig,
  p: PProject,
  att: AttachedTool,
  action: "approve" | "return" | "reject",
  actor: string,
) {
  const tool = cfg.tools.find((t) => t.id === att.toolId);
  if (!tool) return;
  const stage = cfg.stages.find((s) => s.id === att.stageId) ?? cfg.stages[0];
  if (!stage) return;
  const wf = mockWorkflows.find((w) => w.id === att.approval?.workflowId);
  if (!wf || !att.approval || wf.steps[att.approval.stepIdx]?.assigneeRole !== actor) return;
  if (action === "approve") {
    const nextIdx = att.approval.stepIdx + 1;
    if (nextIdx < wf.steps.length) {
      const next = wf.steps[nextIdx];
      if (!next) return;
      const role = next.assigneeRole;
      updateTool(tid, p.id, att.toolId, (t) => ({ ...t, approval: { workflowId: wf.id, stepIdx: nextIdx } }));
      toast.success(`${tool.name}: next approver ${role}`);
      announce(fireEvent(tid, stage, "Submitted for approval", { project: p.name, actor, approverRole: role, prefix: tool.name }));
    } else {
      updateTool(tid, p.id, att.toolId, (t) => ({ ...t, status: "Approved", approval: null }));
      toast.success(`${tool.name} approved`);
      announce(fireEvent(tid, stage, "Approved", { project: p.name, actor, prefix: tool.name }));
    }
    return;
  }
  updateTool(tid, p.id, att.toolId, (t) => ({ ...t, status: "Returned", approval: null }));
  announce(fireEvent(tid, stage, action === "return" ? "Returned" : "Rejected", { project: p.name, actor, prefix: tool.name }));
}
