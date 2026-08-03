import { createFileRoute, Link } from "@tanstack/react-router";
import { PILLARS, PILLAR_META, ENTRY_KIND_LABEL, type EntryKind } from "@/lib/pillars";
import { usePillarEntries, useMemories, useThreads } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Overview — Gardens Zero" },
      { name: "description", content: "The current state of every pillar in your workspace." },
      { property: "og:title", content: "Overview — Gardens Zero" },
      {
        property: "og:description",
        content: "The current state of every pillar in your workspace.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { data: entries } = usePillarEntries();
  const { data: memories } = useMemories();
  const { data: threads } = useThreads();

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        The garden <span className="text-gradient-iris">right now</span>
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {memories?.length ?? 0} memories held · {threads?.length ?? 0} threads open
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {PILLARS.map((pillar) => {
          const mine = (entries ?? []).filter((entry) => entry.pillar === pillar);
          return (
            <Link
              key={pillar}
              to="/pillars/$pillar"
              params={{ pillar }}
              className="panel rounded-xl p-5 transition-colors hover:border-ring"
            >
              <div
                className={
                  PILLAR_META[pillar].accent === "iris"
                    ? "text-xs uppercase tracking-widest text-iris"
                    : "text-xs uppercase tracking-widest text-teal"
                }
              >
                {PILLAR_META[pillar].label}
              </div>
              {mine.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">{PILLAR_META[pillar].blurb}</p>
              ) : (
                <ul className="mt-3 space-y-1.5">
                  {mine.slice(0, 3).map((entry) => (
                    <li key={entry.id} className="text-sm text-foreground">
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {ENTRY_KIND_LABEL[entry.kind as EntryKind]}
                      </span>
                      <br />
                      {entry.content}
                    </li>
                  ))}
                </ul>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
