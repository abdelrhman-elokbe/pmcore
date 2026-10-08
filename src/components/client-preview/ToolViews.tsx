import { bcFinancialFields, initialAssessmentTypes } from "@/components/project-core/data";
import type { Tool } from "@/components/project-core/toolkitData";
import { CpButton } from './PreviewUI';
import { cn } from "@/lib/utils";

type Props = {
  tool: Tool;
  data: Record<string, string>;
  set: (k: string, v: string) => void;
  readOnly: boolean;
  currency: string;
};

const input =
  "h-9 w-full rounded-lg border border-cp-border bg-cp-card px-3 text-sm text-cp-text outline-none focus:border-cp-purple disabled:bg-cp-bg";
const area =
  "min-h-20 w-full rounded-lg border border-cp-border bg-cp-card p-3 text-sm text-cp-text outline-none focus:border-cp-purple disabled:bg-cp-bg";

export function ToolBody({ tool, data, set, readOnly, currency }: Props) {
  if (tool.config === "feasibility") {
    const level = data["level"] ?? "Simplified";
    const types = initialAssessmentTypes.filter((t) => t.active);
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {["Simplified", "Full"].map((l) => (
            <CpButton
              key={l}
              type="button"
              disabled={readOnly}
              onClick={() => set("level", l)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm",
                level === l ? "border-cp-purple bg-cp-purple-soft font-semibold text-cp-purple" : "border-cp-border text-cp-text2",
              )}
            >
              {l} study
            </CpButton>
          ))}
        </div>
        {types.map((t) => (
          <div key={t.id} className="rounded-xl border border-cp-border p-3">
            <p className="text-sm font-semibold text-cp-text">{t.name}</p>
            <p className="mb-2 text-xs text-cp-muted">{t.description}</p>
            {t.categories
              .filter((c) => c.active)
              .slice(0, level === "Full" ? undefined : 1)
              .map((c) => (
                <div key={c.id} className="mt-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cp-muted">{c.name}</p>
                  {c.parameters
                    .filter((p) => p.active)
                    .map((p) => (
                      <div key={p.id} className="mt-1 flex items-center gap-3">
                        <span className="flex-1 text-sm text-cp-text2">{p.name}</span>
                        <select
                          disabled={readOnly}
                          value={data[p.id] ?? ""}
                          onChange={(e) => set(p.id, e.target.value)}
                          className={cn(input, "w-32")}
                        >
                          <option value="">Rate…</option>
                          {["1 · Low", "2", "3 · Medium", "4", "5 · High"].map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                </div>
              ))}
          </div>
        ))}
      </div>
    );
  }
  if (tool.config === "businessCase") {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          {["Internal", "External"].map((l) => (
            <CpButton
              key={l}
              type="button"
              disabled={readOnly}
              onClick={() => set("bcType", l)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm",
                (data["bcType"] ?? "Internal") === l
                  ? "border-cp-purple bg-cp-purple-soft font-semibold text-cp-purple"
                  : "border-cp-border text-cp-text2",
              )}
            >
              {l}
            </CpButton>
          ))}
        </div>
        <label className="block text-sm text-cp-text2">
          Total investment ({currency})
          <input disabled={readOnly} className={input} value={data["investment"] ?? ""} onChange={(e) => set("investment", e.target.value)} />
        </label>
        <div className="grid grid-cols-3 gap-3">
          {bcFinancialFields.map((f) => (
            <label key={f} className="block text-sm text-cp-text2">
              {f} {f === "NPV" ? `(${currency})` : "(%)"}
              <input disabled={readOnly} className={input} value={data[f] ?? ""} onChange={(e) => set(f, e.target.value)} />
            </label>
          ))}
        </div>
        <label className="block text-sm text-cp-text2">
          Justification
          <textarea disabled={readOnly} className={area} value={data["justification"] ?? ""} onChange={(e) => set("justification", e.target.value)} />
        </label>
      </div>
    );
  }
  if (tool.id === "swot") {
    const q = [
      ["s", "Strengths", "bg-cp-teal-soft"],
      ["w", "Weaknesses", "bg-cp-orange-soft"],
      ["o", "Opportunities", "bg-cp-blue-soft"],
      ["t", "Threats", "bg-cp-red-soft"],
    ] as const;
    return (
      <div className="grid grid-cols-2 gap-3">
        {q.map(([k, l, tone]) => (
          <div key={k} className={cn("rounded-xl p-3", tone)}>
            <p className="mb-2 text-sm font-semibold text-cp-text">{l}</p>
            <textarea disabled={readOnly} className={area} value={data[k] ?? ""} onChange={(e) => set(k, e.target.value)} />
          </div>
        ))}
      </div>
    );
  }
  if (tool.id === "raci") {
    const tasks = ["Define scope", "Approve budget", "Deliver milestones", "Sign-off"];
    const roles = ["PM", "Sponsor", "PMO", "Team"];
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-cp-muted">
            <th className="py-2">Activity</th>
            {roles.map((r) => (
              <th key={r} className="py-2">{r}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t} className="border-t border-cp-border">
              <td className="py-2 text-cp-text">{t}</td>
              {roles.map((r) => (
                <td key={r} className="py-2 pr-2">
                  <select disabled={readOnly} className={input} value={data[`${t}|${r}`] ?? ""} onChange={(e) => set(`${t}|${r}`, e.target.value)}>
                    <option value="">–</option>
                    {["R", "A", "C", "I"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  if (tool.id === "roi") {
    const cost = Number(data["cost"] || 0);
    const benefit = Number(data["benefit"] || 0);
    const roi = cost > 0 ? (((benefit - cost) / cost) * 100).toFixed(1) : "—";
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {[
            ["cost", `Total cost (${currency})`],
            ["benefit", `Total benefit (${currency})`],
            ["years", "Period (years)"],
          ].map(([k, l]) => (
            <label key={k} className="block text-sm text-cp-text2">
              {l}
              <input disabled={readOnly} type="number" className={input} value={data[k ?? ""] ?? ""} onChange={(e) => set(k ?? "", e.target.value)} />
            </label>
          ))}
        </div>
        <div className="rounded-xl bg-cp-purple-soft p-4">
          <p className="text-xs text-cp-text2">Return on investment</p>
          <p className="text-3xl font-bold text-cp-purple">{roi}{roi !== "—" ? "%" : ""}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-cp-text2">{tool.description}</p>
      <textarea disabled={readOnly} className={cn(area, "min-h-40")} value={data["body"] ?? ""} onChange={(e) => set("body", e.target.value)} placeholder="Complete this template…" />
      {tool.outputs.length ? (
        <p className="text-xs text-cp-muted">Outputs: {tool.outputs.join(", ")}</p>
      ) : null}
    </div>
  );
}
