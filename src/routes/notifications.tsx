import { createFileRoute } from "@tanstack/react-router";
import { BellRing } from "lucide-react";
import { SectionPlaceholder } from "@/components/layout/SectionPlaceholder";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | Blackstone Product 2.0" },
      {
        name: "description",
        content:
          "Configure notification events, channels, recipients, bilingual templates, quiet hours and reminder cadence.",
      },
      { property: "og:title", content: "Notifications | Blackstone Product 2.0" },
      { property: "og:description", content: "Event-driven notification configuration per tenant." },
    ],
  }),
  component: () => (
    <SectionPlaceholder
      title="Notifications"
      subtitle="Events, channels, recipients and bilingual templates with variables, previews and test sends."
      icon={BellRing}
      items={[
        "Event table: submitted, approved, returned, rejected, SLA breach…",
        "Channels: in-app, email, SMS",
        "Recipients by role, dynamic role or specific user",
        "Bilingual rich-text templates with {{variables}}",
        "Quiet hours and reminder cadence",
        "Preview and send test",
      ]}
    />
  ),
});
