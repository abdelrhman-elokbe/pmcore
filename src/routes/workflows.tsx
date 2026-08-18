import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/workflows")({
  head: () => ({
    meta: [
      { title: "Workflows | Blackstone IT Platform" },
      {
        name: "description",
        content: "Design, simulate and monitor workflow templates across platform products.",
      },
      { property: "og:title", content: "Workflows | Blackstone IT Platform" },
      { property: "og:description", content: "Workflow templates, simulation and monitoring." },
    ],
  }),
  component: () => (
    <AppShell title="Workflows">
      <div className="rounded-2xl bg-card p-10 text-center shadow-card">
        <p className="text-muted-foreground">Workflow module coming next.</p>
      </div>
    </AppShell>
  ),
});
