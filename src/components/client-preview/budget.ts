import { convert, projectCurrency } from './currency';
import { fmtMoney, type PProject, type PreviewConfig, type ProjectPhase } from './engine';

export const NOT_BUDGETED = { en: 'Not Budgeted', ar: 'غير مخصص له ميزانية' } as const;

/** A project counts as budgeted only when explicitly declared so with a real amount. */
export const isBudgeted = (p: Pick<PProject, 'budgetApplicability' | 'budget'>) =>
  p.budgetApplicability !== 'NotBudgeted' && p.budget !== null;

export function budgetLabel(p: Pick<PProject, 'budgetApplicability' | 'budget' | 'currency'>, cfg: PreviewConfig, ar = false) {
  if (!isBudgeted(p)) return p.budgetApplicability === null ? '—' : ar ? NOT_BUDGETED.ar : NOT_BUDGETED.en;
  return fmtMoney(p.budget ?? 0, projectCurrency(p, cfg), cfg.branding.numberFormat);
}
/** Budget in the tenant main currency (null when Not Budgeted). */
export function baseBudget(p: PProject, cfg: PreviewConfig) {
  return isBudgeted(p) ? convert(p.budget ?? 0, projectCurrency(p, cfg), cfg.tenant.currency) : null;
}
/** e.g. "USD 500,000 (≈ AED 1,836,250)" when the project uses a foreign currency. */
export function budgetWithBase(p: PProject, cfg: PreviewConfig, ar = false) {
  const label = budgetLabel(p, cfg, ar); const base = baseBudget(p, cfg);
  return base !== null && projectCurrency(p, cfg) !== cfg.tenant.currency ? `${label} (≈ ${fmtMoney(base, cfg.tenant.currency, cfg.branding.numberFormat)})` : label;
}

/** Tenant allows non-budgeted projects for this type (empty limit = all types). */
export function nonBudgetedAllowed(cfg: PreviewConfig, type: string) {
  const { allowNonBudgeted, nonBudgetedTypes } = cfg.proposal;
  return allowNonBudgeted && (nonBudgetedTypes.length === 0 || nonBudgetedTypes.includes(type));
}

/** Returns an error when phase budgets exceed the project budget; never runs for Not Budgeted. */
export function phaseBudgetError(applicability: PProject['budgetApplicability'], budget: number | null, phases: ProjectPhase[]) {
  if (applicability === 'NotBudgeted' || budget === null) return null;
  const sum = phases.reduce((n, ph) => n + (ph.budget ?? 0), 0);
  return sum > budget ? `Phase budgets (${sum.toLocaleString()}) exceed the project budget (${budget.toLocaleString()})` : null;
}

/** Yes → No: clears the project budget and every phase budget. */
export function clearBudget<T extends { budget: number | null; phases: ProjectPhase[] }>(draft: T): T {
  return { ...draft, budget: null, phases: draft.phases.map(({ budget: _b, ...ph }) => ph) };
}
export const hasAnyBudget = (budget: number | null, phases: ProjectPhase[]) => (budget ?? 0) > 0 || phases.some((ph) => (ph.budget ?? 0) > 0);

/** Financial figures exclude Not Budgeted projects. */
export function financials(list: PProject[], cfg?: PreviewConfig) {
  const budgeted = list.filter(isBudgeted);
  const total = budgeted.reduce((n, p) => n + (cfg ? baseBudget(p, cfg) ?? 0 : p.budget ?? 0), 0);
  const converted = cfg ? budgeted.some((p) => projectCurrency(p, cfg) !== cfg.tenant.currency) : false;
  return { budgeted, total, spent: Math.round(total * 0.62), excluded: list.length - budgeted.length, converted };
}
export function budgetTag(p: PProject): 'Over budget' | 'Under budget' | 'On budget' | null {
  if (!isBudgeted(p)) return null;
  return p.health < 30 ? 'Over budget' : p.health > 80 ? 'Under budget' : 'On budget';
}

/* ---------------- CSV export ---------------- */
export function toCsv(rows: (string | number)[][]) {
  return rows.map((r) => r.map((c) => { const v = String(c); return /[",\n]/.test(v) ? `"${v.replaceAll('"', '""')}"` : v; }).join(',')).join('\n');
}
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const blob = new Blob(['\uFEFF' + toCsv(rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function projectCsvRows(cfg: PreviewConfig, list: PProject[]) {
  return [
    ['Project ID', 'Project Title', 'Type', 'Stage', 'Status', 'Budget', 'Currency', `Budget (${cfg.tenant.currency})`, 'No-Budget Reason', 'Project Manager'],
    ...list.map((p) => [p.code, p.name, p.type, cfg.stages.find((s) => s.id === p.stageId)?.label ?? p.stageId, p.status, budgetLabel(p, cfg), isBudgeted(p) ? projectCurrency(p, cfg) : '', baseBudget(p, cfg) ?? 'Not Budgeted', p.noBudgetReason ?? '', p.pm]),
  ];
}
