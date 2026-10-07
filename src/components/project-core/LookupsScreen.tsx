import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, MoreHorizontal, Pencil, Plus, Search, ShieldAlert, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePlatform } from "@/lib/platform/context";
import { Field, SelectField, TextField, Toggle, inputClass } from "./primitives";
import {
  companyTypes,
  entityCategories,
  getTenantLookups,
  lookupCategories,
  type ExternalEntity,
  type HealthBand,
  type LookupCategoryId,
  type LookupItem,
  type TenantLookups,
} from "./lookupsData";

const genericIds: LookupCategoryId[] = [
  "categories",
  "types",
  "sources",
  "benefit-types",
  "lessons-learned",
];

function RowMenu({
  onEdit,
  onDuplicate,
  onDeactivate,
  usedBy,
}: {
  onEdit: () => void;
  onDuplicate: () => void;
  onDeactivate: () => void;
  usedBy?: number | undefined;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const locked = Boolean(usedBy && usedBy > 0);

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        aria-label="Row actions"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-9 z-20 w-52 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-card"
        >
          {[
            { label: "Edit", fn: onEdit },
            { label: "Duplicate", fn: onDuplicate },
          ].map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => {
                setOpen(false);
                a.fn();
              }}
              className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
            >
              {a.label}
            </button>
          ))}
          <button
            type="button"
            disabled={locked}
            title={locked ? `In use by ${usedBy} projects` : undefined}
            onClick={() => {
              setOpen(false);
              onDeactivate();
            }}
            className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:bg-transparent"
          >
            Deactivate
          </button>
        </div>
      )}
    </div>
  );
}

function Drawer({
  title,
  onClose,
  onSave,
  children,
}: {
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-foreground/20" onClick={onClose} />
      <aside className="flex h-full w-full max-w-[440px] flex-col border-l border-border bg-card">
        <header className="flex items-center gap-3 border-b border-border px-5 py-4">
          <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="ml-auto flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">{children}</div>
        <footer className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Save
          </button>
        </footer>
      </aside>
    </div>
  );
}

const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground";
const td = "px-4 py-3 text-sm text-foreground align-middle";

export function LookupsScreen() {
  const { tenantId, tenant } = usePlatform();
  const [data, setData] = useState<TenantLookups>(() => getTenantLookups(tenantId));
  const [active, setActive] = useState<LookupCategoryId>("categories");
  const [query, setQuery] = useState("");
  const [applyTo, setApplyTo] = useState<"new" | "both">("new");
  const [editingItem, setEditingItem] = useState<LookupItem | null>(null);
  const [editingEntity, setEditingEntity] = useState<ExternalEntity | null>(null);
  const [editHealth, setEditHealth] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [fCompany, setFCompany] = useState("All");
  const [fCategory, setFCategory] = useState("All");

  useEffect(() => {
    setData(getTenantLookups(tenantId));
    setQuery("");
  }, [tenantId]);

  const meta = lookupCategories.find((c) => c.id === active)!;

  const counts = useMemo<Record<LookupCategoryId, number>>(
    () => ({
      categories: data.categories.length,
      types: data.types.length,
      sources: data.sources.length,
      "benefit-types": data["benefit-types"].length,
      "external-entities": data["external-entities"].length,
      "lessons-learned": data["lessons-learned"].length,
      "health-score": data["health-score"].length,
      "fs-assessment-types": 0,
    }),
    [data],
  );

  const genericList: LookupItem[] = genericIds.includes(active)
    ? (data[active as keyof TenantLookups] as LookupItem[])
    : [];

  const filteredGeneric = genericList.filter((i) =>
    (i.name + i.description).toLowerCase().includes(query.toLowerCase()),
  );

  const filteredEntities = data["external-entities"].filter(
    (e) =>
      (e.name + e.code).toLowerCase().includes(query.toLowerCase()) &&
      (fCompany === "All" || e.companyType === fCompany) &&
      (fCategory === "All" || e.category === fCategory),
  );

  const updateGeneric = (next: LookupItem[]) =>
    setData((d) => ({ ...d, [active]: next }) as TenantLookups);

  const bands = data["health-score"];
  const bandError =
    bands[0]!.from !== 0 ||
    bands[bands.length - 1]!.to !== 100 ||
    bands.some((b, i) => (i > 0 && b.from !== bands[i - 1]!.to + 1) || b.to < b.from);

  const setBandTo = (idx: number, value: number) =>
    setData((d) => {
      const next = d["health-score"].map((b) => ({ ...b }));
      next[idx]!.to = value;
      if (next[idx + 1]) next[idx + 1]!.from = value + 1;
      return { ...d, "health-score": next };
    });

  const patchBand = (idx: number, patch: Partial<HealthBand>) =>
    setData((d) => ({
      ...d,
      "health-score": d["health-score"].map((b, i) => (i === idx ? { ...b, ...patch } : b)),
    }));

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <p className="text-sm font-medium text-foreground">Apply config changes to:</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Lookups are maintained per client — currently showing {tenant.name}.
        </p>
        <div className="mt-3 flex flex-wrap gap-5">
          {[
            { v: "new", l: "New projects only" },
            { v: "both", l: "Existing + new projects" },
          ].map((o) => (
            <label key={o.v} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="lookups-apply"
                checked={applyTo === o.v}
                onChange={() => setApplyTo(o.v as "new" | "both")}
                className="size-4 accent-[var(--primary)]"
              />
              {o.l}
            </label>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <nav className="h-fit rounded-2xl border border-border bg-card p-2 shadow-card">
          {lookupCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setActive(c.id);
                setQuery("");
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                active === c.id
                  ? "bg-primary-soft font-semibold text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <span className="min-w-0 flex-1 truncate">{c.label}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {counts[c.id]}
              </span>
            </button>
          ))}
        </nav>

        <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <header className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
            <h2 className="text-[15px] font-semibold text-foreground">
              {meta.label} ({counts[active]})
            </h2>
            {active !== "health-score" && active !== "fs-assessment-types" && (
              <>
                <div className="relative ml-auto">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search"
                    aria-label="Search lookups"
                    className={cn(inputClass, "h-10 w-[200px] pl-9")}
                  />
                </div>
                {active === "external-entities" && (
                  <button
                    type="button"
                    onClick={() => setShowFilter((v) => !v)}
                    className="flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <Filter className="size-4" /> Filter
                  </button>
                )}
              </>
            )}
            <div
              className={cn(
                active === "health-score" || active === "fs-assessment-types" ? "ml-auto" : "",
              )}
            >
              {active === "fs-assessment-types" ? null : active === "health-score" ? (
                <button
                  type="button"
                  onClick={() => {
                    if (editHealth && bandError) {
                      toast.error("Bands must cover 0–100% with no gaps or overlaps.");
                      return;
                    }
                    setEditHealth((v) => !v);
                  }}
                  className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Pencil className="size-4" /> {editHealth ? "Done editing" : "Edit configuration"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (active === "external-entities") {
                      setEditingEntity({
                        id: 0,
                        code: "",
                        name: "",
                        nameAr: "",
                        companyType: companyTypes[0]!,
                        category: "Public",
                        active: true,
                      });
                      return;
                    }
                    setEditingItem({ id: 0, name: "", description: "", active: true });
                  }}
                  className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="size-4" /> Add New {meta.singular}
                </button>
              )}
            </div>
          </header>

          {showFilter && active === "external-entities" && (
            <div className="grid gap-4 border-b border-border bg-muted/30 p-4 md:grid-cols-2">
              <Field label="Company Type">
                <SelectField
                  options={["All", ...companyTypes]}
                  value={fCompany}
                  onChange={(e) => setFCompany(e.target.value)}
                />
              </Field>
              <Field label="Category">
                <SelectField
                  options={["All", ...entityCategories]}
                  value={fCategory}
                  onChange={(e) => setFCategory(e.target.value)}
                />
              </Field>
            </div>
          )}

          {genericIds.includes(active) && (
            <table className="w-full">
              <thead className="bg-muted/40">
                <tr>
                  <th className={cn(th, "w-14")}>#</th>
                  <th className={th}>Name</th>
                  <th className={th}>Description</th>
                  <th className={cn(th, "w-28")}>Status</th>
                  <th className={cn(th, "w-20 text-right")}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGeneric.map((row, i) => (
                  <tr
                    key={row.id}
                    onClick={() => setEditingItem(row)}
                    className={cn(
                      "cursor-pointer border-t border-border transition-colors hover:bg-muted/40",
                      !row.active && "opacity-50",
                    )}
                  >
                    <td className={cn(td, "text-muted-foreground")}>{row.id}</td>
                    <td className={cn(td, "font-medium")}>{row.name}</td>
                    <td className={cn(td, "text-muted-foreground")}>{row.description}</td>
                    <td className={td} onClick={(e) => e.stopPropagation()}>
                      <Toggle
                        checked={row.active}
                        label={`${row.name} status`}
                        onChange={(v) =>
                          updateGeneric(
                            genericList.map((x) => (x.id === row.id ? { ...x, active: v } : x)),
                          )
                        }
                      />
                    </td>
                    <td className={td}>
                      <RowMenu
                        usedBy={row.usedBy}
                        onEdit={() => setEditingItem(row)}
                        onDuplicate={() =>
                          updateGeneric([
                            ...genericList,
                            {
                              ...row,
                              id: Math.max(...genericList.map((x) => x.id)) + 1,
                              name: `${row.name} (copy)`,
                              usedBy: 0,
                            },
                          ])
                        }
                        onDeactivate={() =>
                          updateGeneric(
                            genericList.map((x) =>
                              x.id === row.id ? { ...x, active: false } : x,
                            ),
                          )
                        }
                      />
                    </td>
                    <td className="hidden">{i}</td>
                  </tr>
                ))}
                {filteredGeneric.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No items match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {active === "external-entities" && (
            <table className="w-full">
              <thead className="bg-muted/40">
                <tr>
                  <th className={cn(th, "w-14")}>#</th>
                  <th className={th}>Code</th>
                  <th className={th}>External Entity Name</th>
                  <th className={th}>Company Type</th>
                  <th className={th}>Category</th>
                  <th className={cn(th, "w-28")}>Status</th>
                  <th className={cn(th, "w-20 text-right")}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntities.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setEditingEntity(row)}
                    className={cn(
                      "cursor-pointer border-t border-border transition-colors hover:bg-muted/40",
                      !row.active && "opacity-50",
                    )}
                  >
                    <td className={cn(td, "text-muted-foreground")}>{row.id}</td>
                    <td className={cn(td, "font-mono text-xs")}>{row.code}</td>
                    <td className={cn(td, "font-medium")}>{row.name}</td>
                    <td className={cn(td, "text-muted-foreground")}>{row.companyType}</td>
                    <td className={cn(td, "text-muted-foreground")}>{row.category}</td>
                    <td className={td} onClick={(e) => e.stopPropagation()}>
                      <Toggle
                        checked={row.active}
                        label={`${row.name} status`}
                        onChange={(v) =>
                          setData((d) => ({
                            ...d,
                            "external-entities": d["external-entities"].map((x) =>
                              x.id === row.id ? { ...x, active: v } : x,
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className={td}>
                      <RowMenu
                        usedBy={row.usedBy}
                        onEdit={() => setEditingEntity(row)}
                        onDuplicate={() =>
                          setData((d) => ({
                            ...d,
                            "external-entities": [
                              ...d["external-entities"],
                              {
                                ...row,
                                id: Math.max(...d["external-entities"].map((x) => x.id)) + 1,
                                code: `${row.code}-C`,
                                name: `${row.name} (copy)`,
                                usedBy: 0,
                              },
                            ],
                          }))
                        }
                        onDeactivate={() =>
                          setData((d) => ({
                            ...d,
                            "external-entities": d["external-entities"].map((x) =>
                              x.id === row.id ? { ...x, active: false } : x,
                            ),
                          }))
                        }
                      />
                    </td>
                  </tr>
                ))}
                {filteredEntities.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No entities match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {active === "health-score" && (
            <div>
              {bandError && (
                <p className="flex items-center gap-2 border-b border-border bg-warning-soft px-5 py-3 text-sm text-warning">
                  <ShieldAlert className="size-4" /> Bands must be contiguous and cover 0% – 100%
                  with no gaps or overlaps.
                </p>
              )}
              <table className="w-full">
                <thead className="bg-muted/40">
                  <tr>
                    <th className={cn(th, "w-14")}>#</th>
                    <th className={th}>Name</th>
                    <th className={cn(th, "w-40")}>Colour</th>
                    <th className={cn(th, "w-64")}>Percentage range</th>
                  </tr>
                </thead>
                <tbody>
                  {bands.map((b, i) => (
                    <tr key={b.id} className="border-t border-border">
                      <td className={cn(td, "text-muted-foreground")}>{b.id}</td>
                      <td className={td}>
                        {editHealth ? (
                          <TextField
                            value={b.name}
                            aria-label={`Band ${b.id} name`}
                            onChange={(e) => patchBand(i, { name: e.target.value })}
                          />
                        ) : (
                          <span className="font-medium">{b.name}</span>
                        )}
                      </td>
                      <td className={td}>
                        <div className="flex items-center gap-2">
                          <span
                            className="size-6 rounded-full border border-border"
                            style={{ backgroundColor: b.colour }}
                          />
                          {editHealth ? (
                            <input
                              type="color"
                              value={b.colour}
                              aria-label={`Band ${b.id} colour`}
                              onChange={(e) => patchBand(i, { colour: e.target.value })}
                              className="h-8 w-12 cursor-pointer rounded border border-border bg-card"
                            />
                          ) : (
                            <span className="font-mono text-xs uppercase text-muted-foreground">
                              {b.colour}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={td}>
                        {editHealth ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={b.from}
                              readOnly
                              aria-label={`Band ${b.id} from`}
                              className={cn(inputClass, "h-9 w-20 bg-muted")}
                            />
                            <span className="text-muted-foreground">–</span>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={b.to}
                              disabled={i === bands.length - 1}
                              aria-label={`Band ${b.id} to`}
                              onChange={(e) => setBandTo(i, Number(e.target.value))}
                              className={cn(inputClass, "h-9 w-20")}
                            />
                          </div>
                        ) : (
                          <span>
                            {b.from}% – {b.to}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {active === "fs-assessment-types" && (
            <div className="p-5">
              <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                FS assessment types now live on the{" "}
                <Link to="/project-core" search={{ screen: "toolkit", tool: "feasibility-study" }} className="font-semibold text-primary">
                  Project Toolkit → Feasibility Study
                </Link>{" "}
                tool page.
              </p>
            </div>
          )}

        </section>
      </div>

      {editingItem && (
        <Drawer
          title={editingItem.id === 0 ? `Add New ${meta.singular}` : `Edit ${editingItem.name}`}
          onClose={() => setEditingItem(null)}
          onSave={() => {
            const draft = editingItem;
            if (!draft.name.trim()) {
              toast.error("Name is required.");
              return;
            }
            updateGeneric(
              draft.id === 0
                ? [
                    ...genericList,
                    {
                      ...draft,
                      id: genericList.length ? Math.max(...genericList.map((x) => x.id)) + 1 : 1,
                    },
                  ]
                : genericList.map((x) => (x.id === draft.id ? draft : x)),
            );
            setEditingItem(null);
            toast.success("Lookup saved");
          }}
        >
          <Field label="Name (English)">
            <TextField
              value={editingItem.name}
              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
            />
          </Field>
          <Field label="Name (Arabic)">
            <TextField
              dir="rtl"
              value={editingItem.nameAr ?? ""}
              onChange={(e) => setEditingItem({ ...editingItem, nameAr: e.target.value })}
            />
          </Field>
          <Field label="Description (English)">
            <textarea
              value={editingItem.description}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              className={cn(inputClass, "h-24 py-2")}
            />
          </Field>
          <Field label="Description (Arabic)">
            <textarea
              dir="rtl"
              value={editingItem.descriptionAr ?? ""}
              onChange={(e) => setEditingItem({ ...editingItem, descriptionAr: e.target.value })}
              className={cn(inputClass, "h-24 py-2")}
            />
          </Field>
          <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
            <span className="text-sm font-medium text-foreground">Status</span>
            <span className="text-xs text-muted-foreground">
              {editingItem.active ? "Active" : "Inactive"}
            </span>
            <span className="ml-auto">
              <Toggle
                checked={editingItem.active}
                label="Status"
                onChange={(v) => setEditingItem({ ...editingItem, active: v })}
              />
            </span>
          </div>
        </Drawer>
      )}

      {editingEntity && (
        <Drawer
          title={editingEntity.id === 0 ? "Add New Entity" : `Edit ${editingEntity.name}`}
          onClose={() => setEditingEntity(null)}
          onSave={() => {
            const draft = editingEntity;
            if (!draft.name.trim() || !draft.code.trim()) {
              toast.error("Code and name are required.");
              return;
            }
            setData((d) => ({
              ...d,
              "external-entities":
                draft.id === 0
                  ? [
                      ...d["external-entities"],
                      {
                        ...draft,
                        id: d["external-entities"].length
                          ? Math.max(...d["external-entities"].map((x) => x.id)) + 1
                          : 1,
                      },
                    ]
                  : d["external-entities"].map((x) => (x.id === draft.id ? draft : x)),
            }));
            setEditingEntity(null);
            toast.success("External entity saved");
          }}
        >
          <Field label="Code">
            <TextField
              value={editingEntity.code}
              onChange={(e) => setEditingEntity({ ...editingEntity, code: e.target.value })}
            />
          </Field>
          <Field label="Name (English)">
            <TextField
              value={editingEntity.name}
              onChange={(e) => setEditingEntity({ ...editingEntity, name: e.target.value })}
            />
          </Field>
          <Field label="Name (Arabic)">
            <TextField
              dir="rtl"
              value={editingEntity.nameAr ?? ""}
              onChange={(e) => setEditingEntity({ ...editingEntity, nameAr: e.target.value })}
            />
          </Field>
          <Field label="Company Type">
            <SelectField
              options={companyTypes}
              value={editingEntity.companyType}
              onChange={(e) => setEditingEntity({ ...editingEntity, companyType: e.target.value })}
            />
          </Field>
          <Field label="Category">
            <SelectField
              options={[...entityCategories]}
              value={editingEntity.category}
              onChange={(e) =>
                setEditingEntity({
                  ...editingEntity,
                  category: e.target.value as ExternalEntity["category"],
                })
              }
            />
          </Field>
          <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
            <span className="text-sm font-medium text-foreground">Status</span>
            <span className="ml-auto">
              <Toggle
                checked={editingEntity.active}
                label="Status"
                onChange={(v) => setEditingEntity({ ...editingEntity, active: v })}
              />
            </span>
          </div>
        </Drawer>
      )}
    </div>
  );
}
