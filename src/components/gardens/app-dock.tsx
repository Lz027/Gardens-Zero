import { useMemo, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronsLeftRight,
  ChevronsRightLeft,
  Folder,
  Globe,
  Plus,
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
import { useCreateApp, useDeleteApp, useUpdateApp, type AppItem } from "@/lib/desk-queries";
import { resizeToAppIcon } from "@/lib/icon-image";
import { cn } from "@/lib/utils";

const MAX_APPS = 16;

export function AppDock() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: apps } = useApps();
  const [expanded, setExpanded] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropId, setDropId] = useState<string | null>(null);

  const createApp = useCreateApp();
  const updateApp = useUpdateApp();

  const all = (apps ?? []) as AppItem[];
  const roots = useMemo(
    () => all.filter((a) => !a.parent_id).slice(0, MAX_APPS),
    [all],
  );
  const childrenOf = (id: string) => all.filter((a) => a.parent_id === id);

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

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex",
        expanded ? "w-[26rem]" : "w-[8.5rem]",
      )}
    >
      <div className="flex items-center justify-between px-3 py-4">
        <Link to="/home">
          <GardensWordmark compact={!expanded} />
        </Link>
      </div>

      <div className="flex items-center justify-between px-3 pb-2">
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Apps {roots.length}/{MAX_APPS}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse dock" : "Expand dock"}
        >
          {expanded ? (
            <ChevronsRightLeft className="size-4" />
          ) : (
            <ChevronsLeftRight className="size-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className={cn("grid gap-2", expanded ? "grid-cols-8" : "grid-cols-2")}>
          {roots.map((app) => (
            <DockTile
              key={app.id}
              app={app}
              children={childrenOf(app.id)}
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
          Drag one app onto another to merge them into a folder.
        </p>
      </div>

      <div className="border-t border-sidebar-border p-3">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
            pathname === "/settings" && "bg-sidebar-accent font-medium",
          )}
        >
          <SettingsIcon className="size-4" />
          {expanded && "Settings"}
        </Link>
      </div>
    </aside>
  );
}

function DockIcon({ app, className }: { app: AppItem; className?: string }) {
  if (app.is_folder) {
    return (
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-xl border border-border bg-card",
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
      className={cn("size-11 rounded-xl object-cover", className)}
    />
  ) : (
    <div
      className={cn(
        "flex size-11 items-center justify-center rounded-xl border border-border bg-card",
        className,
      )}
    >
      <Globe className="size-5 text-teal" />
    </div>
  );
}

function DockTile({
  app,
  children,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: {
  app: AppItem;
  children: AppItem[];
  isDropTarget: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: () => void;
  onDrop: () => void;
}) {
  const deleteApp = useDeleteApp();
  const updateApp = useUpdateApp();

  const tile = (
    <div
      draggable={!app.is_folder}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      className={cn(
        "group flex cursor-pointer flex-col items-center gap-1 rounded-xl p-1.5 transition-colors hover:bg-sidebar-accent",
        isDropTarget && "bg-sidebar-accent ring-2 ring-iris",
      )}
    >
      <DockIcon app={app} />
      <span className="w-full truncate text-center text-[10px] text-sidebar-foreground">
        {app.name}
      </span>
    </div>
  );

  if (app.is_folder) {
    return (
      <Popover>
        <PopoverTrigger asChild>{tile}</PopoverTrigger>
        <PopoverContent align="start" className="w-64 space-y-2">
          <input
            value={app.name}
            onChange={(e) => void updateApp.mutate({ id: app.id, name: e.target.value })}
            className="w-full bg-transparent text-sm font-medium outline-none"
            aria-label="Folder name"
          />
          <div className="grid grid-cols-4 gap-2">
            {children.map((child) => (
              <a
                key={child.id}
                href={child.url}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1 rounded-lg p-1 hover:bg-accent"
              >
                <DockIcon app={child} className="size-9" />
                <span className="w-full truncate text-center text-[10px]">{child.name}</span>
              </a>
            ))}
          </div>
          <div className="flex justify-between pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void updateApp.mutate({ id: children[0]?.id ?? "", parent_id: null })}
              disabled={children.length === 0}
            >
              Pull one out
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void deleteApp.mutate(app.id)}>
              <Trash2 className="size-3.5" /> Delete
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{tile}</PopoverTrigger>
      <PopoverContent align="start" className="w-56 space-y-2">
        <div className="text-sm font-medium">{app.name}</div>
        <a
          href={app.url}
          target="_blank"
          rel="noreferrer"
          className="block truncate text-xs text-teal underline"
        >
          {app.url}
        </a>
        <Button variant="ghost" size="sm" onClick={() => void deleteApp.mutate(app.id)}>
          <Trash2 className="size-3.5" /> Remove
        </Button>
      </PopoverContent>
    </Popover>
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
          className="flex flex-col items-center gap-1 rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <span className="flex size-11 items-center justify-center rounded-xl border border-dashed border-border">
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
              <img src={icon} alt="" width={256} height={256} className="size-14 rounded-xl object-cover" />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-xl border border-dashed border-border">
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
