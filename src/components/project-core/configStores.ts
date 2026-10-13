import { createTenantStore } from "@/lib/platform/tenantStore";
import {
  initialFeatureSections,
  initialPhases,
  initialRoles,
  proposalRequiredFields,
  type FeatureSection,
  type Phase,
  type Role,
} from "./data";
import { getTenantLookups } from "./lookupsData";
import { getSeedRules, type NotificationRule } from "./notificationsData";
import { getTenant } from "@/lib/platform/data";

export const phasesStore = createTenantStore<Phase[]>(() =>
  initialPhases.map((ph) => ({ ...ph, stages: ph.stages.map((s) => ({ ...s })) })),
);

export type FeaturesState = { sections: FeatureSection[]; enabled: Record<string, boolean> };
export const featuresStore = createTenantStore<FeaturesState>(() => ({
  sections: initialFeatureSections.map((s) => ({ ...s, items: s.items.map((i) => ({ ...i })) })),
  enabled: Object.fromEntries(initialFeatureSections.map((s) => [s.id, true])),
}));

export const rolesStore = createTenantStore<Role[]>(() =>
  initialRoles.map((r) => ({
    ...r,
    matrix: Object.fromEntries(Object.entries(r.matrix).map(([k, v]) => [k, [...v]])),
  })),
);

export const lookupsStore = createTenantStore((tid) => getTenantLookups(tid));

export type ScopeRules = { rules: NotificationRule[]; inherit: boolean };
export const notifRulesStore = createTenantStore<Record<string, ScopeRules>>(() => ({}));
export const scopeRules = (
  all: Record<string, ScopeRules>,
  scopeId: string,
  isSub: boolean,
): ScopeRules =>
  all[scopeId] ?? {
    rules: getSeedRules(scopeId),
    inherit: isSub && getSeedRules(scopeId).length === 0,
  };

export type ProposalSettings = {
  required: Record<string, boolean>;
  confidential: boolean;
  /** Proposal stage: allow projects without a dedicated budget. */
  allowNonBudgeted: boolean;
  /** Empty = all project types. */
  nonBudgetedTypes: string[];
};
export const proposalStore = createTenantStore<ProposalSettings>((tid) => ({
  required: Object.fromEntries(proposalRequiredFields.map((f) => [f, true])),
  confidential: true,
  allowNonBudgeted: tid === "rda",
  nonBudgetedTypes: [],
}));

export type BrandingSettings = {
  nameEn: string;
  nameAr: string;
  dateFormat: string;
  numberFormat: string;
};
export const brandingStore = createTenantStore<BrandingSettings>((tid) => ({
  nameEn: tid === "dcaa" ? "Dubai Culture Project Core" : `${getTenant(tid).code} Project Core`,
  nameAr: "بلاك ستون لإدارة المشاريع",
  dateFormat: "DD/MM/YYYY",
  numberFormat: "1,234.56",
}));
