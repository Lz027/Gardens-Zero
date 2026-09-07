import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useInvalidate, useApps } from "@/lib/queries";
import { useNotes } from "@/lib/desk-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { accentText, iconFor } from "@/lib/pillars";
import { usePillars } from "@/lib/pillar-queries";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Gardens Zero" },
      { name: "description", content: "Your profile, workspace overview and pillar folders." },
      { property: "og:title", content: "Settings — Gardens Zero" },
      {
        property: "og:description",
        content: "Your profile, workspace overview and pillar folders.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: profile } = useProfile();
  const { data: notes } = useNotes();
  const { data: apps } = useApps();
  const { data: pillars } = usePillars();
  const invalidate = useInvalidate();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (profile) setDisplayName(profile.display_name ?? "");
  }, [profile]);

  async function save() {
    if (!profile) return;
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", profile.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated");
      invalidate(["profile"]);
    }
  }

  const appCount = (apps ?? []).filter((a) => !a.is_folder).length;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Profile, workspace monitoring and your pillar folders.
      </p>

      <div className="mt-6 space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="name">Display name</Label>
          <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Button className="mt-2" onClick={() => void save()}>
            Save
          </Button>
        </div>

        <section>
          <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground">Workspace</h2>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="panel rounded-lg p-3">
              <div className="text-lg font-semibold">{notes?.length ?? 0}</div>
              <div className="text-xs text-muted-foreground">Notes</div>
            </div>
            <div className="panel rounded-lg p-3">
              <div className="text-lg font-semibold">{appCount}</div>
              <div className="text-xs text-muted-foreground">Apps saved</div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Your folders
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            The first four came ready-made. Open a folder to rename it, change its icon or delete
            it, and add your own from the bar at the bottom of the workspace.
          </p>
          <ul className="mt-2 space-y-2">
            {(pillars ?? []).map((pillar) => {
              const Icon = iconFor(pillar.icon);
              const count = (notes ?? []).filter((n) => n.pillar === pillar.slug).length;
              return (
                <li key={pillar.id} className="panel flex items-center gap-3 rounded-lg p-3">
                  <Icon className={`size-4 shrink-0 ${accentText(pillar.accent)}`} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{pillar.label}</div>
                    <p className="truncate text-xs text-muted-foreground">{pillar.blurb}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{count} notes</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
