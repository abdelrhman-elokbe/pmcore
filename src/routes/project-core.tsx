import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Eye,
  Layers,
  ListTree,
  Save,
  Settings2,
  ShieldCheck,
  ToggleRight,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StagesScreen } from "@/components/project-core/StagesScreen";
import { getAssignment } from "@/components/project-core/data";
import { phasesStore } from "@/components/project-core/configStores";
import { FeaturesScreen } from "@/components/project-core/FeaturesScreen";
import { RolesScreen } from "@/components/project-core/RolesScreen";
import { ConfigurationsScreen } from "@/components/project-core/ConfigurationsScreen";
import { LookupsScreen } from "@/components/project-core/LookupsScreen";
import { ToolDetail, ToolkitList } from "@/components/project-core/ToolkitScreen";
import { usePlatform } from "@/lib/platform/context";

type ScreenId = "stages" | "toolkit" | "features" | "roles" | "lookups" | "configurations";

export const Route = createFileRoute("/project-core")({
  validateSearch: (search: Record<string, unknown>): { screen?: ScreenId; tool?: string } => {
    const s = search["screen"];
    const tool = typeof search["tool"] === "string" ? (search["tool"] as string) : undefined;
    if (s === "toolkit") return tool ? { screen: s, tool } : { screen: s };
    return s === "features" ||
      s === "roles" ||
      s === "lookups" ||
      s === "configurations" ||
      s === "stages"
      ? { screen: s }
      : {};
  },
  head: () => ({
    meta: [
      { title: "Project Core Admin | Blackstone IT Platform" },
      {
        name: "description",
        content:
          "Host admin panel to configure Project Core stages, features, roles and client configurations for a single-tenant deployment.",
      },
      { property: "og:title", content: "Project Core Admin | Blackstone IT Platform" },
      {
        property: "og:description",
        content: "Configure Project Core stages, features, roles and client settings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectCoreAdmin,
});

const screens = [
  {
    id: "stages",
    label: "Stages",
    icon: Layers,
    title: "Stages",
    subtitle: "Configure the project lifecycle stages, criteria and approval chains",
  },
  {
    id: "toolkit",
    label: "Project Toolkit",
    icon: Wrench,
    title: "Project Toolkit",
    subtitle: "Reusable analysis tools that can be attached to any stage, optional or mandatory per project",
  },
  {
    id: "features",
    label: "Features",
    icon: ToggleRight,
    title: "Features",
    subtitle: "Enable or hide modules and features in the client interface",
  },
  {
    id: "roles",
    label: "Roles & permissions",
    icon: ShieldCheck,
    title: "Roles & permissions",
    subtitle: "Define what each role can view, create, edit, approve, delete and export",
  },
  {
    id: "lookups",
    label: "Lookups",
    icon: ListTree,
    title: "Lookups",
    subtitle: "Per-client lists: categories, types, sources, benefits, entities and health bands",
  },
  {
    id: "configurations",
    label: "Configurations",
    icon: Settings2,
    title: "Configurations",
    subtitle: "Branding, regional settings, organisation structure, health scores and license",
  },
] as const;

function ProjectCoreAdmin() {
  const { tenant, tenants: allTenants, tenantId, setTenantId } = usePlatform();
  const search = Route.useSearch();
  const [screen, setScreen] = useState<ScreenId>(search.screen ?? "stages");
  useEffect(() => {
    if (search.screen) setScreen(search.screen);
  }, [search.screen]);
  const navigate = Route.useNavigate();
  const go = (id: ScreenId) => {
    setScreen(id);
    navigate({ search: { screen: id } });
  };
  const current = screens.find((s) => s.id === screen)!;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex flex-wrap items-center gap-4 border-b border-border bg-card px-5 py-4">
        <Link
          to="/products"
          className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Back to products"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-[17px] font-semibold text-foreground">{current.title}</h1>
          <p className="text-xs text-muted-foreground">{current.subtitle}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/project-preview"
            search={{ from: screen }}
            className="flex h-10 items-center gap-2 rounded-xl border border-primary bg-primary-soft px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            <Eye className="size-4" /> Preview
          </Link>
          {screen !== "toolkit" && (
            <button
              type="button"
              onClick={() => toast("Changes discarded")}
              className="h-10 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Discard
            </button>
          )}
          {screen !== "toolkit" && (
          <button
            type="button"
            onClick={() => {
              if (screen === "stages") {
                const missing = phasesStore
                  .get(tenantId)
                  .flatMap((ph) => ph.stages)
                  .filter((st) => st.mandatory && !getAssignment(st.id).standard);
                if (missing.length > 0) {
                  toast.error("Assign an approval workflow before saving.");
                  return;
                }
              }
              toast.success(`${current.title} configuration saved`);
            }}
            className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Save className="size-4" /> Save
          </button>
          )}
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-[70px] hidden h-[calc(100vh-70px)] w-[280px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-4 lg:flex">
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-border bg-muted/60 p-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-soft text-teal">
              <Building2 className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <select
                value={tenantId}
                aria-label="Select client"
                onChange={(e) => setTenantId(e.target.value)}
                className="w-full truncate rounded-lg border border-transparent bg-transparent text-sm font-semibold text-foreground outline-none hover:border-border"
              >
                {allTenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Project Core 2.0 · {tenant.users.active} users · {tenant.currency}
              </p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {screens.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] transition-colors",
                  screen === id
                    ? "bg-teal-soft font-semibold text-teal"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-[18px]" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-5 pb-12 pt-5">
          <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
            {screens.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                className={cn(
                  "shrink-0 rounded-xl px-3 py-2 text-sm",
                  screen === id ? "bg-teal-soft font-semibold text-teal" : "text-muted-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {screen === "stages" && <StagesScreen />}
          {screen === "toolkit" &&
            (search.tool ? <ToolDetail toolId={search.tool} /> : <ToolkitList />)}
          {screen === "features" && <FeaturesScreen />}
          {screen === "roles" && <RolesScreen />}
          {screen === "lookups" && <LookupsScreen />}
          {screen === "configurations" && <ConfigurationsScreen />}
        </main>
      </div>
    </div>
  );
}
