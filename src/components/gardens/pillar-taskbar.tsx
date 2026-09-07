import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Info, Plus } from "lucide-react";
import { iconFor, accentText } from "@/lib/pillars";
import { usePillars, useCreatePillar } from "@/lib/pillar-queries";
import { useNotes } from "@/lib/desk-queries";
import { useThreads } from "@/lib/chat-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PillarIconPicker } from "@/components/gardens/pillar-icon-picker";
import { cn } from "@/lib/utils";

export function PillarTaskbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: pillars } = usePillars();
  const { data: notes } = useNotes();
  const { data: threads } = useThreads();
  const createPillar = useCreatePillar();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("Lightbulb");
  const [accent, setAccent] = useState<"iris" | "teal">("iris");

  async function add() {
    const name = label.trim();
    if (!name) return;
    await createPillar.mutateAsync({ label: name, icon, accent });
    setLabel("");
    setOpen(false);
  }

  return (
    <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-t border-border bg-card/50 px-2 py-2 backdrop-blur sm:px-3">
      <span className="hidden shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground sm:block">
        Folders
      </span>
      {(pillars ?? []).map((pillar) => {
        const Icon = iconFor(pillar.icon);
        const count =
          (notes ?? []).filter((n) => n.pillar === pillar.slug).length +
          (threads ?? []).filter((t) => t.pillar === pillar.slug).length;
        const active = pathname === `/pillars/${pillar.slug}`;
        return (
          <Link
            key={pillar.id}
            to="/pillars/$pillar"
            params={{ pillar: pillar.slug }}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-xs transition-colors hover:border-ring",
              active && "bg-accent",
            )}
          >
            <Icon className={cn("size-4 shrink-0", accentText(pillar.accent))} />
            <span className="max-w-28 truncate font-medium">{pillar.label}</span>
            <span className="rounded bg-muted px-1.5 text-[10px] text-muted-foreground">
              {count}
            </span>
          </Link>
        );
      })}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
            <Plus className="size-4" /> Folder
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
            <DialogDescription>
              Systems, Career, Projects and Academics come ready-made — rename them, swap their
              icon, delete them, or add your own here.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Folder name"
              onKeyDown={(e) => e.key === "Enter" && void add()}
            />
            <PillarIconPicker icon={icon} accent={accent} onIcon={setIcon} onAccent={setAccent} />
            <Button className="w-full" onClick={() => void add()} disabled={!label.trim()}>
              Create folder
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <span className="ml-auto hidden shrink-0 items-center gap-1.5 text-[10px] text-muted-foreground lg:flex">
        <Info className="size-3" /> The first four folders are ready-made — rename or replace them
        any time
      </span>
    </div>
  );
}
