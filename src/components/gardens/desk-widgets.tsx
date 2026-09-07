import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Clock, ListChecks, Plus, Rocket, StickyNote, X } from "lucide-react";
import { format } from "date-fns";
import { MonthGrid } from "@/components/gardens/month-grid";
import { useEvents } from "@/lib/queries";
import { usePillars } from "@/lib/pillar-queries";
import { iconFor } from "@/lib/pillars";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type WidgetKind = "calendar" | "clock" | "agenda" | "shortcuts";
type Widget = { id: string; kind: WidgetKind; x: number; y: number };

const STORAGE_KEY = "gz:desk-widgets";

export const WIDGET_CATALOG: { kind: WidgetKind; label: string; icon: typeof Clock }[] = [
  { kind: "calendar", label: "Calendar", icon: CalendarDays },
  { kind: "clock", label: "Clock", icon: Clock },
  { kind: "agenda", label: "Up next", icon: ListChecks },
  { kind: "shortcuts", label: "Shortcuts", icon: Rocket },
];

function load(): Widget[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Widget[]) : [];
  } catch {
    return [];
  }
}

/** Widget layer for the desk: draggable cards the user adds themselves. */
export function DeskWidgets({
  bounds,
  onNewNote,
}: {
  bounds: React.RefObject<HTMLDivElement | null>;
  onNewNote: () => void;
}) {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const hydrated = useRef(false);

  useEffect(() => {
    setWidgets(load());
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  }, [widgets]);

  function add(kind: WidgetKind) {
    setWidgets((w) => [
      ...w,
      {
        id: `${kind}-${Date.now()}`,
        kind,
        x: 180 + (w.length % 4) * 36,
        y: 60 + (w.length % 4) * 36,
      },
    ]);
  }

  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        {widgets.map((widget) => (
          <WidgetCard
            key={widget.id}
            widget={widget}
            bounds={bounds}
            onMove={(x, y) =>
              setWidgets((all) => all.map((w) => (w.id === widget.id ? { ...w, x, y } : w)))
            }
            onRemove={() => setWidgets((all) => all.filter((w) => w.id !== widget.id))}
            onNewNote={onNewNote}
          />
        ))}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="panel absolute right-3 top-12 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3.5" /> Add widget
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {WIDGET_CATALOG.map((item) => (
            <DropdownMenuItem key={item.kind} onSelect={() => add(item.kind)}>
              <item.icon className="size-4" /> {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function WidgetCard({
  widget,
  bounds,
  onMove,
  onRemove,
  onNewNote,
}: {
  widget: Widget;
  bounds: React.RefObject<HTMLDivElement | null>;
  onMove: (x: number, y: number) => void;
  onRemove: () => void;
  onNewNote: () => void;
}) {
  const [pos, setPos] = useState({ x: widget.x, y: widget.y });
  const drag = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const latest = useRef(pos);
  latest.current = pos;

  useEffect(() => {
    function move(e: PointerEvent) {
      const d = drag.current;
      if (!d) return;
      const limit = bounds.current?.getBoundingClientRect();
      const x = Math.max(0, Math.min((limit?.width ?? 1400) - 120, d.ox + e.clientX - d.px));
      const y = Math.max(0, Math.min((limit?.height ?? 900) - 60, d.oy + e.clientY - d.py));
      setPos({ x, y });
    }
    function up() {
      if (!drag.current) return;
      drag.current = null;
      onMove(Math.round(latest.current.x), Math.round(latest.current.y));
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const meta = WIDGET_CATALOG.find((c) => c.kind === widget.kind)!;

  return (
    <div
      style={{ left: pos.x, top: pos.y }}
      className={cn(
        "soft-card pointer-events-auto absolute rounded-xl border border-border bg-card/95 shadow-sm backdrop-blur",
        widget.kind === "calendar" ? "w-64" : "w-52",
      )}
    >
      <div
        onPointerDown={(e) => {
          e.preventDefault();
          drag.current = { px: e.clientX, py: e.clientY, ox: pos.x, oy: pos.y };
        }}
        className="flex cursor-grab items-center gap-2 border-b border-border px-3 py-1.5 active:cursor-grabbing"
      >
        <meta.icon className="size-3.5 text-teal" />
        <span className="min-w-0 flex-1 truncate text-[11px] uppercase tracking-wide text-muted-foreground">
          {meta.label}
        </span>
        <button
          type="button"
          aria-label={`Remove ${meta.label} widget`}
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="p-3">
        <WidgetBody kind={widget.kind} onNewNote={onNewNote} />
      </div>
    </div>
  );
}

function WidgetBody({ kind, onNewNote }: { kind: WidgetKind; onNewNote: () => void }) {
  if (kind === "calendar") return <CalendarWidget />;
  if (kind === "clock") return <ClockWidget />;
  if (kind === "agenda") return <AgendaWidget />;
  return <ShortcutsWidget onNewNote={onNewNote} />;
}

function CalendarWidget() {
  const { data: events } = useEvents();
  return (
    <MonthGrid
      compact
      events={(events ?? []).map((e) => ({ id: e.id, title: e.title, starts_at: e.starts_at }))}
    />
  );
}

function ClockWidget() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-center">
      <div className="text-3xl font-semibold tracking-tight">{format(now, "HH:mm")}</div>
      <div className="text-xs text-muted-foreground">{format(now, "EEEE d MMMM")}</div>
    </div>
  );
}

function AgendaWidget() {
  const { data: events } = useEvents();
  const upcoming = (events ?? [])
    .filter((e) => new Date(e.starts_at).getTime() >= Date.now() - 3600_000)
    .slice(0, 4);
  return (
    <div className="space-y-1.5">
      {upcoming.map((e) => (
        <div key={e.id} className="flex items-center gap-2 text-xs">
          <span className="shrink-0 text-muted-foreground">
            {format(new Date(e.starts_at), "d MMM HH:mm")}
          </span>
          <span className="min-w-0 flex-1 truncate">{e.title}</span>
        </div>
      ))}
      {upcoming.length === 0 && <p className="text-xs text-muted-foreground">Nothing coming up.</p>}
    </div>
  );
}

function ShortcutsWidget({ onNewNote }: { onNewNote: () => void }) {
  const { data: pillars } = usePillars();
  return (
    <div className="space-y-1">
      <Button size="sm" variant="outline" className="w-full justify-start" onClick={onNewNote}>
        <StickyNote className="size-3.5" /> New note
      </Button>
      <Link
        to="/calendar"
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <CalendarDays className="size-3.5" /> Calendar
      </Link>
      {(pillars ?? []).slice(0, 4).map((pillar) => {
        const Icon = iconFor(pillar.icon);
        return (
          <Link
            key={pillar.id}
            to="/pillars/$pillar"
            params={{ pillar: pillar.slug }}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Icon className="size-3.5" />
            <span className="min-w-0 flex-1 truncate">{pillar.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
