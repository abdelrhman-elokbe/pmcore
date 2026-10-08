import { createFileRoute } from "@tanstack/react-router";
import { History } from "lucide-react";
import { SectionPlaceholder } from "@/components/layout/SectionPlaceholder";

export const Route = createFileRoute("/change-log")({
  head: () => ({
    meta: [
      { title: "Change Log & Publishing | Blackstone Product 2.0" },
      {
        name: "description",
        content:
          "Draft changesets, grouped diffs, impact analysis, scheduled publishing, version history with rollback and an exportable audit trail.",
      },
      { property: "og:title", content: "Change Log & Publishing | Blackstone Product 2.0" },
      { property: "og:description", content: "Configuration governance: review, publish, roll back." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <SectionPlaceholder
      title="Change Log & Publishing"
      subtitle="Every edit lands in a draft changeset that is reviewed, impact-checked and published."
      icon={History}
      items={[
        "Draft changeset with pending change count",
        "Review & Publish: grouped Before → After diff",
        "Impact analysis and apply-to choice per item",
        "Effective date, approver and publish note",
        "Version history with full diff and rollback",
        "Audit trail and blueprint export / import",
      ]}
    />
  ),
});
