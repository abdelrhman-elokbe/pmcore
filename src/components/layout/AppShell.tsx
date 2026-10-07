import { Link } from "@tanstack/react-router";
import {
  Wrench,
  Bell,
  ChevronDown,
  Globe,
  Grid3x3,
  LayoutDashboard,
  Boxes,
  FileSearch,
  GitBranch,
  Settings as SettingsIcon,
  Search,
  UserCog,
  User,
  Hexagon,
  Building2,
  Lock,
  Layers,
  ToggleRight,
  ShieldCheck,
  Network,
  Scale,
  BookMarked,
  BellRing,
  Settings2,
  History,
  Check,
  Eye,
} from "lucide-react";
import { useState, type ComponentType, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePlatform } from "@/lib/platform/context";

type NavItem = {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
  search?: { screen: string };
  hostOnly?: boolean;
};

const hostNav: NavItem[] = [
  { label: "Platform Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Tenants & Licensing", to: "/tenants", icon: Building2 },
  { label: "Products", to: "/products", icon: Boxes },
  { label: "Workflows", to: "/workflows", icon: GitBranch },
  { label: "Identity & Access", to: "/identity", icon: UserCog },
  { label: "Audit & Monitoring", to: "/audit", icon: FileSearch },
  { label: "Platform Settings", to: "/settings", icon: SettingsIcon },
];

const tenantNav: NavItem[] = [
  { label: "Overview", to: "/tenant", icon: LayoutDashboard },
  { label: "Lifecycle (Stages)", to: "/project-core", icon: Layers, search: { screen: "stages" } },
  { label: "Workflows", to: "/workflows", icon: GitBranch, hostOnly: true },
  { label: "Features", to: "/project-core", icon: ToggleRight, search: { screen: "features" } },
  { label: "Roles & Permissions", to: "/project-core", icon: ShieldCheck, search: { screen: "roles" } },
  { label: "Organisation", to: "/organisation", icon: Network },
  { label: "Business Rules", to: "/business-rules", icon: Scale, hostOnly: true },
  { label: "Project Toolkit", to: "/toolkit", icon: Wrench },
  { label: "Lookups & Terminology", to: "/lookups", icon: BookMarked },
  { label: "Notifications", to: "/notifications", icon: BellRing },
  {
    label: "Configurations",
    to: "/project-core",
    icon: Settings2,
    search: { screen: "configurations" },
  },
  { label: "Change Log", to: "/change-log", icon: History },
];

function RoleToggle() {
  const { role, setRole } = usePlatform();
  return (
    <div className="flex rounded-xl border border-border bg-muted/60 p-1">
      {(
        [
          ["host", "Host Admin"],
          ["tenant", "Tenant Admin"],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => setRole(value)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
            role === value
              ? "bg-card text-foreground shadow-card"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Topbar() {
  const { draftChanges } = usePlatform();
  return (
    <header className="sticky top-0 z-30 flex h-[74px] items-center gap-4 border-b border-border bg-card px-5">
      <button
        aria-label="App switcher"
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
      >
        <Grid3x3 className="size-5" />
      </button>

      <Link to="/" className="flex items-center gap-2 pr-4">
        <Hexagon className="size-6 fill-foreground text-foreground" strokeWidth={1.5} />
        <span className="text-lg font-extrabold tracking-[0.14em] text-foreground">BLACKSTONE</span>
        <span className="-mt-2 text-[10px] font-semibold text-muted-foreground">•IT</span>
      </Link>

      <label className="relative hidden w-[300px] md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search settings…"
          className="h-11 w-full rounded-xl border border-border bg-card pl-9 pr-14 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
          ⌘K
        </kbd>
      </label>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden items-center gap-2 rounded-xl bg-warning-soft px-3 py-1.5 text-xs font-semibold text-warning xl:inline-flex">
          Draft · {draftChanges} pending changes
        </span>
        <RoleToggle />
        <button className="hidden items-center gap-2 text-sm font-medium text-foreground lg:flex">
          <Globe className="size-[18px] text-muted-foreground" />
          English
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
        <button aria-label="Notifications" className="text-muted-foreground hover:text-foreground">
          <Bell className="size-[18px]" />
        </button>
        <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <User className="size-5" />
        </span>
      </div>
    </header>
  );
}

function TenantSwitcher() {
  const { tenant, tenants: all, setTenantId } = usePlatform();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 rounded-2xl border border-border bg-muted/60 p-3 text-left transition-colors hover:bg-muted"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Building2 className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">{tenant.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {tenant.products.join(" + ")} · {tenant.users.active} users
          </span>
        </span>
        <ChevronDown
          className={cn("mt-1 size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border border-border bg-card shadow-raised">
          {all.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTenantId(t.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-muted"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{t.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {t.currency} · {t.language} · {t.orgGroups} groups
                </span>
              </span>
              {t.id === tenant.id ? <Check className="size-4 text-primary" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NavList({ items, locked }: { items: NavItem[]; locked: boolean }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const isLocked = locked && item.hostOnly;
        if (isLocked) {
          return (
            <span
              key={item.label}
              title="Managed by Blackstone"
              className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] text-muted-foreground/50"
            >
              <Icon className="size-[18px]" />
              {item.label}
              <Lock className="ml-auto size-3.5" />
            </span>
          );
        }
        return (
          <Link
            key={item.label}
            to={item.to}
            search={item.search as never}
            activeOptions={{ exact: item.to === "/", includeSearch: Boolean(item.search) }}
            activeProps={{
              className: "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
            }}
            inactiveProps={{ className: "text-muted-foreground hover:bg-muted" }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors"
          >
            <Icon className="size-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Sidebar() {
  const { isHost } = usePlatform();
  return (
    <aside className="sticky top-[74px] hidden h-[calc(100vh-74px)] w-[300px] shrink-0 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar px-4 py-4 lg:flex">
      <TenantSwitcher />

      {isHost ? (
        <>
          <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Platform
          </p>
          <NavList items={hostNav} locked={false} />
          <p className="mb-1 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Tenant scope
          </p>
        </>
      ) : (
        <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          My instance
        </p>
      )}
      <NavList items={tenantNav} locked={!isHost} />

      <div className="mt-auto flex items-center gap-3 rounded-2xl border border-border bg-muted/60 p-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-muted-foreground">
          <User className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">admin</p>
          <p className="truncate text-xs text-muted-foreground">blackstone@gmail.…</p>
        </div>
        <ChevronDown className="ml-auto size-4 text-muted-foreground" />
      </div>
    </aside>
  );
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 px-5 pb-12 pt-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div>
              <h1 className="text-[17px] font-semibold text-foreground">{title}</h1>
              {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {actions}
              <Link
                to="/project-preview"
                className="flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Eye className="size-4" /> Preview as tenant
              </Link>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
