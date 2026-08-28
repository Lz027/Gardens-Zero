import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { StickyNote, Plus } from "lucide-react";
import { PILLARS, PILLAR_META } from "@/lib/pillars";
import { usePillarEntries } from "@/lib/queries";
import { useCreateNote, useNotes, useUpdateNote } from "@/lib/desk-queries";
import { NoteWindow } from "@/components/gardens/note-window";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Desk — Gardens Zero" },
      {
        name: "description",
        content: "Your digital notepad desktop: floating notes, apps, and the four pillars.",
      },
      { property: "og:title", content: "Desk — Gardens Zero" },
      {
        property: "og:description",
        content: "Your digital notepad desktop: floating notes, apps, and the four pillars.",
      },
    ],
  }),
  component: Desk,
});

function Desk() {
  const canvas = useRef<HTMLDivElement | null>(null);
  const { data: notes } = useNotes();
  const { data: entries } = usePillarEntries();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  const open = (notes ?? []).filter((n) => n.is_open && !n.is_minimized);
  const minimized = (notes ?? []).filter((n) => n.is_open && n.is_minimized);
  const topZ = Math.max(1, ...(notes ?? []).map((n) => n.z_index));

  function newNote() {
    const offset = ((notes?.length ?? 0) % 6) * 28;
    createNote.mutate({
      pos_x: 60 + offset,
      pos_y: 60 + offset,
      z_index: topZ + 1,
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <Button size="sm" onClick={newNote}>
          <Plus className="size-4" /> New note
        </Button>
        <span className="text-xs text-muted-foreground">
          {open.length} open · {(notes?.length ?? 0)} total
        </span>
      </div>

      <div ref={canvas} className="relative min-h-0 flex-1 overflow-hidden">
        {open.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <StickyNote className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              An empty desk. Open a note and start writing.
            </p>
            <Button variant="outline" size="sm" onClick={newNote}>
              New note
            </Button>
          </div>
        )}

        {open.map((note) => (
          <NoteWindow
            key={note.id}
            note={note}
            bounds={canvas}
            onFocus={() => {
              if (note.z_index < topZ) updateNote.mutate({ id: note.id, z_index: topZ + 1 });
            }}
          />
        ))}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            {minimized.map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => updateNote.mutate({ id: note.id, is_minimized: false })}
                className="panel rounded-lg px-2.5 py-1 text-xs"
              >
                {note.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-border p-3 lg:grid-cols-4">
        {PILLARS.map((pillar) => {
          const count = (entries ?? []).filter((e) => e.pillar === pillar).length;
          return (
            <Link
              key={pillar}
              to="/pillars/$pillar"
              params={{ pillar }}
              className="panel rounded-lg px-3 py-2 transition-colors hover:border-ring"
            >
              <div
                className={
                  PILLAR_META[pillar].accent === "iris"
                    ? "text-[11px] uppercase tracking-widest text-iris"
                    : "text-[11px] uppercase tracking-widest text-teal"
                }
              >
                {PILLAR_META[pillar].label}
              </div>
              <div className="text-xs text-muted-foreground">{count} entries</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
