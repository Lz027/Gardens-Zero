import { useMemo, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Check,
  ChevronsLeftRight,
  ChevronsRightLeft,
  Folder,
  Globe,
  Link2,
  Pencil,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Star,
  Trash2,
  Settings as SettingsIcon,
} from "lucide-react";
import { GardensWordmark } from "@/components/gardens/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useApps } from "@/lib/queries";
import {
  useCreateApp,
  useDeleteApp,
  useShareApp,
  useUpdateApp,
  type AppItem,
} from "@/lib/desk-queries";
import { resizeToAppIcon } from "@/lib/icon-image";
import { cn } from "@/lib/utils";

const MAX_APPS = 16;

type DockMode = "hidden" | "normal" | "wide";

export function AppDock() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: apps } = useApps();
  const [mode, setMode] = useState<DockMode>("normal");
  const expanded = mode === "wide";
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);

  const createApp = useCreateApp();
  const updateApp = useUpdateApp();
  const deleteApp = useDeleteApp();

  const all = (apps ?? []) as AppItem[];
  const roots = useMemo(() => all.filter((a) => !a.parent_id).slice(0, MAX_APPS), [all]);
  const childrenOf = (id: string) => all.filter((a) => a.parent_id === id);

  function toggleSelected(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function deleteSelected() {
    for (const id of selected) await deleteApp.mutateAsync(id);
    toast.success(`${selected.length} removed`);
    setSelected([]);
    setEditing(false);
  }

  async function handleDrop(target: AppItem) {
    const source = all.find((a) => a.id === dragId);
    setDragId(null);
    setDropId(null);
    if (!source || source.id === target.id || source.is_folder) return;

    if (target.is_folder) {
      await updateApp.mutateAsync({ id: source.id, parent_id: target.id });
      return;
    }
    const created = await createApp.mutateAsync({
      name: "Folder",
      url: "",
      is_folder: true,
      position: target.position,
    });
    const folder = created[0];
    if (!folder) return;
    await updateApp.mutateAsync({ id: target.id, parent_id: folder.id });
    await updateApp.mutateAsync({ id: source.id, parent_id: folder.id });
  }

  const desktopHidden = mode === "hidden";

  return (
    <>
      {desktopHidden && (
        <button
          type="button"
          onClick={() => setMode("normal")}
          aria-label="Show app dock"
          className="fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 rounded-r-xl border border-l-0 border-sidebar-border/70 bg-sidebar/90 px-1.5 py-4 text-muted-foreground backdrop-blur transition-colors hover:text-foreground md:block"
        >
          <PanelLeftOpen className="size-4" />
        </button>
      )}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close app dock"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-foreground/25 backdrop-blur-[1px] md:hidden"
        />
      )}

    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-56 shrink-0 flex-col border-r border-sidebar-border/70 bg-sidebar transition-transform duration-300 md:static md:z-auto md:w-auto md:translate-x-0 md:transition-[width]",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        desktopHidden ? "md:hidden" : "md:flex",
        expanded ? "md:w-[26rem]" : "md:w-[8.5rem]",
      )}
    >

      <div className="flex items-center justify-between px-4 py-4">
        <Link to="/home">
          <GardensWordmark compact={!expanded} />
        </Link>
      </div>

      <div className="flex items-center gap-1 px-3 pb-2">
        <span className="mr-auto text-[11px] tracking-wide text-muted-foreground">
          Apps {roots.length}/{MAX_APPS}
        </span>
        <Button
          variant={editing ? "secondary" : "ghost"}
          size="icon-sm"
          onClick={() => {
            setEditing((v) => !v);
            setSelected([]);
          }}
          aria-label={editing ? "Done editing apps" : "Edit apps"}
        >
          {editing ? <Check className="size-4" /> : <Pencil className="size-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => void deleteSelected()}
          disabled={selected.length === 0}
          aria-label="Delete selected apps"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMode(expanded ? "normal" : "wide")}
          aria-label={expanded ? "Collapse dock" : "Expand dock"}
        >
          {expanded ? (
            <ChevronsRightLeft className="size-4" />
          ) : (
            <ChevronsLeftRight className="size-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMode("hidden")}
          aria-label="Hide dock"
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className={cn("grid gap-2", expanded ? "grid-cols-6" : "grid-cols-2")}>
          {roots.map((app) => (
            <DockTile
              key={app.id}
              app={app}
              folderChildren={childrenOf(app.id)}
              editing={editing}
              selected={selected.includes(app.id)}
              onSelect={() => toggleSelected(app.id)}
              isDropTarget={dropId === app.id && dragId !== app.id}
              onDragStart={() => setDragId(app.id)}
              onDragEnd={() => {
                setDragId(null);
                setDropId(null);
              }}
              onDragOver={() => setDropId(app.id)}
              onDrop={() => void handleDrop(app)}
            />
          ))}
          {roots.length < MAX_APPS && <AddAppTile />}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          Click opens the app. Drag one onto another to make a folder. Right-click to share.
        </p>
      </div>

      <div className="border-t border-sidebar-border/70 p-3">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
            pathname === "/settings" && "bg-sidebar-accent font-medium",
          )}
        >
          <SettingsIcon className="size-4" />
          {expanded && "Settings"}
        </Link>
      </div>
    </aside>
    </>
  );

}

function DockIcon({ app, className }: { app: AppItem; className?: string }) {
  if (app.is_folder) {
    return (
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-card",
          className,
        )}
      >
        <Folder className="size-5 text-iris" />
      </div>
    );
  }
  return app.icon_url ? (
    <img
      src={app.icon_url}
      alt=""
      loading="lazy"
      width={256}
      height={256}
      className={cn("size-11 rounded-2xl object-cover", className)}
    />
  ) : (
    <div
      className={cn(
        "flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-card",
        className,
      )}
    >
      <Globe className="size-5 text-teal" />
    </div>
  );
}

function DockTile({
  app,
  folderChildren,
  editing,
  selected,
  onSelect,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: {
  app: AppItem;
  folderChildren: AppItem[];
  editing: boolean;
  selected: boolean;
  onSelect: () => void;
  isDropTarget: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: () => void;
  onDrop: () => void;
}) {
  const updateApp = useUpdateApp();
  const share = useShareApp();
  const [showShare, setShowShare] = useState(false);

  async function copyLink() {
    const url = await share.mutateAsync(app);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy the link");
    }
    setShowShare(false);
  }

  const body = (
    <div
      className={cn(
        "group relative flex flex-col items-center gap-1.5 rounded-2xl p-1.5",
        "glow-edge",
        isDropTarget && "bg-sidebar-accent",
        selected && "bg-sidebar-accent ring-2 ring-iris",
      )}
    >
      <DockIcon app={app} />
      <span className="w-full truncate text-center text-[10px] text-sidebar-foreground">
        {app.name}
      </span>

      {showShare && !app.is_folder && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void copyLink();
          }}
          aria-label="Copy share link"
          className="absolute -right-1 -top-1 rounded-full bg-iris p-1 text-iris-foreground shadow-md"
        >
          <Link2 className="size-3" />
        </button>
      )}
      {editing && (
        <span
          className={cn(
            "absolute -left-1 -top-1 size-4 rounded-full border border-border bg-card",
            selected && "border-iris bg-iris",
          )}
        />
      )}
    </div>
  );

  const shared = {
    draggable: !app.is_folder && !editing,
    onDragStart,
    onDragEnd,
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      onDragOver();
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      onDrop();
    },
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      setShowShare((v) => !v);
    },
  };

  if (editing) {
    return (
      <button type="button" className="text-left" onClick={onSelect} {...shared}>
        {body}
      </button>
    );
  }

  if (app.is_folder) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className="text-left" {...shared}>
            {body}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 space-y-2">
          <input
            value={app.name}
            onChange={(e) => void updateApp.mutate({ id: app.id, name: e.target.value })}
            className="w-full bg-transparent text-sm font-medium outline-none"
            aria-label="Folder name"
          />
          <div className="grid grid-cols-4 gap-2">
            {folderChildren.map((child) => (
              <a
                key={child.id}
                href={child.url}
                target="_blank"
                rel="noreferrer"
                className="glow-edge flex flex-col items-center gap-1 rounded-xl p-1"
              >
                <DockIcon app={child} className="size-9" />
                <span className="w-full truncate text-center text-[10px]">{child.name}</span>
              </a>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void updateApp.mutate({ id: folderChildren[0]?.id ?? "", parent_id: null })}
            disabled={folderChildren.length === 0}
          >
            Pull one out
          </Button>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <a
      href={app.url}
      target="_blank"
      rel="noreferrer"
      title={app.name}
      onDoubleClick={() => void updateApp.mutate({ id: app.id, is_favorite: !app.is_favorite })}
      {...shared}
    >
      {body}
      {app.is_favorite && (
        <Star className="pointer-events-none -mt-6 ml-auto mr-1 size-3 fill-iris text-iris" />
      )}
    </a>
  );
}

function AddAppTile() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const createApp = useCreateApp();

  async function onFile(file: File | undefined) {
    if (!file) return;
    try {
      setIcon(await resizeToAppIcon(file));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not use that image");
    }
  }

  async function submit() {
    if (!name.trim() || !url.trim()) {
      setError("Name and link are required");
      return;
    }
    const href = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    await createApp.mutateAsync({ name: name.trim(), url: href, icon_url: icon });
    setName("");
    setUrl("");
    setIcon(null);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="glow-edge flex flex-col items-center gap-1.5 rounded-2xl p-1.5 text-muted-foreground hover:text-foreground"
        >
          <span className="flex size-11 items-center justify-center rounded-2xl border border-dashed border-border">
            <Plus className="size-5" />
          </span>
          <span className="text-[10px]">Add</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add an app</DialogTitle>
          <DialogDescription>
            Any link becomes an app. Icons are resized to 256×256.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="app-name">Name</Label>
            <Input id="app-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="app-url">Link</Label>
            <Input
              id="app-url"
              placeholder="https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            {icon ? (
              <img
                src={icon}
                alt=""
                width={256}
                height={256}
                className="size-14 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-2xl border border-dashed border-border">
                <Globe className="size-5 text-muted-foreground" />
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              Choose icon
            </Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button onClick={() => void submit()} disabled={createApp.isPending}>
            Add app
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
