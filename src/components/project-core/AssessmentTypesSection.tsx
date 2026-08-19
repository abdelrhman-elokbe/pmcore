import { useState } from "react";
import { AlertTriangle, ChevronDown, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  initialAssessmentTypes,
  type AssessmentCategory,
  type AssessmentParameter,
  type AssessmentType,
} from "./data";
import { TextField, Toggle } from "./primitives";

function EditableName({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        aria-label={`Edit ${value}`}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          onChange(draft.trim() || value);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        onClick={(e) => e.stopPropagation()}
        className="h-8 rounded-lg border border-primary bg-card px-2 text-sm text-foreground outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setDraft(value);
        setEditing(true);
      }}
      className={cn("rounded px-1 text-left hover:bg-muted", className)}
    >
      {value}
    </button>
  );
}

function DeleteButton({
  inUse,
  onDelete,
  label,
  onWarn,
}: {
  inUse?: boolean | undefined;
  onDelete: () => void;
  label: string;
  onWarn: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Delete ${label}`}
      onClick={(e) => {
        e.stopPropagation();
        if (inUse) onWarn();
        else onDelete();
      }}
      className="text-muted-foreground transition-colors hover:text-destructive"
    >
      <Trash2 className="size-4" />
    </button>
  );
}

const inUseWarning = "This item is used in existing data. Deactivate it instead of deleting.";

export function AssessmentTypesSection() {
  const [types, setTypes] = useState<AssessmentType[]>(initialAssessmentTypes);
  const [openTypes, setOpenTypes] = useState<string[]>(["legal"]);
  const [openCats, setOpenCats] = useState<string[]>([]);
  const [warning, setWarning] = useState<string | null>(null);

  const patchType = (id: string, patch: Partial<AssessmentType>) =>
    setTypes((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const patchCat = (tid: string, cid: string, patch: Partial<AssessmentCategory>) =>
    setTypes((p) =>
      p.map((t) =>
        t.id === tid
          ? { ...t, categories: t.categories.map((c) => (c.id === cid ? { ...c, ...patch } : c)) }
          : t,
      ),
    );

  const patchParam = (
    tid: string,
    cid: string,
    pid: string,
    patch: Partial<AssessmentParameter>,
  ) =>
    setTypes((p) =>
      p.map((t) =>
        t.id === tid
          ? {
              ...t,
              categories: t.categories.map((c) =>
                c.id === cid
                  ? {
                      ...c,
                      parameters: c.parameters.map((x) =>
                        x.id === pid ? { ...x, ...patch } : x,
                      ),
                    }
                  : c,
              ),
            }
          : t,
      ),
    );

  const toggle = (list: string[], set: (v: string[]) => void, id: string) =>
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const warn = (id: string) => setWarning(id);

  return (
    <div className="space-y-3">
      {warning ? (
        <p className="flex items-center gap-2 rounded-xl bg-warning-soft px-4 py-3 text-sm font-medium text-warning">
          <AlertTriangle className="size-4 shrink-0" /> {inUseWarning}
        </p>
      ) : null}

      {types.map((type) => {
        const expanded = openTypes.includes(type.id);
        return (
          <div
            key={type.id}
            className={cn(
              "overflow-hidden rounded-2xl border border-border",
              !type.active && "opacity-50",
            )}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => toggle(openTypes, setOpenTypes, type.id)}
              onKeyDown={(e) => e.key === "Enter" && toggle(openTypes, setOpenTypes, type.id)}
              className="flex cursor-pointer flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  expanded && "rotate-180",
                )}
              />
              <div className="min-w-0">
                <EditableName
                  value={type.name}
                  onChange={(v) => patchType(type.id, { name: v })}
                  className="block text-[15px] font-semibold text-foreground"
                />
                <p className="px-1 text-xs text-muted-foreground">{type.description}</p>
              </div>
              <div className="ml-auto flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs font-medium text-muted-foreground">
                  {type.active ? "Active" : "Inactive"}
                </span>
                <Toggle
                  checked={type.active}
                  onChange={(v) => patchType(type.id, { active: v })}
                  label={`${type.name} active`}
                />
                <DeleteButton
                  inUse={type.inUse}
                  label={type.name}
                  onWarn={() => warn(type.id)}
                  onDelete={() => setTypes((p) => p.filter((t) => t.id !== type.id))}
                />
              </div>
            </div>

            {expanded && (
              <div className="space-y-2 border-t border-border bg-muted/20 p-3">
                {type.categories.map((cat) => {
                  const catOpen = openCats.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      className={cn(
                        "overflow-hidden rounded-xl border border-border bg-card",
                        !cat.active && "opacity-50",
                      )}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggle(openCats, setOpenCats, cat.id)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && toggle(openCats, setOpenCats, cat.id)
                        }
                        className="flex cursor-pointer items-center gap-3 px-4 py-2.5"
                      >
                        <ChevronDown
                          className={cn(
                            "size-4 text-muted-foreground transition-transform",
                            catOpen && "rotate-180",
                          )}
                        />
                        <EditableName
                          value={cat.name}
                          onChange={(v) => patchCat(type.id, cat.id, { name: v })}
                          className="text-sm font-medium text-foreground"
                        />
                        <div
                          className="ml-auto flex items-center gap-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-xs text-muted-foreground">
                            {cat.active ? "Active" : "Inactive"}
                          </span>
                          <Toggle
                            checked={cat.active}
                            onChange={(v) => patchCat(type.id, cat.id, { active: v })}
                            label={`${cat.name} active`}
                          />
                          <DeleteButton
                            inUse={cat.inUse}
                            label={cat.name}
                            onWarn={() => warn(cat.id)}
                            onDelete={() =>
                              patchType(type.id, {
                                categories: type.categories.filter((c) => c.id !== cat.id),
                              })
                            }
                          />
                        </div>
                      </div>

                      {catOpen && (
                        <div className="space-y-2 border-t border-border p-3">
                          {cat.parameters.map((p) => (
                            <div
                              key={p.id}
                              className={cn(
                                "flex flex-wrap items-center gap-3 rounded-xl border border-border px-3 py-2",
                                !p.active && "opacity-50",
                              )}
                            >
                              <EditableName
                                value={p.name}
                                onChange={(v) => patchParam(type.id, cat.id, p.id, { name: v })}
                                className="text-sm text-foreground"
                              />
                              <TextField
                                value={p.info}
                                aria-label={`${p.name} info tooltip`}
                                placeholder="Info tooltip"
                                onChange={(e) =>
                                  patchParam(type.id, cat.id, p.id, { info: e.target.value })
                                }
                                className="h-9 max-w-[260px] flex-1"
                              />
                              <div className="ml-auto flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">
                                  {p.active ? "Active" : "Inactive"}
                                </span>
                                <Toggle
                                  checked={p.active}
                                  onChange={(v) =>
                                    patchParam(type.id, cat.id, p.id, { active: v })
                                  }
                                  label={`${p.name} active`}
                                />
                                <DeleteButton
                                  inUse={p.inUse}
                                  label={p.name}
                                  onWarn={() => warn(p.id)}
                                  onDelete={() =>
                                    patchCat(type.id, cat.id, {
                                      parameters: cat.parameters.filter((x) => x.id !== p.id),
                                    })
                                  }
                                />
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              patchCat(type.id, cat.id, {
                                parameters: [
                                  ...cat.parameters,
                                  {
                                    id: `${cat.id}-${Date.now()}`,
                                    name: "New parameter",
                                    info: "",
                                    active: true,
                                  },
                                ],
                              })
                            }
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
                          >
                            <Plus className="size-4" /> Add parameter
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() =>
                    patchType(type.id, {
                      categories: [
                        ...type.categories,
                        {
                          id: `${type.id}-${Date.now()}`,
                          name: "New category",
                          active: true,
                          parameters: [],
                        },
                      ],
                    })
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
                >
                  <Plus className="size-4" /> Add category
                </button>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={() =>
          setTypes((p) => [
            ...p,
            {
              id: `type-${Date.now()}`,
              name: "New assessment type",
              description: "Describe this assessment type",
              active: true,
              categories: [],
            },
          ])
        }
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
      >
        <Plus className="size-4" /> Add assessment type
      </button>
    </div>
  );
}
