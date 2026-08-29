import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { StickyNote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePillarEntries, useInvalidate, currentUserId } from "@/lib/queries";
import { useCreateNote, useNotes, useUpdateNote } from "@/lib/desk-queries";
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
      { title: "Pillar folder — Gardens Zero" },
      { name: "description", content: "Notes and progress filed under one premade pillar." },
      { property: "og:title", content: "Pillar folder — Gardens Zero" },
      {
        property: "og:description",
        content: "Notes and progress filed under one premade pillar.",
      },
    ],
  }),
  component: PillarPage,
});

function PillarPage() {
  const { pillar } = Route.useParams();
  if (!isPillar(pillar)) throw notFound();
  return <PillarBody key={pillar} pillar={pillar} />;
}

function PillarBody({ pillar }: { pillar: Pillar }) {
  const meta = PILLAR_META[pillar];
  const Icon = meta.icon;
  const navigate = useNavigate();
  const { data: entries } = usePillarEntries(pillar);
  const { data: notes } = useNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const invalidate = useInvalidate();
  const [kind, setKind] = useState<EntryKind>("done");
  const [content, setContent] = useState("");

  const filed = (notes ?? []).filter((n) => n.pillar === pillar);

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

  async function newNoteHere() {
    await createNote.mutateAsync({ pillar, title: `${meta.label} note` });
    navigate({ to: "/home" });
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="flex items-start gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-card">
          <Icon className={meta.accent === "iris" ? "size-5 text-iris" : "size-5 text-teal"} />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{meta.label}</h1>
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              Premade
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{meta.blurb}</p>
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Notes in this folder ({filed.length})
          </h2>
          <Button size="sm" variant="outline" onClick={() => void newNoteHere()}>
            <StickyNote className="size-4" /> New note here
          </Button>
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {filed.map((note) => (
            <li key={note.id} className="panel rounded-lg p-3">
              <div className="text-sm font-medium">{note.title}</div>
              <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs text-muted-foreground">
                {note.body || "Empty note"}
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    updateNote.mutate({ id: note.id, is_open: true, is_minimized: false });
                    navigate({ to: "/home" });
                  }}
                >
                  Open on desk
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => updateNote.mutate({ id: note.id, pillar: null })}
                >
                  Unfile
                </Button>
              </div>
            </li>
          ))}
          {filed.length === 0 && (
            <li className="text-sm text-muted-foreground">
              No notes filed here yet. Label a note with {meta.label} and it lands in this folder.
            </li>
          )}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground">Progress</h2>
        <div className="mt-3 flex flex-wrap gap-2">
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
            placeholder="Log progress…"
            className="h-9 min-w-0 flex-1"
          />
          <Button onClick={() => void addEntry()}>Add</Button>
        </div>

        <div className="mt-6 space-y-6">
          {ENTRY_KINDS.map((section) => {
            const items = (entries ?? []).filter((entry) => entry.kind === section);
            if (items.length === 0) return null;
            return (
              <div key={section}>
                <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {ENTRY_KIND_LABEL[section]}
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {items.map((entry) => (
                    <li key={entry.id} className="panel rounded-lg p-3 text-sm">
                      {entry.content}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
