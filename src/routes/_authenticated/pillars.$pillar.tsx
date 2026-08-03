import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePillarEntries, useMemories, useInvalidate, currentUserId } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PILLAR_META,
  ENTRY_KINDS,
  ENTRY_KIND_LABEL,
  isPillar,
  type EntryKind,
  type Pillar,
} from "@/lib/pillars";

export const Route = createFileRoute("/_authenticated/pillars/$pillar")({
  head: () => ({
    meta: [
      { title: "Pillar — Gardens Zero" },
      { name: "description", content: "Status narrative for one pillar of your workspace." },
      { property: "og:title", content: "Pillar — Gardens Zero" },
      {
        property: "og:description",
        content: "Status narrative for one pillar of your workspace.",
      },
    ],
  }),
  component: PillarPage,
});

function PillarPage() {
  const { pillar } = Route.useParams();
  if (!isPillar(pillar)) throw notFound();
  return <PillarBody pillar={pillar} />;
}

function PillarBody({ pillar }: { pillar: Pillar }) {
  const { data: entries } = usePillarEntries(pillar);
  const { data: memories } = useMemories({ pillar });
  const invalidate = useInvalidate();
  const [kind, setKind] = useState<EntryKind>("done");
  const [content, setContent] = useState("");

  async function addEntry() {
    const text = content.trim();
    if (!text) return;
    const userId = await currentUserId();
    if (!userId) return;
    await supabase
      .from("pillar_entries")
      .insert({ user_id: userId, pillar, kind, content: text });
    setContent("");
    invalidate(["pillar_entries"]);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">{PILLAR_META[pillar].label}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{PILLAR_META[pillar].blurb}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as EntryKind)}
          className="h-9 rounded-md border border-input bg-card px-2 text-sm text-foreground"
        >
          {ENTRY_KINDS.map((option) => (
            <option key={option} value={option}>
              {ENTRY_KIND_LABEL[option]}
            </option>
          ))}
        </select>
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add to the narrative…"
          className="h-9 min-w-0 flex-1"
        />
        <Button onClick={addEntry}>Add</Button>
      </div>

      <div className="mt-8 space-y-6">
        {ENTRY_KINDS.map((section) => {
          const items = (entries ?? []).filter((entry) => entry.kind === section);
          if (items.length === 0) return null;
          return (
            <section key={section}>
              <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {ENTRY_KIND_LABEL[section]}
              </h2>
              <ul className="mt-2 space-y-1.5">
                {items.map((entry) => (
                  <li key={entry.id} className="panel rounded-lg p-3 text-sm">
                    {entry.content}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {memories && memories.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Memory in this pillar
          </h2>
          <ul className="mt-2 space-y-1.5">
            {memories.slice(0, 10).map((memory) => (
              <li key={memory.id} className="text-sm text-muted-foreground">
                <span className="text-foreground">{memory.title}</span> — {memory.content}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
