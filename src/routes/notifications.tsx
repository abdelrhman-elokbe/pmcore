import { createFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { RuleCard } from "@/components/project-core/NotificationRules";
import { globalDefaultRules } from "@/components/project-core/notificationsData";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | Blackstone Product 2.0" },
      {
        name: "description",
        content: "Tenant-wide default notification rules: events, recipients, channels and templates.",
      },
      { property: "og:title", content: "Notifications | Blackstone Product 2.0" },
      { property: "og:description", content: "Global default notifications, overridable per stage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <AppShell title="Notifications" subtitle="Global default rules for this tenant">
      <div className="space-y-4">
        <p className="flex items-start gap-2 rounded-xl bg-primary-soft px-4 py-3 text-sm text-accent-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          These are the defaults. Rules set on a stage or sub-stage in Lifecycle (Stages) →
          Notifications override the default for the same event.
        </p>
        {globalDefaultRules.map((r) => (
          <RuleCard key={r.id} rule={r} scopeName="Proposal" readOnly />
        ))}
      </div>
    </AppShell>
  );
}
