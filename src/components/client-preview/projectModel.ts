import { featureOn, type PProject, type PreviewConfig } from './engine';
import { isBudgeted, nonBudgetedAllowed } from './budget';

/** The execution boundary follows enabled stages, never a hard-coded proposal id. */
export function executionIndex(cfg: PreviewConfig) {
  return cfg.stages.findIndex((s) => s.config === 'execution' || s.phaseId === 'execution-phase');
}
export function isProposal(cfg: PreviewConfig, p: PProject) {
  if (p.status === 'Completed') return false;
  const index = cfg.stages.findIndex((s) => s.id === p.stageId);
  const boundary = executionIndex(cfg);
  if (index < 0) return cfg.disabledStages.some((s) => s.id === p.stageId && s.phaseId === 'initiation');
  return boundary < 0 ? cfg.stages[index]?.phaseId === 'initiation' : index < boundary;
}
export function stageTabs(cfg: PreviewConfig, hasTools: boolean, p?: Pick<PProject, 'budgetApplicability' | 'budget'>) {
  return ['Dashboard', 'Charter', 'Schedule', 'Deliverables', 'Cost', 'Risks', 'Benefits', 'Documents', 'Comments', 'Change Requests', ...(hasTools ? ['Toolkit'] : [])].filter((tab) => {
    if (tab === 'Cost') return !p || isBudgeted(p);
    if (tab === 'Change Requests') return featureOn(cfg.features, 'cr');
    if (tab === 'Risks') return featureOn(cfg.features, 'project', 'Risk management');
    if (tab === 'Schedule') return featureOn(cfg.features, 'project', 'Gantt chart');
    if (tab === 'Benefits') return featureOn(cfg.features, 'cr', 'Benefits');
    return true;
  });
}
export const proposalFields = [
  { key: 'Project name', label: 'Project Title', step: 0 },
  { key: 'Type', label: 'Project Type', step: 0, lookup: 'types' },
  { key: 'Description', label: 'Description', step: 0 },
  { key: 'Category', label: 'Project Classification', step: 0, lookup: 'categories' },
  { key: 'Source', label: 'Source', step: 0, lookup: 'sources' },
  { key: 'Rationale', label: 'Rationale', step: 0 },
  { key: 'Objective', label: 'Strategic Objective', step: 1 },
  { key: 'Strategic KPIs', label: 'Strategic KPIs', step: 1 },
  { key: 'In scope', label: 'In Scope', step: 1 },
  { key: 'Out of scope', label: 'Out of Scope', step: 1 },
  { key: 'Budget', label: 'Project Budget', step: 2 },
  { key: 'Risks', label: 'Key Risk', step: 3 },
  { key: 'Benefits', label: 'Expected Benefit', step: 3, lookup: 'benefit-types' },
] as const;
export const PLANNING_STEP = 2;
/** Budget question keys stored in the wizard values. */
export const BUDGET_Q = 'BudgetApplicability';
export const BUDGET_REASON = 'NoBudgetReason';
export function missingProposalFields(cfg: PreviewConfig, values: Record<string, string>, step?: number) {
  const asked = nonBudgetedAllowed(cfg, values['Type'] ?? '');
  const notBudgeted = asked && values[BUDGET_Q] === 'NotBudgeted';
  const missing = proposalFields.filter((f) => cfg.proposal.required[f.key] && !(f.key === 'Budget' && notBudgeted) && (step === undefined || f.step === step) && !values[f.key]?.trim()).map((f) => f.label);
  if (asked && (step === undefined || step === PLANNING_STEP)) {
    if (!values[BUDGET_Q]) missing.unshift('Does this project have a dedicated budget?');
    else if (notBudgeted && !values[BUDGET_REASON]) missing.push('Reason');
  }
  return missing;
}
