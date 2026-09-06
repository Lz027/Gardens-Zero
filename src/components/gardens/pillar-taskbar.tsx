import { Link, useRouterState } from "@tanstack/react-router";
import { PILLARS, PILLAR_META } from "@/lib/pillars";
import { useNotes } from "@/lib/desk-queries";
import { useThreads } from "@/lib/chat-queries";
import { cn } from "@/lib/utils";

export function PillarTaskbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: notes } = useNotes();
  const { data: threads } = useThreads();

  return (
    <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-t border-border bg-card/50 px-3 py-2 backdrop-blur">
      <span className="shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
        Pillars
      </span>
      {PILLARS.map((pillar) => {
        const meta = PILLAR_META[pillar];
        const Icon = meta.icon;
        const count =
          (notes ?? []).filter((n) => n.pillar === pillar).length +
          (threads ?? []).filter((t) => t.pillar === pillar).length;
        const active = pathname === `/pillars/${pillar}`;
        return (
          <Link
            key={pillar}
            to="/pillars/$pillar"
            params={{ pillar }}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-xs transition-colors hover:border-ring",
              active && "bg-accent",
            )}
          >
            <Icon className={cn("size-4", meta.accent === "iris" ? "text-iris" : "text-teal")} />
            <span className="font-medium">{meta.label}</span>
            <span className="rounded bg-muted px-1.5 text-[10px] text-muted-foreground">
              {count}
            </span>
          </Link>
        );
      })}
      <span className="ml-auto hidden shrink-0 text-[10px] text-muted-foreground sm:block">
        Label a note or chat to file it here
      </span>
    </div>
  );
}
