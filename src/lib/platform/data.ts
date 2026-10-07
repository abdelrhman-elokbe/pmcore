export type TenantStatus = "Active" | "Suspended" | "Onboarding";

export type Tenant = {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  region: string;
  timezone: string;
  products: string[];
  users: { active: number; max: number };
  licenseExpiry: string;
  licenseDaysLeft: number;
  status: TenantStatus;
  lastPublish: string;
  currency: string;
  language: "English" | "Arabic";
  rtl: boolean;
  orgGroups: number;
  orgLevels: string[];
  intakeLabel: string;
  atRiskEnabled: boolean;
  benefitsEnabled: boolean;
  lessonsLearnedEnabled: boolean;
  lifecycle: string[];
  primaryColor: string;
};

export const tenants: Tenant[] = [
  {
    id: "dcaa",
    name: "Dubai Culture (DCAA)",
    nameAr: "دبي للثقافة",
    code: "DCAA",
    region: "United Arab Emirates",
    timezone: "Asia/Dubai (GMT+4)",
    products: ["Project Core"],
    users: { active: 214, max: 300 },
    licenseExpiry: "12/03/2027",
    licenseDaysLeft: 185,
    status: "Active",
    lastPublish: "02/09/2026 · v14",
    currency: "AED",
    language: "Arabic",
    rtl: true,
    orgGroups: 88,
    orgLevels: ["Entity", "Sector", "Department", "Team"],
    intakeLabel: "Proposal",
    atRiskEnabled: false,
    benefitsEnabled: true,
    lessonsLearnedEnabled: true,
    lifecycle: [
      "Proposal",
      "Feasibility Study (Simplified | Full)",
      "Business Case (Internal | External)",
      "Execution",
      "Closure",
      "Benefit Realization",
    ],
    primaryColor: "#6d3ff5",
  },
  {
    id: "rda",
    name: "Riyadh Development Authority",
    nameAr: "هيئة تطوير الرياض",
    code: "RDA",
    region: "Saudi Arabia",
    timezone: "Asia/Riyadh (GMT+3)",
    products: ["Project Core", "Task Core"],
    users: { active: 93, max: 250 },
    licenseExpiry: "21/09/2026",
    licenseDaysLeft: 13,
    status: "Active",
    lastPublish: "05/09/2026 · v7",
    currency: "SAR",
    language: "English",
    rtl: false,
    orgGroups: 41,
    orgLevels: ["Entity", "Business Unit", "Department"],
    intakeLabel: "Project Request",
    atRiskEnabled: true,
    benefitsEnabled: false,
    lessonsLearnedEnabled: true,
    lifecycle: ["Project Request", "Business Case", "Execution", "Closure", "Post-Review"],
    primaryColor: "#0f9d8f",
  },
];

export const getTenant = (id: string) => tenants.find((t) => t.id === id) ?? tenants[0]!;

export type LicenceCard = {
  product: string;
  tenant: string;
  status: "Active" | "Trial" | "Suspended";
  daysLeft: number;
  total: number;
};

export const licenceCards: LicenceCard[] = [
  { product: "Project Core", tenant: "Dubai Culture (DCAA)", status: "Active", daysLeft: 185, total: 365 },
  { product: "Project Core", tenant: "Riyadh Development Authority", status: "Active", daysLeft: 13, total: 365 },
  { product: "Task Core", tenant: "Riyadh Development Authority", status: "Active", daysLeft: 5, total: 180 },
  { product: "Committee Core", tenant: "Dubai Culture (DCAA)", status: "Trial", daysLeft: 27, total: 90 },
  { product: "Performance Core", tenant: "Dubai Culture (DCAA)", status: "Active", daysLeft: 140, total: 365 },
  { product: "Task Core", tenant: "Dubai Culture (DCAA)", status: "Suspended", daysLeft: 0, total: 365 },
];

export type ConfigChange = {
  actor: string;
  action: string;
  tenant: string;
  time: string;
  section: string;
};

export const recentChanges: ConfigChange[] = [
  {
    actor: "admin",
    action: "Moved Feasibility Study & Business Case into Project Toolkit (mandatory)",
    tenant: "Dubai Culture (DCAA)",
    time: "08/09/2026 11:05 · 5 mins ago",
    section: "Project Toolkit",
  },
  {
    actor: "s.almansoori",
    action: "Added stage notification “Submitted for approval” on Proposal",
    tenant: "Dubai Culture (DCAA)",
    time: "08/09/2026 10:58 · 12 mins ago",
    section: "Lifecycle",
  },
  {
    actor: "s.almansoori",
    action: "Disabled project status “At Risk”",
    tenant: "Dubai Culture (DCAA)",
    time: "08/09/2026 10:42 · 20 mins ago",
    section: "Business Rules",
  },
  {
    actor: "admin",
    action: "Assigned workflow “PC Stage Approval v3” to Business Case",
    tenant: "Riyadh Development Authority",
    time: "08/09/2026 09:15 · 2 hours ago",
    section: "Lifecycle",
  },
  {
    actor: "m.tarek",
    action: "Renamed term “Proposal” → “Project Request”",
    tenant: "Riyadh Development Authority",
    time: "07/09/2026 16:04 · 1 day ago",
    section: "Lookups & Terminology",
  },
  {
    actor: "admin",
    action: "Turned off Benefits Realization (5 dependent items)",
    tenant: "Riyadh Development Authority",
    time: "07/09/2026 13:30 · 1 day ago",
    section: "Features",
  },
  {
    actor: "n.hassan",
    action: "Extended licence to 12/03/2027",
    tenant: "Dubai Culture (DCAA)",
    time: "05/09/2026 08:55 · 3 days ago",
    section: "Tenants & Licensing",
  },
];

export const platformProducts = [
  "Project Core",
  "Task Core",
  "Committee Core",
  "Performance Core",
] as const;
