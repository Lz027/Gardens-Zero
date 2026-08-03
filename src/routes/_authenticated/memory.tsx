import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pin, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMemories, useInvalidate } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PILLARS, MEMORY_TYPE_LABEL, type MemoryType } from "@/lib/pillars";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/memory")({
  head: () => ({
    meta: [
      { title: "Memory core — Gardens Zero" },
      { name: "description", content: "Everything Zero remembers about you, in one place." },
      { property: "og:title", content: "Memory core — Gardens Zero" },
      {
        property: "og:description",
        content: "Everything Zero remembers about you, in one place.",
      },
    ],
  }),
  component: MemoryPage,
});

function MemoryPage() {
  const [search, setSearch] = useState("");
  const [pillar, setPillar] = useState<"all" | (typeof PILLARS)[number]>("all");
  const { data: memories } = useMemories({ pillar, search });
  const invalidate = useInvalidate();

  async function togglePin(id: string, pinned: boolean) {
    await supabase.from("memory_entries").update({ pinned: !pinned }).eq("id", id);
    invalidate(["memories"]);
  }

  async function remove(id: string) {
    await supabase.from("memory_entries").delete().eq("id", id);
    invalidate(["memories"]);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        Memory <span className="text-gradient-iris">core</span>
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Grown automatically from your conversations with Zero.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search memory…"
          className="h-8 w-56"
        />
        {(["all", ...PILLARS] as const).map((option) => (
          <button
            key={option}
            onClick={() => setPillar(option)}
            className={cn(
              "rounded-full border border-border px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground",
              pillar === option && "bg-accent text-accent-foreground",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <ul className="mt-6 space-y-2">
        {(memories ?? []).map((memory) => (
          <li key={memory.id} className="panel rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{memory.title}</span>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {MEMORY_TYPE_LABEL[memory.type as MemoryType]}
                  </span>
                  {memory.pillar && (
                    <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-accent-foreground">
                      {memory.pillar}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{memory.content}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => togglePin(memory.id, memory.pinned)}
                  aria-label="Pin memory"
                >
                  <Pin className={cn("size-4", memory.pinned && "text-iris")} />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => remove(memory.id)}
                  aria-label="Delete memory"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </li>
        ))}
        {memories?.length === 0 && (
          <li className="text-sm text-muted-foreground">
            Nothing remembered yet. Talk to Zero and the core will fill itself.
          </li>
        )}
      </ul>
    </div>
  );
}
