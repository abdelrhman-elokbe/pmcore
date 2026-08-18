import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  Columns3,
  Filter,
  ListFilter,
  Search,
  ShieldCheck,
  Building2,
  KeyRound,
  History,
  UserCog,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/identity")({
  head: () => ({
    meta: [
      { title: "Identity & Access | Blackstone IT Platform" },
      {
        name: "description",
        content:
          "Manage users, roles and permissions, organization units, SSO integrations and access audit traceability.",
      },
      { property: "og:title", content: "Identity & Access | Blackstone IT Platform" },
      {
        property: "og:description",
        content: "Users, roles, organization units, SSO and access audit in one place.",
      },
    ],
  }),
  component: Identity,
});

const tabs = [
  { label: "Users", icon: Users },
  { label: "Roles & Permission", icon: ShieldCheck },
  { label: "Organization", icon: Building2 },
  { label: "Security", icon: KeyRound },
  { label: "SSO & Identity Integration", icon: ShieldCheck },
  { label: "Access Audit & Traceability", icon: History },
  { label: "User Status Changes", icon: UserCog },
];

const users = [
  {
    name: "Elwakil",
    email: "islambla@gmail.com",
    roles: "A Admin Copy, Master Admin, new role",
    units: "Blackstone, Business",
  },
  {
    name: "admin",
    email: "blackstone@gmail.com",
    roles:
      "A Admin Copy, A Admin Copy Copy, admin, admin 20, changes, Deactivate, new, olatest55, projectCore, RoleTest, Rowaida 7, sylvia, test123, update2",
    units: "",
  },
  {
    name: "ADMIN",
    email: "islam5@gmail.com",
    roles: "changes, Deactivate new role, new, pastte, Rowaida 7, Test ahmed, test123, tewtewtrewt",
    units: "Blackstone",
  },
  {
    name: "Englsih",
    email: "isla@gmail.com",
    roles: "Deactivate, Deactivate new role, fix, new, string",
    units: "Blackstone",
  },
  { name: "sada", email: "islam5eee@gmail.com", roles: "projectCore", units: "Blackstone" },
  { name: "for", email: "islam@gmail.com", roles: "fix, new, olatest55", units: "" },
  { name: "new", email: "Eslsm@fada.com", roles: "fix, new, tewtewtrewt", units: "" },
  { name: "FOR", email: "FORBUG@gmail.com", roles: "fix, new, tewtewtrewt", units: "" },
  {
    name: "shrouka",
    email: "shroukemara3@gmail.com",
    roles: "fix, pasttе, tewtewtrewt",
    units: "Blackstone",
  },
  { name: "Import 9", email: "Ahmad2@gmail.com", roles: "admin, role 1, role 2", units: "Blackstone" },
];

function Identity() {
  const [active, setActive] = useState("Users");

  return (
    <AppShell title="Identity & Access">
      <div className="rounded-2xl bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-border p-2">
          {tabs.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActive(label)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[15px] transition-colors ${
                active === label
                  ? "bg-accent font-semibold text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="size-[18px]" />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search"
              className="h-11 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </label>
          {["Status All", "Role All", "Organization Unit All"].map((f) => (
            <button
              key={f}
              className="flex h-11 min-w-[190px] items-center justify-between rounded-xl border border-border px-4 text-sm text-muted-foreground"
            >
              {f}
              <ChevronDown className="size-4" />
            </button>
          ))}
          {[0, 1].map((i) => (
            <button
              key={i}
              className="flex h-11 w-[150px] items-center justify-between rounded-xl border border-border px-4 text-sm text-muted-foreground"
            >
              mm/dd/yyyy
              <Calendar className="size-4" />
            </button>
          ))}
          <button className="h-11 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
            Import Users
          </button>
          <button className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            Add User
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ["Total Users", "166"],
            ["Active Users", "158"],
            ["Roles", "60"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-surface p-5">
              <p className="text-[15px] font-medium text-foreground">{label}</p>
              <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <button className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <ChevronDown className="size-4" />
          Hide insights
        </button>

        <div className="mt-6 flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <span>1–10 of 166</span>
          {[ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight].map((Icon, i) => (
            <button key={i} className="rounded-md p-1 hover:bg-muted">
              <Icon className="size-4" />
            </button>
          ))}
          <button className="ml-2 rounded-xl border border-border p-2.5 hover:bg-muted">
            <Columns3 className="size-4" />
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border text-sm text-muted-foreground">
                {["Full name", "Email", "Roles", "Units"].map((h) => (
                  <th key={h} className="px-3 pb-3 font-normal">
                    <span className="flex items-center gap-2">
                      {h}
                      <ListFilter className="size-3.5" />
                      <Filter className="size-3.5" />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="border-b border-border align-middle">
                  <td className="px-3 py-4">
                    <span className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-accent-foreground">
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-[15px] text-foreground">{u.name}</span>
                    </span>
                  </td>
                  <td className="px-3 py-4 text-[15px] text-foreground">{u.email}</td>
                  <td className="px-3 py-4 text-[15px] text-foreground">{u.roles}</td>
                  <td className="px-3 py-4 text-[15px] text-foreground">{u.units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
