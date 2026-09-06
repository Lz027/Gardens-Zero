import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { StickyNote, Plus, MessageSquare, LayoutDashboard } from "lucide-react";
import { useCreateNote, useNotes, useUpdateNote } from "@/lib/desk-queries";
import { NoteWindow } from "@/components/gardens/note-window";
import { DesktopItems, NotepadGlyph } from "@/components/gardens/desktop-items";
import { ChatMode } from "@/components/gardens/chat-mode";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWallpaper } from "@/lib/wallpaper";
import { cn } from "@/lib/utils";

const MODE_KEY = "gz:workspace-mode";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Desk — Gardens Zero" },
      {
        name: "description",
        content:
          "Your notes desk and chat: floating note windows on desktop, WhatsApp-style chat notes on mobile.",
      },
      { property: "og:title", content: "Desk — Gardens Zero" },
      {
        property: "og:description",
        content:
          "Your notes desk and chat: floating note windows on desktop, WhatsApp-style chat notes on mobile.",
      },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<"desk" | "chat">("desk");

  useEffect(() => {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === "desk" || stored === "chat") setMode(stored);
    else if (window.innerWidth < 768) setMode("chat");
  }, []);

  function pick(next: "desk" | "chat") {
    setMode(next);
    localStorage.setItem(MODE_KEY, next);
  }

  // Floating note windows need a pointer + room; on phones the chat is the desk.
  const effective = isMobile ? "chat" : mode;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <div className="hidden items-center gap-1 rounded-full border border-border p-0.5 md:flex">
          {(
            [
              { id: "desk", label: "Desk", icon: LayoutDashboard },
              { id: "chat", label: "Chat", icon: MessageSquare },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => pick(item.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors",
                effective === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground md:hidden">Chat notes</span>
      </div>

      <div className="min-h-0 flex-1">{effective === "chat" ? <ChatMode /> : <Desk />}</div>
    </div>
  );
}

function Desk() {
  const canvas = useRef<HTMLDivElement | null>(null);
  const { data: notes } = useNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const { style } = useWallpaper();

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
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <Button size="sm" onClick={newNote}>
          <Plus className="size-4" /> New note
        </Button>
        <span className="text-xs text-muted-foreground">
          {open.length} open · {notes?.length ?? 0} total
        </span>
      </div>

      <div ref={canvas} className="relative min-h-0 flex-1 overflow-hidden" style={style}>
        <DesktopItems bounds={canvas} />

        {open.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <StickyNote className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              An empty desk. Open a note and start writing.
            </p>
            <Button variant="outline" size="sm" onClick={newNote} className="pointer-events-auto">
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
                title={note.title}
                className="flex w-32 items-center gap-2 rounded-md border border-iris/40 bg-iris/10 px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-iris/70 hover:bg-iris/20 hover:text-foreground"
              >
                <NotepadGlyph className="size-4 opacity-70" />
                <span className="min-w-0 flex-1 truncate">{note.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
