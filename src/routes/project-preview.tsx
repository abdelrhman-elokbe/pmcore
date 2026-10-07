import { createFileRoute } from "@tanstack/react-router";
import { ClientPreview } from "@/components/client-preview/ClientPreview";

export const Route = createFileRoute("/project-preview")({
  validateSearch: (s: Record<string, unknown>): { from?: string } =>
    typeof s["from"] === "string" ? { from: s["from"] as string } : {},
  head: () => ({
    meta: [
      { title: "Client Preview | Blackstone Product 2.0" },
      { name: "description", content: "Interactive preview of the draft Project Core configuration as the tenant's end users will see it." },
      { property: "og:title", content: "Client Preview | Blackstone Product 2.0" },
      { property: "og:description", content: "Test lifecycle, roles, toolkit, approvals and notifications before publishing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  const { from } = Route.useSearch();
  return <ClientPreview from={from ?? "stages"} />;
}
