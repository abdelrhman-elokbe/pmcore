export type LookupItem = {
  id: number;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  active: boolean;
  usedBy?: number;
};

export type ExternalEntity = {
  id: number;
  code: string;
  name: string;
  nameAr?: string;
  companyType: string;
  category: "Public" | "Semi-Government" | "Private" | "Other Types";
  active: boolean;
  usedBy?: number;
};

export type HealthBand = {
  id: number;
  name: string;
  colour: string;
  from: number;
  to: number;
};

export type LookupCategoryId =
  | "categories"
  | "types"
  | "sources"
  | "benefit-types"
  | "external-entities"
  | "lessons-learned"
  | "health-score"
  | "fs-assessment-types";

export const lookupCategories: { id: LookupCategoryId; label: string; singular: string }[] = [
  { id: "categories", label: "Project Categories", singular: "Category" },
  { id: "types", label: "Project Types", singular: "Type" },
  { id: "sources", label: "Project Sources", singular: "Source" },
  { id: "benefit-types", label: "Benefit Types", singular: "Benefit Type" },
  { id: "external-entities", label: "External Entities", singular: "Entity" },
  { id: "lessons-learned", label: "Lessons Learned Configuration", singular: "Category" },
  { id: "health-score", label: "Health Score Configuration", singular: "Band" },
  { id: "fs-assessment-types", label: "FS Assessment Types", singular: "Assessment Type" },
];

export type TenantLookups = {
  categories: LookupItem[];
  types: LookupItem[];
  sources: LookupItem[];
  "benefit-types": LookupItem[];
  "lessons-learned": LookupItem[];
  "external-entities": ExternalEntity[];
  "health-score": HealthBand[];
};

const item = (
  id: number,
  name: string,
  description: string,
  extra: Partial<LookupItem> = {},
): LookupItem => ({ id, name, description, active: true, ...extra });

export const defaultHealthBands: HealthBand[] = [
  { id: 1, name: "Health Score < 31%", colour: "#FF6C6C", from: 0, to: 30 },
  { id: 2, name: "Health Score 31% – 50%", colour: "#E9A13B", from: 31, to: 50 },
  { id: 3, name: "Health Score > 50%", colour: "#58BD5C", from: 51, to: 100 },
];

const dcaa: TenantLookups = {
  categories: [
    item(1, "Strategic", "Projects delivering the entity strategy", { nameAr: "استراتيجي" }),
    item(2, "Operational", "Day-to-day operational improvement projects", { nameAr: "تشغيلي" }),
    item(3, "Tactical", "Short-term projects supporting annual plans", { nameAr: "تكتيكي" }),
    item(4, "Regulatory", "Projects mandated by regulation or policy", {
      nameAr: "تنظيمي",
      usedBy: 6,
    }),
  ],
  types: [
    item(1, "Archaeological Projects", "Excavation, conservation and archaeological site works"),
    item(
      2,
      "Documentation and Policy Development",
      "Development of policies, standards and documentation",
    ),
    item(3, "Event Management", "Planning and delivery of cultural events and festivals"),
    item(
      4,
      "Heritage and Cultural Infrastructure",
      "Construction and restoration of heritage and cultural assets",
      { usedBy: 12 },
    ),
    item(
      5,
      "Product or Service Development (External)",
      "New products or services delivered with external partners",
    ),
  ],
  sources: [
    item(1, "Idea", "Raised internally as an improvement idea"),
    item(2, "Dubai Plan", "Derived from the Dubai government plan"),
    item(3, "Departmental Strategic Planning", "Originating from departmental strategy cycles"),
    item(4, "Regulatory", "Required by a regulatory or legal obligation"),
  ],
  "benefit-types": [
    item(1, "Strategic", "Contribution to strategic objectives"),
    item(2, "Financial", "Revenue increase or cost reduction"),
    item(3, "Customer", "Improved customer experience or satisfaction"),
    item(4, "Employee", "Improved employee capability or satisfaction"),
    item(5, "Social", "Community and social value"),
    item(6, "Regulatory and Compliance", "Compliance with laws and regulations"),
    item(7, "Technological", "Technology capability and modernisation"),
    item(8, "Environmental", "Environmental and sustainability outcomes"),
  ],
  "lessons-learned": [
    item(1, "Requirements Management", "Lessons about capturing and managing requirements"),
    item(2, "Testing & Quality Assurance", "Lessons about testing coverage and quality gates"),
    item(3, "Documentation", "Lessons about project documentation completeness"),
  ],
  "external-entities": [
    {
      id: 1,
      code: "EE-001",
      name: "Dubai Municipality",
      nameAr: "بلدية دبي",
      companyType: "Government Authority",
      category: "Public",
      active: true,
      usedBy: 4,
    },
    {
      id: 2,
      code: "EE-002",
      name: "Emaar Properties",
      nameAr: "إعمار العقارية",
      companyType: "Contractor",
      category: "Private",
      active: true,
    },
  ],
  "health-score": defaultHealthBands,
};

const rda: TenantLookups = {
  categories: [
    item(1, "Strategic", "Projects delivering the authority strategy"),
    item(2, "Operational", "Operational improvement projects"),
    item(3, "Regulatory", "Projects mandated by regulation"),
  ],
  types: [
    item(1, "Infrastructure Development", "Roads, utilities and urban infrastructure works"),
    item(2, "Digital Transformation", "Digital platforms and automation projects", { usedBy: 9 }),
    item(3, "Urban Planning Studies", "Planning studies and master plan development"),
  ],
  sources: [
    item(1, "Project Request", "Raised through the project request intake form"),
    item(2, "Vision 2030", "Derived from national vision programmes"),
    item(3, "Regulatory", "Required by a regulatory obligation"),
  ],
  "benefit-types": [
    item(1, "Strategic", "Contribution to strategic objectives"),
    item(2, "Financial", "Revenue increase or cost reduction"),
    item(3, "Customer", "Improved beneficiary experience"),
    item(4, "Regulatory and Compliance", "Compliance with laws and regulations"),
  ],
  "lessons-learned": [
    item(1, "Procurement", "Lessons about tendering and vendor selection"),
    item(2, "Stakeholder Engagement", "Lessons about stakeholder alignment"),
  ],
  "external-entities": [
    {
      id: 1,
      code: "EE-101",
      name: "Royal Commission for Riyadh City",
      nameAr: "الهيئة الملكية لمدينة الرياض",
      companyType: "Government Authority",
      category: "Semi-Government",
      active: true,
      usedBy: 3,
    },
    {
      id: 2,
      code: "EE-102",
      name: "Saudi Consulting Services",
      nameAr: "الخدمات الاستشارية السعودية",
      companyType: "Consultancy",
      category: "Private",
      active: false,
    },
  ],
  "health-score": defaultHealthBands,
};

export const companyTypes = [
  "Government Authority",
  "Contractor",
  "Consultancy",
  "Supplier",
  "Academic",
];

export const entityCategories = ["Public", "Semi-Government", "Private", "Other Types"] as const;

const seeds: Record<string, TenantLookups> = { dcaa, rda };

export const getTenantLookups = (tenantId: string): TenantLookups =>
  structuredClone(seeds[tenantId] ?? seeds["dcaa"]!);
