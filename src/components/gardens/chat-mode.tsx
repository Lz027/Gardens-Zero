import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Plus, Search, SendHorizonal, Trash2, X } from "lucide-react";
import {
  useCreateThread,
  useDeleteMessage,
  useDeleteThread,
  useMessages,
  useSendMessage,
  useThreads,
  useUpdateThread,
  type Thread,
} from "@/lib/chat-queries";
import { PILLARS, PILLAR_META, type Pillar } from "@/lib/pillars";
import { useWallpaper } from "@/lib/wallpaper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function timeLabel(iso: string) {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { day: "numeric", month: "short" });
}

export function ChatMode() {
  const { data: threads } = useThreads();
  const createThread = useCreateThread();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [pillarFilter, setPillarFilter] = useState<Pillar | "all">("all");
  const { style } = useWallpaper();

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (threads ?? [])
      .filter((t) => (pillarFilter === "all" ? true : t.pillar === pillarFilter))
      .filter((t) => (q ? t.title.toLowerCase().includes(q) : true));
  }, [threads, query, pillarFilter]);

  const active = (threads ?? []).find((t) => t.id === activeId) ?? null;

  async function newChat() {
    const thread = await createThread.mutateAsync({
      pillar: pillarFilter === "all" ? null : pillarFilter,
    });
    if (thread) setActiveId(thread.id);
  }

  return (
    <div className="flex h-full min-h-0">
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

        <div className="flex gap-1.5 overflow-x-auto px-3 pb-2">
          {(["all", ...PILLARS] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setPillarFilter(key)}
              className={cn(
                "shrink-0 rounded-full border border-border px-2.5 py-1 text-[11px] transition-colors",
                pillarFilter === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {key === "all" ? "All" : PILLAR_META[key].label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {list.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No chats here yet. Start one and write like you're messaging yourself.
            </p>
          )}
          {list.map((thread) => (
            <ThreadRow
              key={thread.id}
              thread={thread}
              active={thread.id === activeId}
              onOpen={() => setActiveId(thread.id)}
            />
          ))}
        </div>
      </aside>

      <section
        className={cn("flex min-h-0 min-w-0 flex-1 flex-col", !active && "hidden md:flex")}
        style={style}
      >
        {active ? (
          <Conversation key={active.id} thread={active} onBack={() => setActiveId(null)} />
        ) : (
          <div className="grid flex-1 place-items-center px-6 text-center">
            <p className="max-w-xs text-sm text-muted-foreground">
              Pick a chat, or start a new one. Chats are for quick thinking in a line; notes are
              your open whiteboard.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function ThreadRow({
  thread,
  active,
  onOpen,
}: {
  thread: Thread;
  active: boolean;
  onOpen: () => void;
}) {
  const meta = thread.pillar ? PILLAR_META[thread.pillar as Pillar] : null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex w-full items-start gap-3 border-b border-border/60 px-3 py-3 text-left transition-colors hover:bg-accent/60",
        active && "bg-accent",
      )}
    >
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-iris/15 text-xs font-semibold text-iris">
        {thread.title.slice(0, 2).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{thread.title}</span>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {timeLabel(thread.updated_at)}
          </span>
        </span>
        {meta && (
          <span
            className={cn(
              "mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]",
              meta.accent === "iris" ? "bg-iris/15 text-iris" : "bg-teal/15 text-teal",
            )}
          >
            {meta.label}
          </span>
        )}
      </span>
    </button>
  );
}

function Conversation({ thread, onBack }: { thread: Thread; onBack: () => void }) {
  const updateThread = useUpdateThread();
  const deleteThread = useDeleteThread();
  const send = useSendMessage();
  const removeMessage = useDeleteMessage();
  const { data: messages } = useMessages(thread.id);
  const [draft, setDraft] = useState("");
  const bottom = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [thread.id, messages?.length]);

  function submit() {
    const text = draft.trim();
    if (!text) return;
    send.mutate({ threadId: thread.id, text });
    setDraft("");
  }

  return (
    <>
      <header className="flex items-center gap-2 border-b border-border bg-card/80 px-3 py-2 backdrop-blur">
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={onBack}
          aria-label="Back to chats"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-iris/15 text-[11px] font-semibold text-iris">
          {thread.title.slice(0, 2).toUpperCase()}
        </span>
        <input
          value={thread.title}
          onChange={(e) => updateThread.mutate({ id: thread.id, title: e.target.value })}
          aria-label="Chat name"
          className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"
        />
        <select
          value={thread.pillar ?? ""}
          onChange={(e) =>
            updateThread.mutate({
              id: thread.id,
              pillar: (e.target.value || null) as Pillar | null,
            })
          }
          aria-label="File this chat under a pillar"
          className="h-8 rounded-md border border-input bg-card px-2 text-xs text-foreground"
        >
          <option value="">No pillar</option>
          {PILLARS.map((p) => (
            <option key={p} value={p}>
              {PILLAR_META[p].label}
            </option>
          ))}
        </select>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            deleteThread.mutate(thread.id);
            onBack();
          }}
          aria-label="Delete chat"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </header>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {(messages ?? []).length === 0 && (
          <p className="py-10 text-center text-xs text-muted-foreground">
            No messages yet — say something to yourself.
          </p>
        )}
        {(messages ?? []).map((message) => (
          <div key={message.id} className="group flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => removeMessage.mutate({ id: message.id, threadId: thread.id })}
              aria-label="Delete message"
              className="rounded-full p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
            <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground shadow-sm sm:max-w-[70%]">
              {message.text_content}
              <span className="mt-1 block text-right text-[10px] text-primary-foreground/70">
                {timeLabel(message.created_at)}
              </span>
            </p>
          </div>
        ))}
        <div ref={bottom} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-end gap-2 border-t border-border bg-card/80 p-2 backdrop-blur"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
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
