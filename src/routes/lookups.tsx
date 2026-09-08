import { createFileRoute } from "@tanstack/react-router";
import { BookMarked } from "lucide-react";
import { SectionPlaceholder } from "@/components/layout/SectionPlaceholder";

export const Route = createFileRoute("/lookups")({
  head: () => ({
    meta: [
      { title: "Lookups & Terminology | Blackstone Product 2.0" },
      {
        name: "description",
        content:
          "Manage lookup lists and the bilingual terminology dictionary that renames product concepts per tenant.",
      },
      { property: "og:title", content: "Lookups & Terminology | Blackstone Product 2.0" },
      { property: "og:description", content: "Lookup lists and per-tenant terminology overrides." },
    ],
  }),
  component: () => (
    <SectionPlaceholder
      title="Lookups & Terminology"
      subtitle="Editable lookup lists and a bilingual dictionary mapping system terms to tenant labels."
      icon={BookMarked}
      items={[
        "Classification, type, origin, delivery type, closure reasons",
        "Risk types, benefit types and measurement types",
        "Document tags, currencies, priority levels",
        "Terminology dictionary: system term → EN label → AR label",
        "Live 'Preview as tenant' of renamed terms",
      ]}
    />
  ),
});
