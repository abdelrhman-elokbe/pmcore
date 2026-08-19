import {
  BarChart3,
  FileBarChart,
  GitPullRequest,
  LayoutGrid,
  Shield,
  UserCog,
  Users,
  Briefcase,
  Wrench,
} from "lucide-react";

export type Stage = {
  id: string;
  name: string;
  nameAr: string;
  meta: string;
  mandatory: boolean;
  steps: number;
  enabled: boolean;
  config: "feasibility" | "execution" | "closure" | "generic";
};

export const initialStages: Stage[] = [
  {
    id: "initiation",
    name: "Initiation",
    nameAr: "التدشين",
    meta: "Project profile · Sponsor & PM assignment",
    mandatory: true,
    steps: 3,
    enabled: true,
    config: "generic",
  },
  {
    id: "feasibility",
    name: "Feasibility Study",
    nameAr: "دراسة الجدوى",
    meta: "Simplified / detailed assessments",
    mandatory: false,
    steps: 4,
    enabled: true,
    config: "feasibility",
  },
  {
    id: "planning",
    name: "Planning",
    nameAr: "التخطيط",
    meta: "Phases, budget baseline, schedule",
    mandatory: true,
    steps: 5,
    enabled: true,
    config: "generic",
  },
  {
    id: "execution",
    name: "Execution",
    nameAr: "التنفيذ",
    meta: "Phases · Milestones · Deliverables · Tasks",
    mandatory: true,
    steps: 6,
    enabled: true,
    config: "execution",
  },
  {
    id: "closure",
    name: "Closure",
    nameAr: "الإغلاق",
    meta: "Prerequisites, lessons learned, sign-off",
    mandatory: true,
    steps: 4,
    enabled: true,
    config: "closure",
  },
  {
    id: "benefits",
    name: "Benefits Realization",
    nameAr: "تحقيق المنافع",
    meta: "KPI linkage · post-implementation review",
    mandatory: false,
    steps: 2,
    enabled: false,
    config: "generic",
  },
];

export const entryCriteria = [
  "Previous stage must be fully approved",
  "PM must be assigned",
  "Sponsor must be assigned",
  "Budget must be set",
  "Minimum 1 phase defined",
];

export const exitCriteria = [
  "PMO approval obtained",
  "All required fields completed",
  "All deliverables accepted",
  "Budget matches invoices",
  "All risks resolved",
  "All benefits linked to KPIs",
];

export const businessRules = [
  { label: "Who can create this stage", options: ["PM", "PMO", "Platform Admin", "Sponsor"] },
  { label: "Who can edit fields", options: ["PM", "PM + PMO", "PMO only", "Platform Admin"] },
  { label: "Who can submit for approval", options: ["PM", "PMO", "PM + Sponsor"] },
  { label: "Can this stage be skipped", options: ["No", "Yes, with PMO approval", "Yes"] },
];

export const approvalChain = [
  { name: "PM submission", role: "Assignee: Project Manager" },
  { name: "PMO review", role: "Assignee: PMO Officer" },
  { name: "Sponsor endorsement", role: "Assignee: Project Sponsor" },
  { name: "Portfolio committee", role: "Assignee: Committee Chair" },
];

export const confidentialChain = [
  { name: "Confidential PMO review", role: "Assignee: Confidential PMO" },
  { name: "Executive approval", role: "Assignee: Executive Director" },
];

export type FeatureSection = {
  id: string;
  title: string;
  icon: typeof BarChart3;
  tone: string;
  items: { name: string; enabled: boolean }[];
};

const on = (names: string[], offIdx: number[] = []) =>
  names.map((name, i) => ({ name, enabled: !offIdx.includes(i) }));

export const initialFeatureSections: FeatureSection[] = [
  {
    id: "dashboard",
    title: "PMO Dashboard",
    icon: LayoutGrid,
    tone: "text-primary bg-primary-soft",
    items: on(
      [
        "Portfolio Summary KPIs",
        "Project Progress",
        "Risk Management",
        "Budget Management",
        "Benefits Realization",
        "Deliverables Management",
        "Project Health Score",
      ],
      [4],
    ),
  },
  {
    id: "reports",
    title: "PMO Reports Center",
    icon: FileBarChart,
    tone: "text-teal bg-teal-soft",
    items: on(
      [
        "Dynamic Projects",
        "Strategic Objectives",
        "Portfolio Risks",
        "Initiation Status",
        "Benefits",
        "Deliverables",
        "Health Score",
        "Progress",
        "Budget Variation",
        "Change Requests",
        "Invoices",
      ],
      [1, 8],
    ),
  },
  {
    id: "cr",
    title: "Change requests",
    icon: GitPullRequest,
    tone: "text-warning bg-warning-soft",
    items: on([
      "Project Profile",
      "Ownership and Strategic Impact",
      "Schedule",
      "Scope",
      "Cost",
      "Benefits",
    ]),
  },
  {
    id: "project",
    title: "Project features",
    icon: BarChart3,
    tone: "text-success bg-success-soft",
    items: on(
      [
        "Health score system",
        "Lessons learned hub",
        "Risk management",
        "Invoice management",
        "Delegation / DPM",
        "Gantt chart",
        "Execution data export",
        "Schedule dependencies",
      ],
      [6],
    ),
  },
];

export type Role = {
  id: string;
  name: string;
  users: number;
  purpose: string;
  icon: typeof Shield;
  tone: string;
  override: boolean;
  matrix: Record<string, boolean[]>;
};

const perms = (rows: number[][]) => {
  const features = [
    "PMO Dashboard",
    "Projects",
    "Change requests",
    "Risk management",
    "PMO Reports",
    "Configurations",
  ];
  const out: Record<string, boolean[]> = {};
  features.forEach((f, i) => {
    out[f] = (rows[i] ?? [0, 0, 0, 0, 0, 0]).map(Boolean);
  });
  return out;
};

export const permissionColumns = ["View", "Create", "Edit", "Approve", "Delete", "Export"];

export const initialRoles: Role[] = [
  {
    id: "platform-admin",
    name: "Platform Admin",
    users: 3,
    purpose: "3 users · Full platform configuration",
    icon: Shield,
    tone: "text-primary bg-primary-soft",
    override: true,
    matrix: perms([
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1],
    ]),
  },
  {
    id: "pmo",
    name: "PMO Officer",
    users: 12,
    purpose: "12 users · Portfolio governance & approvals",
    icon: UserCog,
    tone: "text-teal bg-teal-soft",
    override: false,
    matrix: perms([
      [1, 0, 1, 1, 0, 1],
      [1, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 0, 1],
      [1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0],
    ]),
  },
  {
    id: "pm",
    name: "Project Manager",
    users: 46,
    purpose: "46 users · Day-to-day project delivery",
    icon: Briefcase,
    tone: "text-secondary bg-secondary-soft",
    override: false,
    matrix: perms([
      [1, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 0, 1],
      [1, 1, 1, 0, 0, 1],
      [1, 1, 1, 0, 1, 1],
      [1, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0],
    ]),
  },
  {
    id: "sponsor",
    name: "Project Sponsor",
    users: 18,
    purpose: "18 users · Endorsement & oversight",
    icon: Users,
    tone: "text-warning bg-warning-soft",
    override: false,
    matrix: perms([
      [1, 0, 0, 1, 0, 1],
      [1, 0, 0, 1, 0, 1],
      [1, 0, 0, 1, 0, 0],
      [1, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0],
    ]),
  },
  {
    id: "viewer",
    name: "Executive Viewer",
    users: 9,
    purpose: "9 users · Read-only portfolio insight",
    icon: BarChart3,
    tone: "text-success bg-success-soft",
    override: false,
    matrix: perms([
      [1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0],
    ]),
  },
  {
    id: "support",
    name: "Technical Support",
    users: 5,
    purpose: "5 users · Troubleshooting & data fixes",
    icon: Wrench,
    tone: "text-muted-foreground bg-muted",
    override: false,
    matrix: perms([
      [1, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 0, 0],
      [1, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0],
    ]),
  },
];

export const permissionFeatures = [
  "PMO Dashboard",
  "Projects",
  "Change requests",
  "Risk management",
  "PMO Reports",
  "Configurations",
];
