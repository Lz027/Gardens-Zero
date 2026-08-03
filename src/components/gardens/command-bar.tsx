import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Brain, CalendarDays, LayoutDashboard, MessagesSquare, Boxes } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useMemories, useThreads } from "@/lib/queries";
import { PILLARS, PILLAR_META } from "@/lib/pillars";

export function CommandBar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: threads } = useThreads();
  const { data: memories } = useMemories({ search });

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const go = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search threads, memory, pillars…"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Nothing found in the garden.</CommandEmpty>

        <CommandGroup heading="Go to">
          <CommandItem onSelect={() => go(() => navigate({ to: "/home" }))}>
            <LayoutDashboard className="size-4" /> Overview
          </CommandItem>
          <CommandItem onSelect={() => go(() => navigate({ to: "/chat" }))}>
            <MessagesSquare className="size-4" /> Zero chat
          </CommandItem>
          <CommandItem onSelect={() => go(() => navigate({ to: "/memory" }))}>
            <Brain className="size-4" /> Memory core
          </CommandItem>
          <CommandItem onSelect={() => go(() => navigate({ to: "/calendar" }))}>
            <CalendarDays className="size-4" /> Calendar
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Pillars">
          {PILLARS.map((pillar) => (
            <CommandItem
              key={pillar}
              onSelect={() =>
                go(() => navigate({ to: "/pillars/$pillar", params: { pillar } }))
              }
            >
              <Boxes className="size-4" /> {PILLAR_META[pillar].label}
            </CommandItem>
          ))}
        </CommandGroup>

        {threads && threads.length > 0 && (
          <CommandGroup heading="Threads">
            {threads.slice(0, 8).map((thread) => (
              <CommandItem
                key={thread.id}
                value={`thread ${thread.title}`}
                onSelect={() =>
                  go(() =>
                    navigate({ to: "/chat/$threadId", params: { threadId: thread.id } }),
                  )
                }
              >
                <MessagesSquare className="size-4" /> {thread.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {memories && memories.length > 0 && (
          <CommandGroup heading="Memory">
            {memories.slice(0, 6).map((memory) => (
              <CommandItem
                key={memory.id}
                value={`memory ${memory.title} ${memory.content}`}
                onSelect={() => go(() => navigate({ to: "/memory" }))}
              >
                <Brain className="size-4" /> {memory.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
