import { useState } from "react";
import { Check, Plus, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { initialRoles, permissionColumns, permissionFeatures, type Role } from "./data";
import { Field, TextField, Toggle } from "./primitives";

type Draft = {
  name: string;
  nameAr: string;
  description: string;
  override: boolean;
  matrix: Record<string, boolean[]>;
};

const emptyMatrix = () =>
  Object.fromEntries(permissionFeatures.map((f) => [f, permissionColumns.map(() => false)]));

const emptyDraft = (): Draft => ({
  name: "",
  nameAr: "",
  description: "",
  override: false,
  matrix: emptyMatrix(),
});

export function RolesScreen() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [selected, setSelected] = useState(initialRoles[0]!.id);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const role = roles.find((r) => r.id === selected)!;

  const createRole = () => {
    const name = draft.name.trim() || "New role";
    const id = `role-${Date.now()}`;
    setRoles((prev) => [
      ...prev,
      {
        id,
        name,
        users: 0,
        purpose: draft.description.trim() || "0 users · Newly created role",
        icon: Shield,
        tone: "text-primary bg-primary-soft",
        override: draft.override,
        matrix: draft.matrix,
      },
    ]);
    setSelected(id);
    setDraft(emptyDraft());
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-semibold text-foreground">Roles</h2>
        <button
          type="button"
          onClick={() => setOpen(true)}
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
            <span className="text-sm text-muted-foreground">
              Module override ability · {role.override ? "On" : "Off"}
            </span>
            <Toggle
              checked={role.override}
              onChange={(v) =>
                setRoles((prev) => prev.map((r) => (r.id === role.id ? { ...r, override: v } : r)))
              }
              label={`Module override ability for ${role.name}`}
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

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[640px]">
          <SheetHeader>
            <SheetTitle>New role</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Role name (English)">
                <TextField
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="e.g. Portfolio Analyst"
                />
              </Field>
              <Field label="Role name (Arabic)">
                <TextField
                  dir="rtl"
                  value={draft.nameAr}
                  onChange={(e) => setDraft((d) => ({ ...d, nameAr: e.target.value }))}
                  placeholder="اسم الدور"
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground outline-none focus:border-primary"
                placeholder="What this role is responsible for"
              />
            </Field>

            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <span className="text-sm text-foreground">Module override ability</span>
              <Toggle
                checked={draft.override}
                onChange={(v) => setDraft((d) => ({ ...d, override: v }))}
                label="Module override ability for new role"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-border p-3">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2.5 pr-4 font-medium">Feature</th>
                    {permissionColumns.map((c) => (
                      <th key={c} className="px-2 py-2.5 text-center font-medium">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissionFeatures.map((f) => (
                    <tr key={f} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-foreground">{f}</td>
                      {permissionColumns.map((c, i) => (
                        <td key={c} className="px-2 py-2.5 text-center">
                          <input
                            type="checkbox"
                            aria-label={`${f} ${c}`}
                            checked={draft.matrix[f]?.[i] ?? false}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                matrix: {
                                  ...d.matrix,
                                  [f]: (d.matrix[f] ?? []).map((v, j) =>
                                    j === i ? e.target.checked : v,
                                  ),
                                },
                              }))
                            }
                            className="size-4 accent-[var(--primary)]"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pb-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-10 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createRole}
                className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Create role
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
