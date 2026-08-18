import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products | Blackstone IT Platform" },
      {
        name: "description",
        content: "Browse licensed platform products, their status and entitlements.",
      },
      { property: "og:title", content: "Products | Blackstone IT Platform" },
      { property: "og:description", content: "Licensed platform products and entitlements." },
    ],
  }),
  component: () => (
    <AppShell title="Products">
      <div className="rounded-2xl bg-card p-10 text-center shadow-card">
        <p className="text-muted-foreground">Product catalog module coming next.</p>
      </div>
    </AppShell>
  ),
});
