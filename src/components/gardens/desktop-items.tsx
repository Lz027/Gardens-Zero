import { useEffect, useRef, useState } from "react";
import { Folder, FolderPlus, RotateCcw, Trash2 } from "lucide-react";
import {
  useCreateNoteFolder,
  useDeleteNoteFolder,
  useNoteFolders,
  useNotes,
  usePurgeNote,
  useRestoreNote,
  useTrashedNotes,
  useUpdateNote,
  useUpdateNoteFolder,
  type Note,
  type NoteFolder,
} from "@/lib/desk-queries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Draggable desktop icons: one recycle bin plus any number of note folders. */
export function DesktopItems({ bounds }: { bounds: React.RefObject<HTMLDivElement | null> }) {
  const { data: folders } = useNoteFolders();
  const { data: notes } = useNotes();
  const createFolder = useCreateNoteFolder();
  const seeded = useRef(false);

  const [openFolder, setOpenFolder] = useState<NoteFolder | null>(null);
  const [binOpen, setBinOpen] = useState(false);

  // one default folder on the desk the first time round
  useEffect(() => {
    if (!folders || seeded.current) return;
    if (folders.length === 0) {
      seeded.current = true;
      createFolder.mutate({ name: "My Notes", pos_x: 24, pos_y: 24 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folders]);

  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        <div className="pointer-events-auto">
          <BinIcon onOpen={() => setBinOpen(true)} />
          {(folders ?? []).map((folder) => (
            <FolderIcon
              key={folder.id}
              folder={folder}
              count={(notes ?? []).filter((n) => n.folder_id === folder.id).length}
              bounds={bounds}
              onOpen={() => setOpenFolder(folder)}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          createFolder.mutate({
            name: "New folder",
            pos_x: 24,
            pos_y: 24 + ((folders?.length ?? 0) % 6) * 104,
          })
        }
        className="panel absolute right-3 top-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <FolderPlus className="size-3.5" /> New folder
      </button>

      <FolderDialog folder={openFolder} onClose={() => setOpenFolder(null)} />
      <BinDialog open={binOpen} onOpenChange={setBinOpen} />
    </>
  );
}

function useIconDrag(
  bounds: React.RefObject<HTMLDivElement | null>,
  pos: { x: number; y: number },
  onEnd: (p: { x: number; y: number }) => void,
) {
  const [p, setP] = useState(pos);
  const state = useRef<{ x: number; y: number; start: { x: number; y: number } } | null>(null);
  const latest = useRef(p);
  latest.current = p;
  const moved = useRef(false);

  useEffect(() => {
    if (!state.current) setP(pos);
  }, [pos.x, pos.y]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const s = state.current;
      if (!s) return;
      const limit = bounds.current?.getBoundingClientRect();
      const nx = Math.max(0, Math.min((limit?.width ?? 1600) - 80, s.start.x + e.clientX - s.x));
      const ny = Math.max(0, Math.min((limit?.height ?? 1200) - 80, s.start.y + e.clientY - s.y));
      if (Math.abs(nx - s.start.x) + Math.abs(ny - s.start.y) > 3) moved.current = true;
      setP({ x: nx, y: ny });
    }
    function onUp() {
      if (!state.current) return;
      state.current = null;
      onEnd(latest.current);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    pos: p,
    moved,
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      moved.current = false;
      state.current = { x: e.clientX, y: e.clientY, start: latest.current };
    },
  };
}

function FolderIcon({
  folder,
  count,
  bounds,
  onOpen,
}: {
  folder: NoteFolder;
  count: number;
  bounds: React.RefObject<HTMLDivElement | null>;
  onOpen: () => void;
}) {
  const updateFolder = useUpdateNoteFolder();
  const { pos, moved, onPointerDown } = useIconDrag(
    bounds,
    { x: folder.pos_x, y: folder.pos_y },
    (p) => updateFolder.mutate({ id: folder.id, pos_x: Math.round(p.x), pos_y: Math.round(p.y) }),
  );

  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onClick={() => {
        if (!moved.current) onOpen();
      }}
      style={{ left: pos.x, top: pos.y }}
      className="glow-edge absolute flex w-20 flex-col items-center gap-1 rounded-xl p-2 text-center"
    >
      <span className="relative flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-card">
        <Folder className="size-6 text-iris" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-teal px-1.5 text-[10px] text-background">
            {count}
          </span>
        )}
      </span>
      <span className="w-full truncate text-[11px] text-foreground">{folder.name}</span>
    </button>
  );
}

function BinIcon({ onOpen }: { onOpen: () => void }) {
  const { data: trashed } = useTrashedNotes();
  return (
    <button
      type="button"
      onClick={onOpen}
      className="glow-edge absolute bottom-16 right-4 flex w-20 flex-col items-center gap-1 rounded-xl p-2"
    >
      <span className="relative flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-card">
        <Trash2 className="size-6 text-muted-foreground" />
        {(trashed?.length ?? 0) > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-iris px-1.5 text-[10px] text-iris-foreground">
            {trashed?.length}
          </span>
        )}
      </span>
      <span className="text-[11px] text-foreground">Recycle bin</span>
    </button>
  );
}

function FolderDialog({ folder, onClose }: { folder: NoteFolder | null; onClose: () => void }) {
  const { data: notes } = useNotes();
  const updateNote = useUpdateNote();
  const updateFolder = useUpdateNoteFolder();
  const deleteFolder = useDeleteNoteFolder();

  if (!folder) return null;
  const inside = (notes ?? []).filter((n) => n.folder_id === folder.id);
  const outside = (notes ?? []).filter((n) => n.folder_id !== folder.id);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <input
              value={folder.name}
              onChange={(e) => updateFolder.mutate({ id: folder.id, name: e.target.value })}
              className="w-full bg-transparent outline-none"
              aria-label="Folder name"
            />
          </DialogTitle>
          <DialogDescription>Notes kept in this desktop folder.</DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          {inside.length === 0 && <p className="text-sm text-muted-foreground">Empty folder.</p>}
          {inside.map((note) => (
            <NoteRow key={note.id} note={note}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateNote.mutate({ id: note.id, folder_id: null })}
              >
                Move out
              </Button>
            </NoteRow>
          ))}
        </div>

        {outside.length > 0 && (
          <div className="space-y-1 border-t border-border pt-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Add a note
            </p>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {outside.map((note) => (
                <NoteRow key={note.id} note={note}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateNote.mutate({ id: note.id, folder_id: folder.id })}
                  >
                    Add
                  </Button>
                </NoteRow>
              ))}
            </div>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
          onClick={() => {
            deleteFolder.mutate(folder.id);
            onClose();
          }}
        >
          Delete folder
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function NoteRow({ note, children }: { note: Note; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-accent/50">
      <NotepadGlyph className="size-5 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-sm">{note.title}</span>
      {children}
    </div>
  );
}

function BinDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: trashed } = useTrashedNotes();
  const restore = useRestoreNote();
  const purge = usePurgeNote();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recycle bin</DialogTitle>
          <DialogDescription>Deleted notes rest here until you empty them.</DialogDescription>
        </DialogHeader>
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {(trashed ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">The bin is empty.</p>
          )}
          {(trashed ?? []).map((note) => (
            <NoteRow key={note.id} note={note}>
              <Button variant="ghost" size="icon-sm" aria-label="Restore note" onClick={() => restore.mutate(note.id)}>
                <RotateCcw className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete forever"
                className="text-destructive"
                onClick={() => purge.mutate(note.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </NoteRow>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Small notepad shape used for minimised notes and note rows. */
export function NotepadGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("shrink-0", className)}>
      <rect x="4" y="2.5" width="16" height="19" rx="3" className="fill-iris/25 stroke-iris/60" strokeWidth="1.2" />
      <path d="M8 8h8M8 12h8M8 16h5" className="stroke-teal/70" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
