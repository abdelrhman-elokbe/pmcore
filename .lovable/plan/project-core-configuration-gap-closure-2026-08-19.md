# Project Core configuration — gap closure

Refinements only. The existing shell, navigation, look and feel stay untouched.

## 1. Stages — per-stage config tabs

Today only Feasibility, Execution and Closure have Stage config content, and the stage list has no Proposal or Business Case rows. Add those two stages to the list (Proposal after Initiation, Business Case after Feasibility Study) and give each stage its own Stage config tab content:

- **Proposal** — "Required fields" list with one toggle per field (Project name, Description, Rationale, Objective, In scope, Out of scope, Category, Type, Source, Budget, Strategic KPIs, Risks, Benefits), then a single "Confidential projects allowed" toggle.
- **Feasibility Study** — "FS types available": Simplified and Detailed checkboxes side by side, plus muted note "Assessment types and parameters are managed from Configurations → FS Assessment Types."
- **Business Case** — "BC types available": Internal and External checkboxes; "Required financial fields" with mandatory/optional toggles for ROI, NPV, IRR.
- **Execution** — three blocks: Schedule components (Phases, Milestones, Deliverables, Tasks toggles); Change request types (6 checkboxes); Health score deduction rules (11 named rules, each with a number input for its deduction points, pre-filled with the given defaults).
- **Benefits Realization** — PMO validation required toggle, KPI update frequency dropdown (Monthly / Quarterly / Custom), Realization period in months number input.
- Closure keeps its current content.

## 2. Features

- Add a fifth collapsible section, "PM Dashboard", with a single row: "PM Dashboard — Enable or disable the PM Dashboard for this client."
- Confirm/strengthen the off-state styling: a row whose toggle is off drops to ~40% opacity with muted text.

## 3. Roles & permissions

- Make "Module override ability" per-role: the toggle reads and writes the selected role's own value (Platform Admin ON, others OFF).
- "New role" opens a slide-in right panel (sheet, not a modal) containing: role name English, role name Arabic (RTL), description textarea, module override toggle, and an empty permissions matrix with the same six columns, all unchecked. Saving adds the role card to the grid.

## 4. Configurations

- Health score defaults become Green 80% and Yellow 50%. The Red row stays disabled and shows the explanatory text instead of a value.
- New section **FS Assessment Types**, placed between Organisational structure and Health score thresholds:
  - Three-level inline tree: assessment type → categories → parameters. Each level has a name, an Active/Inactive toggle, and expands inline on click. Parameters also have an info-tooltip text field.
  - Names are edited in place: click the name, edit, Enter or blur to save.
  - Deleting an item that is marked as in-use shows an inline warning: "This item is used in existing data. Deactivate it instead of deleting."
  - "Add assessment type" button with a dashed border at the bottom of the list.
  - Seeded with Legal Assessment (Regulatory and Compliance, Governance and Ownership, Innovation and Technology), Technical Assessment (Technology Readiness, Architecture and Security, Data Management), Organisational Assessment (Stakeholder Engagement, Operational Readiness, Strategic Alignment), each category carrying a few sample parameters.

## Technical notes

- All new data (stage config defaults, deduction rules, assessment type tree, PM Dashboard section) goes into `src/components/project-core/data.ts`; the `Stage.config` union grows to include `proposal`, `businessCase` and `benefits`.
- Stage config panels get a small per-stage component set inside `StagesScreen.tsx` (or a new `StageConfigPanels.tsx` if it grows past ~150 lines).
- FS Assessment Types lives in a new `AssessmentTypesSection.tsx` used by `ConfigurationsScreen.tsx`.
- The new-role slide-in uses the existing shadcn `Sheet` primitive; state stays local to `RolesScreen.tsx`.
- Everything remains client-side mock state with the existing Save toast; no backend work.
