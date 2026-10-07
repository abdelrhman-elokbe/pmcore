import { useSyncExternalStore } from "react";
import {
  BarChart3,
  Briefcase,
  ClipboardCheck,
  FileSearch,
  Grid3x3,
  Scale,
  ShieldAlert,
  Users,
  type LucideIcon,
} from "lucide-react";
import { initialPhases } from "./data";

export type ToolMode = "Optional" | "Mandatory";

export type Tool = {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  category: "Analysis" | "Governance" | "Financial" | "Planning";
  icon: LucideIcon;
  status: "Active" | "Inactive";
  /** Which built-in config panel to show (FS / BC carry over legacy stage settings). */
  config: "feasibility" | "businessCase" | "generic";
  requiresApproval: boolean;
  workflowId: string | null;
  outputs: string[];
  allowedStages: string[];
  mode: ToolMode;
  mandatoryScope: { projectTypes: string[]; categories: string[] };
  defaultStage: string | null;
};

export const allStageOptions = initialPhases.flatMap((ph) => [
  { id: ph.id, label: ph.name, isSub: false },
  ...ph.stages.map((s) => ({ id: s.id, label: `${ph.name} › ${s.name}`, isSub: true })),
]);

export const stageLabel = (id: string | null) =>
  allStageOptions.find((s) => s.id === id)?.label ?? "—";

export const projectTypeOptions = [
  "Archaeological Projects",
  "Event Management",
  "Heritage and Cultural Infrastructure",
  "Product or Service Development (External)",
];
export const projectCategoryOptions = ["Strategic", "Operational", "Tactical", "Regulatory"];

const seed: Tool[] = [
  {
    id: "feasibility-study",
    name: "Feasibility Study",
    nameAr: "دراسة الجدوى",
    description: "Simplified or detailed assessment of legal, technical and organisational viability.",
    category: "Analysis",
    icon: FileSearch,
    status: "Active",
    config: "feasibility",
    requiresApproval: true,
    workflowId: "wf-standard-stage",
    outputs: ["FS report (PDF)", "Assessment scores"],
    allowedStages: ["initiation", "proposal"],
    mode: "Mandatory",
    mandatoryScope: { projectTypes: [], categories: ["Strategic"] },
    defaultStage: "initiation",
  },
  {
    id: "business-case",
    name: "Business Case",
    nameAr: "دراسة الحالة",
    description: "Internal or external business case with ROI, NPV and IRR financials.",
    category: "Financial",
    icon: Briefcase,
    status: "Active",
    config: "businessCase",
    requiresApproval: true,
    workflowId: "wf-standard-stage",
    outputs: ["Business case document", "Financial model (XLSX)"],
    allowedStages: ["initiation", "proposal"],
    mode: "Mandatory",
    mandatoryScope: { projectTypes: [], categories: [] },
    defaultStage: "initiation",
  },
  {
    id: "swot",
    name: "SWOT Analysis",
    nameAr: "تحليل SWOT",
    description: "Strengths, weaknesses, opportunities and threats matrix.",
    category: "Analysis",
    icon: Grid3x3,
    status: "Active",
    config: "generic",
    requiresApproval: false,
    workflowId: null,
    outputs: ["SWOT matrix"],
    allowedStages: ["initiation", "proposal", "execution"],
    mode: "Optional",
    mandatoryScope: { projectTypes: [], categories: [] },
    defaultStage: null,
  },
  {
    id: "raci",
    name: "RACI Matrix",
    nameAr: "مصفوفة RACI",
    description: "Responsible, accountable, consulted and informed per deliverable.",
    category: "Governance",
    icon: Users,
    status: "Active",
    config: "generic",
    requiresApproval: false,
    workflowId: null,
    outputs: ["RACI table"],
    allowedStages: ["execution-phase", "execution"],
    mode: "Optional",
    mandatoryScope: { projectTypes: [], categories: [] },
    defaultStage: null,
  },
  {
    id: "roi",
    name: "ROI Analysis",
    nameAr: "تحليل العائد على الاستثمار",
    description: "Return on investment calculation with payback period.",
    category: "Financial",
    icon: BarChart3,
    status: "Active",
    config: "generic",
    requiresApproval: false,
    workflowId: null,
    outputs: ["ROI summary"],
    allowedStages: ["initiation", "benefits"],
    mode: "Optional",
    mandatoryScope: { projectTypes: [], categories: [] },
    defaultStage: null,
  },
  {
    id: "risk-assessment",
    name: "Risk Assessment",
    nameAr: "تقييم المخاطر",
    description: "Initial risk register with likelihood and impact scoring.",
    category: "Governance",
    icon: ShieldAlert,
    status: "Active",
    config: "generic",
    requiresApproval: false,
    workflowId: null,
    outputs: ["Risk register"],
    allowedStages: ["initiation", "execution"],
    mode: "Optional",
    mandatoryScope: { projectTypes: [], categories: [] },
    defaultStage: null,
  },
  {
    id: "stakeholder",
    name: "Stakeholder Analysis",
    nameAr: "تحليل أصحاب المصلحة",
    description: "Power / interest mapping of internal and external stakeholders.",
    category: "Planning",
    icon: ClipboardCheck,
    status: "Inactive",
    config: "generic",
    requiresApproval: false,
    workflowId: null,
    outputs: ["Stakeholder map"],
    allowedStages: ["proposal"],
    mode: "Optional",
    mandatoryScope: { projectTypes: [], categories: [] },
    defaultStage: null,
  },
  {
    id: "cba",
    name: "Cost-Benefit Analysis",
    nameAr: "تحليل التكلفة والعائد",
    description: "Quantified costs versus expected benefits over the project life.",
    category: "Financial",
    icon: Scale,
    status: "Active",
    config: "generic",
    requiresApproval: false,
    workflowId: null,
    outputs: ["CBA report"],
    allowedStages: ["initiation", "closure-phase", "benefits"],
    mode: "Optional",
    mandatoryScope: { projectTypes: [], categories: [] },
    defaultStage: null,
  },
];

let tools: Tool[] = seed;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const toolkitStore = {
  get: () => tools,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  update: (id: string, patch: Partial<Tool>) => {
    tools = tools.map((t) => (t.id === id ? { ...t, ...patch } : t));
    emit();
  },
  add: (t: Tool) => {
    tools = [...tools, t];
    emit();
  },
};

export function useTools() {
  return useSyncExternalStore(toolkitStore.subscribe, toolkitStore.get, () => seed);
}

/** Mandatory tools defaulting to a stage + optional tools allowed there. */
export function toolsForStage(list: Tool[], stageId: string) {
  const active = list.filter((t) => t.status === "Active");
  return {
    mandatory: active.filter((t) => t.mode === "Mandatory" && t.defaultStage === stageId),
    optional: active.filter((t) => t.mode === "Optional" && t.allowedStages.includes(stageId)),
  };
}
