import { useEffect, useRef, useState } from "react";
import { Minus, X } from "lucide-react";
import { useDeleteNote, useUpdateNote, type Note } from "@/lib/desk-queries";
import { cn } from "@/lib/utils";

type Geometry = { pos_x: number; pos_y: number; width: number; height: number };

export function NoteWindow({
  note,
  onFocus,
  bounds,
}: {
  note: Note;
  onFocus: () => void;
  bounds: React.RefObject<HTMLDivElement | null>;
}) {
  const update = useUpdateNote();
  const remove = useDeleteNote();

  const [geo, setGeo] = useState<Geometry>({
    pos_x: note.pos_x,
    pos_y: note.pos_y,
    width: note.width,
    height: note.height,
  });
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const drag = useRef<{ mode: "move" | "resize"; x: number; y: number; geo: Geometry } | null>(null);

  useEffect(() => {
    setGeo({ pos_x: note.pos_x, pos_y: note.pos_y, width: note.width, height: note.height });
  }, [note.pos_x, note.pos_y, note.width, note.height]);

  // autosave text
  useEffect(() => {
    if (title === note.title && body === note.body) return;
    const t = setTimeout(() => update.mutate({ id: note.id, title, body }), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body]);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      const limit = bounds.current?.getBoundingClientRect();
      if (d.mode === "move") {
        setGeo({
          ...d.geo,
          pos_x: Math.max(0, Math.min((limit?.width ?? 2000) - 120, d.geo.pos_x + dx)),
          pos_y: Math.max(0, Math.min((limit?.height ?? 2000) - 48, d.geo.pos_y + dy)),
        });
      } else {
        setGeo({
          ...d.geo,
          width: Math.max(240, d.geo.width + dx),
          height: Math.max(160, d.geo.height + dy),
        });
      }
    }
    function onUp() {
      if (!drag.current) return;
      drag.current = null;
      update.mutate({ id: note.id, ...geo });
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [geo, note.id, bounds, update]);

  function start(mode: "move" | "resize", e: React.PointerEvent) {
    e.preventDefault();
    onFocus();
    drag.current = { mode, x: e.clientX, y: e.clientY, geo };
  }

  if (note.is_minimized) return null;

  return (
    <div
      className="panel absolute flex flex-col overflow-hidden rounded-xl shadow-xl"
      style={{
        left: geo.pos_x,
        top: geo.pos_y,
        width: geo.width,
        height: geo.height,
        zIndex: note.z_index,
      }}
      onPointerDown={onFocus}
    >
      <div
        onPointerDown={(e) => start("move", e)}
        className="flex cursor-grab items-center gap-2 border-b border-border bg-card/80 px-2.5 py-1.5 active:cursor-grabbing"
      >
        <span className="size-2 rounded-full bg-iris" />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
          className="min-w-0 flex-1 bg-transparent text-xs font-medium outline-none"
          aria-label="Note title"
        />
        <button
          type="button"
          aria-label="Minimise note"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => update.mutate({ id: note.id, is_minimized: true })}
          className="text-muted-foreground hover:text-foreground"
        >
          <Minus className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Delete note"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => remove.mutate(note.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Start typing…"
        className="flex-1 resize-none bg-transparent p-3 text-sm leading-relaxed outline-none"
      />
      <div
        onPointerDown={(e) => start("resize", e)}
        className={cn(
          "absolute bottom-0 right-0 size-4 cursor-se-resize",
          "bg-[linear-gradient(135deg,transparent_50%,var(--color-border)_50%)]",
        )}
      />
    </div>
  );
}
