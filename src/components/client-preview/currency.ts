import type { PProject, PreviewConfig } from './engine';

/** Fixed currency list with built-in rates (1 unit = N AED). */
export const CURRENCIES = ['AED', 'SAR', 'USD', 'EUR', 'GBP'] as const;
export const RATES_TO_AED: Record<string, number> = { AED: 1, SAR: 0.9793, USD: 3.6725, EUR: 4.0, GBP: 4.65 };

export function convert(amount: number, from: string, to: string) {
  if (from === to) return amount;
  const a = RATES_TO_AED[from], b = RATES_TO_AED[to];
  if (!a || !b) return amount;
  return Math.round((amount * a) / b);
}

/** A project's currency, defaulting to the tenant's main currency. */
export const projectCurrency = (p: Pick<PProject, 'currency'>, cfg: PreviewConfig) => p.currency ?? cfg.tenant.currency;

/** Approving a change request that carries newCurrency switches the project currency (amounts unchanged). */
export function approveChangeRequest(p: PProject, crId: string): PProject {
  const cr = p.changeRequests?.find((c) => c.id === crId);
  if (!cr) return p;
  return {
    ...p,
    ...(cr.newCurrency ? { currency: cr.newCurrency } : {}),
    changeRequests: p.changeRequests!.map((c) => (c.id === crId ? { ...c, status: 'Approved' } : c)),
  };
}
