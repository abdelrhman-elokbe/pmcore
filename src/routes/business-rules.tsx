import { createFileRoute } from "@tanstack/react-router";
import { Scale } from "lucide-react";
import { SectionPlaceholder } from "@/components/layout/SectionPlaceholder";

export const Route = createFileRoute("/business-rules")({
  head: () => ({
    meta: [
      { title: "Business Rules | Blackstone Product 2.0" },
      {
        name: "description",
        content:
          "Derivation engine for project status, budget variance, health score, risk matrix, deliverables, benefits, closure prerequisites and numbering.",
      },
      { property: "og:title", content: "Business Rules | Blackstone Product 2.0" },
      { property: "og:description", content: "Turn hard-coded product logic into configuration." },
    ],
  }),
  component: () => (
    <SectionPlaceholder
      title="Business Rules"
      subtitle="The derivation engine: status rules, variance formulas, health scoring, risk matrix and closure prerequisites."
      icon={Scale}
      items={[
        "Project status set with derivation rules and live preview",
        "Budget variance formula and thresholds",
        "Health score deductions, bonuses, weights and bands",
        "Risk impact × likelihood matrix",
        "Deliverable and benefit rules",
        "Closure prerequisites, project ID numbering, fiscal calendar",
      ]}
    />
  ),
});
