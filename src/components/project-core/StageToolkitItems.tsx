import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { toolsForStage, useTools, type Tool } from "./toolkitData";

function Row({ t, locked }: { t: Tool; locked: boolean }) {
  const Icon = t.icon;
  return (
    <Link
      to="/project-core"
      search={{ screen: "toolkit", tool: t.id }}
      className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 hover:bg-muted/50"
    >
      <span className="flex size-8 items-center justify-center rounded-xl bg-primary-soft text-primary">
        <Icon className="size-4" />
      </span>
      <span className="text-sm font-medium text-foreground">{t.name}</span>
      <span className="ml-auto flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
        {locked ? <Lock className="size-3" /> : null}
        {t.mode}
      </span>
    </Link>
  );
}

export function StageToolkitItems({ stageId }: { stageId: string }) {
  const { mandatory, optional } = toolsForStage(useTools(), stageId);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Read-only. Tools are configured in{" "}
        <Link to="/project-core" search={{ screen: "toolkit" }} className="font-semibold text-primary">
          Project Toolkit
        </Link>
        .
      </p>
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">
          Mandatory — auto-attached here ({mandatory.length})
        </p>
        <div className="space-y-2">
          {mandatory.length ? (
            mandatory.map((t) => <Row key={t.id} t={t} locked />)
          ) : (
            <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">None</p>
          )}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">
          Optional — PM may add here ({optional.length})
        </p>
        <div className="space-y-2">
          {optional.length ? (
            optional.map((t) => <Row key={t.id} t={t} locked={false} />)
          ) : (
            <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">None</p>
          )}
        </div>
      </div>
    </div>
  );
}
