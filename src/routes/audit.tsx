import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit & Monitoring | Blackstone IT Platform" },
      {
        name: "description",
        content: "Authentication, authorization and accounting audit trails across the platform.",
      },
      { property: "og:title", content: "Audit & Monitoring | Blackstone IT Platform" },
      { property: "og:description", content: "AAA audit trails and platform monitoring." },
    ],
  }),
  component: () => (
    <AppShell title="Audit & Monitoring AAA">
      <div className="rounded-2xl bg-card p-10 text-center shadow-card">
        <p className="text-muted-foreground">Audit & monitoring module coming next.</p>
      </div>
    </AppShell>
  ),
});
