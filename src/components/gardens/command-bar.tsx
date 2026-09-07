import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  Globe,
  LayoutDashboard,
  Settings as SettingsIcon,
  StickyNote,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useApps } from "@/lib/queries";
import { useNotes } from "@/lib/desk-queries";
import { iconFor } from "@/lib/pillars";
import { usePillars } from "@/lib/pillar-queries";

export function CommandBar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: notes } = useNotes();
  const { data: apps } = useApps();
  const { data: pillars } = usePillars();

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
        placeholder="Search notes, apps, pillars…"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Nothing found in the garden.</CommandEmpty>

        <CommandGroup heading="Go to">
          <CommandItem onSelect={() => go(() => navigate({ to: "/home" }))}>
            <LayoutDashboard className="size-4" /> Desk
          </CommandItem>
          <CommandItem onSelect={() => go(() => navigate({ to: "/calendar" }))}>
            <CalendarDays className="size-4" /> Calendar
          </CommandItem>
          <CommandItem onSelect={() => go(() => navigate({ to: "/settings" }))}>
            <SettingsIcon className="size-4" /> Settings
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Pillars">
          {(pillars ?? []).map((pillar) => {
            const Icon = iconFor(pillar.icon);
            return (
              <CommandItem
                key={pillar.id}
                onSelect={() =>
                  go(() => navigate({ to: "/pillars/$pillar", params: { pillar: pillar.slug } }))
                }
              >
                <Icon className="size-4" /> {pillar.label}
              </CommandItem>
            );
          })}
        </CommandGroup>

        {notes && notes.length > 0 && (
          <CommandGroup heading="Notes">
            {notes.slice(0, 8).map((note) => (
              <CommandItem
                key={note.id}
                value={`note ${note.title} ${note.body}`}
                onSelect={() => go(() => navigate({ to: "/home" }))}
              >
                <StickyNote className="size-4" /> {note.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {apps && apps.length > 0 && (
          <CommandGroup heading="Apps">
            {apps
              .filter((app) => !app.is_folder)
              .slice(0, 8)
              .map((app) => (
                <CommandItem
                  key={app.id}
                  value={`app ${app.name}`}
                  onSelect={() => go(() => window.open(app.url, "_blank", "noopener"))}
                >
                  <Globe className="size-4" /> {app.name}
                </CommandItem>
              ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
