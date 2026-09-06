import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Plus, Search, SendHorizonal, Trash2 } from "lucide-react";
import { useCreateNote, useDeleteNote, useNotes, useUpdateNote, type Note } from "@/lib/desk-queries";
import { useWallpaper } from "@/lib/wallpaper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** A note's body rendered as chat bubbles: one bubble per non-empty line. */
function toMessages(body: string) {
  return body.split("\n").filter((line) => line.trim().length > 0);
}

function preview(note: Note) {
  const messages = toMessages(note.body);
  return messages[messages.length - 1] ?? "No messages yet";
}

function timeLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { day: "numeric", month: "short" });
}

export function ChatMode() {
  const { data: notes } = useNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const { style } = useWallpaper();

  const list = useMemo(() => {
    const rows = (notes ?? []).slice().sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    const q = query.trim().toLowerCase();
    return q
      ? rows.filter((n) => `${n.title} ${n.body}`.toLowerCase().includes(q))
      : rows;
  }, [notes, query]);

  const active = list.find((n) => n.id === activeId) ?? (notes ?? []).find((n) => n.id === activeId) ?? null;

  async function newChat() {
    const created = await createNote.mutateAsync({ title: "New chat" });
    const note = (created as Note[])[0];
    if (note) setActiveId(note.id);
  }

  return (
    <div className="flex h-full min-h-0">
      {/* Chat list — full width on mobile until a chat is opened */}
      <aside
        className={cn(
          "flex min-h-0 w-full flex-col border-r border-border bg-card/60 backdrop-blur md:w-80 md:shrink-0",
          active && "hidden md:flex",
        )}
      >
        <div className="flex items-center gap-2 px-3 py-2.5">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats"
              className="h-9 pl-8"
            />
          </div>
          <Button size="icon-sm" onClick={() => void newChat()} aria-label="New chat">
            <Plus className="size-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {list.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No chats yet. Start one and write like you're messaging yourself.
            </p>
          )}
          {list.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => setActiveId(note.id)}
              className={cn(
                "flex w-full items-start gap-3 border-b border-border/60 px-3 py-3 text-left transition-colors hover:bg-accent/60",
                note.id === activeId && "bg-accent",
              )}
            >
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-iris/15 text-xs font-semibold text-iris">
                {note.title.slice(0, 2).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{note.title}</span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {timeLabel(note.updated_at)}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {preview(note)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* Conversation */}
      <section
        className={cn("flex min-h-0 min-w-0 flex-1 flex-col", !active && "hidden md:flex")}
        style={style}
      >
        {active ? (
          <Conversation
            note={active}
            onBack={() => setActiveId(null)}
            onRename={(title) => updateNote.mutate({ id: active.id, title })}
          />
        ) : (
          <div className="grid flex-1 place-items-center px-6 text-center">
            <p className="max-w-xs text-sm text-muted-foreground">
              Pick a chat on the left, or start a new one. Every message you send is saved as a
              line in that note.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function Conversation({
  note,
  onBack,
  onRename,
}: {
  note: Note;
  onBack: () => void;
  onRename: (title: string) => void;
}) {
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const [draft, setDraft] = useState("");
  const bottom = useRef<HTMLDivElement | null>(null);
  const messages = toMessages(note.body);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [note.id, note.body]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    const body = note.body ? `${note.body}\n${text}` : text;
    updateNote.mutate({ id: note.id, body });
    setDraft("");
  }

  return (
    <>
      <header className="flex items-center gap-2 border-b border-border bg-card/80 px-3 py-2 backdrop-blur">
        <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={onBack} aria-label="Back to chats">
          <ArrowLeft className="size-4" />
        </Button>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-iris/15 text-[11px] font-semibold text-iris">
          {note.title.slice(0, 2).toUpperCase()}
        </span>
        <input
          value={note.title}
          onChange={(e) => onRename(e.target.value)}
          aria-label="Chat name"
          className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            deleteNote.mutate(note.id);
            onBack();
          }}
          aria-label="Move chat to recycle bin"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </header>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {messages.length === 0 && (
          <p className="py-10 text-center text-xs text-muted-foreground">
            No messages yet — say something to yourself.
          </p>
        )}
        {messages.map((message, index) => (
          <div key={index} className="flex justify-end">
            <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground shadow-sm sm:max-w-[70%]">
              {message}
            </p>
          </div>
        ))}
        <div ref={bottom} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-end gap-2 border-t border-border bg-card/80 p-2 backdrop-blur"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Write a message"
          aria-label="Message"
          className="max-h-32 min-h-10 min-w-0 flex-1 resize-none rounded-2xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" size="icon" aria-label="Send" disabled={!draft.trim()}>
          <SendHorizonal className="size-4" />
        </Button>
      </form>
    </>
  );
}
