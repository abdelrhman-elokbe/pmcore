import { useState } from "react";
import { usePlatform } from "@/lib/platform/context";
import { notifRulesStore, scopeRules, type ScopeRules } from "./configStores";
import { Bell, Mail, Plus, Trash2, Info } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  getSeedRules,
  globalDefaultRules,
  recipientRoles,
  specificRecipients,
  triggerEvents,
  type Channel,
  type NotificationRule,
} from "./notificationsData";
import { Field, SelectField, TextField, Toggle } from "./primitives";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
        active
          ? "border-primary bg-primary-soft text-primary"
          : "border-border text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

const toggleIn = (list: string[], v: string) =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

function preview(t: string, scope: string) {
  return t
    .replaceAll("{{project.name}}", "Heritage Site Digitisation")
    .replaceAll("{{stage.name}}", scope)
    .replaceAll("{{actor.name}}", "Sara Al Mansoori")
    .replaceAll("{{comment}}", "Please attach the cost breakdown.")
    .replaceAll("{{days}}", "5");
}

export function RuleCard({
  rule,
  scopeName,
  onChange,
  onRemove,
  readOnly,
}: {
  rule: NotificationRule;
  scopeName: string;
  onChange?: (r: NotificationRule) => void;
  onRemove?: () => void;
  readOnly?: boolean;
}) {
  const set = (p: Partial<NotificationRule>) => onChange?.({ ...rule, ...p });
  return (
    <div
      className={cn(
        "space-y-4 rounded-2xl border border-border bg-card p-4 transition-opacity",
        !rule.enabled && "opacity-40",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Bell className="size-4" />
        </span>
        <p className="text-sm font-semibold text-foreground">{rule.event}</p>
        <div className="ml-auto flex items-center gap-2">
          {!readOnly && onRemove ? (
            <button
              type="button"
              aria-label="Remove rule"
              onClick={onRemove}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
            >
              <Trash2 className="size-4" />
            </button>
          ) : null}
          <Toggle
            checked={rule.enabled}
            onChange={(v) => !readOnly && set({ enabled: v })}
            label={`Enable ${rule.event}`}
          />
        </div>
      </div>
      {readOnly ? (
        <p className="text-xs text-muted-foreground">
          {rule.roles.join(", ")} · {rule.channels.join(" + ")}
        </p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Trigger event">
              <SelectField
                options={[...triggerEvents]}
                value={rule.event}
                onChange={(e) => set({ event: e.target.value })}
              />
            </Field>
            {rule.event === "X days before due date" ? (
              <Field label="Days before due date">
                <TextField
                  type="number"
                  min={1}
                  value={rule.daysBefore ?? 3}
                  onChange={(e) => set({ daysBefore: Number(e.target.value) })}
                />
              </Field>
            ) : null}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Recipients — roles</p>
            <div className="flex flex-wrap gap-2">
              {recipientRoles.map((r) => (
                <Chip key={r} active={rule.roles.includes(r)} onClick={() => set({ roles: toggleIn(rule.roles, r) })}>
                  {r}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Specific users / groups</p>
            <div className="flex flex-wrap gap-2">
              {specificRecipients.map((r) => (
                <Chip
                  key={r}
                  active={rule.specific.includes(r)}
                  onClick={() => set({ specific: toggleIn(rule.specific, r) })}
                >
                  {r}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Channels</p>
            <div className="flex gap-2">
              {(["In-app", "Email"] as Channel[]).map((c) => (
                <Chip
                  key={c}
                  active={rule.channels.includes(c)}
                  onClick={() => set({ channels: toggleIn(rule.channels, c) as Channel[] })}
                >
                  {c === "Email" ? <Mail className="mr-1 inline size-3" /> : <Bell className="mr-1 inline size-3" />}
                  {c}
                </Chip>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Template">
              <textarea
                rows={3}
                value={rule.template}
                onChange={(e) => set({ template: e.target.value })}
                className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </Field>
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">Message preview</p>
              <div className="rounded-xl bg-muted px-4 py-3 text-sm text-foreground">
                {preview(rule.template, scopeName)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function NotificationRules({
  scopeId,
  scopeName,
  parentName,
}: {
  scopeId: string;
  scopeName: string;
  /** When set, this is a sub-stage and may inherit from its parent stage. */
  parentName?: string;
}) {
  const { tenantId } = usePlatform();
  const [all, setAll] = notifRulesStore.use(tenantId);
  const { rules, inherit } = scopeRules(all, scopeId, !!parentName);
  const patchScope = (fn: (s: ScopeRules) => ScopeRules) =>
    setAll((a) => ({ ...a, [scopeId]: fn(scopeRules(a, scopeId, !!parentName)) }));
  const setRules = (fn: (p: NotificationRule[]) => NotificationRule[]) =>
    patchScope((s) => ({ ...s, rules: fn(s.rules) }));
  const setInherit = (v: boolean) => patchScope((s) => ({ ...s, inherit: v }));

  return (
    <div className="space-y-4">
      <p className="flex items-start gap-2 rounded-xl bg-primary-soft px-4 py-3 text-sm text-accent-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        <span>
          Rules here override the tenant-wide defaults in{" "}
          <Link to="/notifications" className="font-semibold underline">
            Notifications
          </Link>{" "}
          for the same trigger event. Events without a rule fall back to the global default.
        </span>
      </p>

      {parentName ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Inherit from stage “{parentName}”</p>
            <p className="text-xs text-muted-foreground">
              Turn off to override with rules specific to {scopeName}.
            </p>
          </div>
          <Toggle checked={inherit} onChange={setInherit} label="Inherit from stage" />
        </div>
      ) : null}

      {inherit ? (
        <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          Using rules from {parentName} (and global defaults where none are set).
        </p>
      ) : (
        <>
          {rules.length === 0 ? (
            <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
              No stage-specific rules. Global defaults apply.
            </p>
          ) : null}
          {rules.map((r, i) => (
            <RuleCard
              key={r.id}
              rule={r}
              scopeName={scopeName}
              onChange={(n) => setRules((p) => p.map((x, j) => (j === i ? n : x)))}
              onRemove={() => setRules((p) => p.filter((_, j) => j !== i))}
            />
          ))}
          <button
            type="button"
            onClick={() =>
              setRules((p) => [
                ...p,
                {
                  id: `r${Date.now()}`,
                  event: "Stage entered",
                  roles: ["Project Manager"],
                  specific: [],
                  channels: ["In-app"],
                  template: "{{project.name}} has entered {{stage.name}}.",
                  enabled: true,
                },
              ])
            }
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary text-sm font-semibold text-primary"
          >
            <Plus className="size-4" /> Add notification rule
          </button>
        </>
      )}

      <details className="rounded-xl border border-border px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-foreground">
          Global defaults ({globalDefaultRules.length}) — overridden by matching rules above
        </summary>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {globalDefaultRules.map((g) => {
            const overridden = !inherit && rules.some((r) => r.event === g.event && r.enabled);
            return (
              <li key={g.id} className={cn(overridden && "line-through")}>
                {g.event} → {g.roles.join(", ")} · {g.channels.join(" + ")}
                {overridden ? " (overridden)" : ""}
              </li>
            );
          })}
        </ul>
      </details>
    </div>
  );
}
