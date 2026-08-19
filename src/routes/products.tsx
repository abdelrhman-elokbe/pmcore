import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Boxes } from "lucide-react";
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
  component: Products,
});

const products = [
  {
    name: "Project Core",
    version: "2.0",
    desc: "Project lifecycle, PMO dashboard, reports and change requests",
    to: "/project-core" as const,
  },
  { name: "Innovation Core", version: "1.4", desc: "Idea capture and innovation pipeline" },
  { name: "Task Core", version: "1.2", desc: "Task tracking and team workload" },
  { name: "Committee core", version: "1.1", desc: "Committee sessions, agendas and decisions" },
];

function Products() {
  return (
    <AppShell title="Products">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <div key={p.name} className="rounded-2xl bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Boxes className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold text-foreground">{p.name}</h2>
                <p className="text-xs text-muted-foreground">Version {p.version}</p>
              </div>
              <span className="ml-auto rounded-md bg-success-soft px-2 py-1 text-xs font-semibold text-success">
                Active
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{p.desc}</p>
            {p.to ? (
              <Link
                to={p.to}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Configure <ArrowRight className="size-4" />
              </Link>
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">Configuration coming next.</p>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
