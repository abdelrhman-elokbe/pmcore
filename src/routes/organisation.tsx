import { createFileRoute } from "@tanstack/react-router";
import { Network } from "lucide-react";
import { SectionPlaceholder } from "@/components/layout/SectionPlaceholder";

export const Route = createFileRoute("/organisation")({
  head: () => ({
    meta: [
      { title: "Organisation | Blackstone Product 2.0" },
      {
        name: "description",
        content:
          "Configure organisation depth, level labels, group tree, manager fallback chains and reorganisation policy.",
      },
      { property: "og:title", content: "Organisation | Blackstone Product 2.0" },
      { property: "og:description", content: "Organisation hierarchy and group management." },
    ],
  }),
  component: () => (
    <SectionPlaceholder
      title="Organisation"
      subtitle="Hierarchy depth, level labels, group tree, manager fallbacks and reorganisation policy."
      icon={Network}
      items={[
        "Configurable depth (2–6 levels) with per-level labels",
        "Group tree: code, name EN/AR, level, parent, manager, members",
        "Manager fallback chain when a group has no manager",
        "Multi-group membership with a primary group",
        "Reorganisation policy with affected-record warning",
        "CSV import / export of the full hierarchy",
      ]}
    />
  ),
});
