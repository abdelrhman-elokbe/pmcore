import { Link } from "@tanstack/react-router";
import {
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
} from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Identity & Access", to: "/identity", icon: UserCog },
  { label: "Products", to: "/products", icon: Boxes },
  { label: "Audit & Monitoring AAA", to: "/audit", icon: FileSearch },
  { label: "Workflows", to: "/workflows", icon: GitBranch },
  { label: "Settings", to: "/settings", icon: SettingsIcon },
] as const;

function Topbar() {
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
        <span className="text-lg font-extrabold tracking-[0.14em] text-foreground">
          BLACKSTONE
        </span>
        <span className="-mt-2 text-[10px] font-semibold text-muted-foreground">•IT</span>
      </Link>

      <label className="relative hidden w-[330px] md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search across system & records"
          className="h-11 w-full rounded-xl border border-border bg-card pl-9 pr-14 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
          ⌘K
        </kbd>
      </label>

      <div className="ml-auto flex items-center gap-4">
        <button className="flex items-center gap-2 text-sm font-medium text-foreground">
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

function Sidebar() {
  return (
    <aside className="sticky top-[74px] hidden h-[calc(100vh-74px)] w-[300px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-4 lg:flex">
      <nav className="flex flex-col gap-1">
        {nav.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            activeProps={{
              className: "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
            }}
            inactiveProps={{ className: "text-muted-foreground hover:bg-muted" }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors"
          >
            <Icon className="size-[18px]" />
            {label}
          </Link>
        ))}
      </nav>

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

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 px-5 pb-12 pt-5">
          <h1 className="mb-4 text-[15px] text-foreground">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}
