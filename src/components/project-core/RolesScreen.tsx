import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { initialRoles, permissionColumns, permissionFeatures, type Role } from "./data";
import { Toggle } from "./primitives";

export function RolesScreen() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [selected, setSelected] = useState(initialRoles[0]!.id);
  const role = roles.find((r) => r.id === selected)!;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-semibold text-foreground">Roles</h2>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-dashed border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
        >
          <Plus className="size-4" /> New role
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((r) => {
          const Icon = r.icon;
          const active = r.id === selected;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelected(r.id)}
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                active ? "border-primary bg-primary-soft" : "border-border bg-card hover:bg-muted/50",
              )}
            >
              <span className={cn("flex size-10 items-center justify-center rounded-xl", r.tone)}>
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-foreground">{r.name}</span>
                <span className="block text-xs text-muted-foreground">{r.purpose}</span>
              </span>
            </button>
          );
        })}
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h3 className="text-[15px] font-semibold text-foreground">
            {role.name} — permissions matrix
          </h3>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Module override ability</span>
            <Toggle
              checked={role.override}
              onChange={(v) =>
                setRoles((prev) => prev.map((r) => (r.id === role.id ? { ...r, override: v } : r)))
              }
              label="Module override ability"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2.5 pr-4 font-medium">Feature</th>
                {permissionColumns.map((c) => (
                  <th key={c} className="py-2.5 px-3 text-center font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionFeatures.map((f) => (
                <tr key={f} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-medium text-foreground">{f}</td>
                  {(role.matrix[f] ?? []).map((allowed, i) => (
                    <td key={i} className="px-3 py-3 text-center">
                      {allowed ? (
                        <Check className="mx-auto size-4 text-success" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
