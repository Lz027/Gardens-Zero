import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSettings, useProfile, useInvalidate } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AI_MODELS } from "@/lib/pillars";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Gardens Zero" },
      { name: "description", content: "Tune Zero's persona, model and memory behaviour." },
      { property: "og:title", content: "Settings — Gardens Zero" },
      { property: "og:description", content: "Tune Zero's persona, model and memory behaviour." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: settings } = useSettings();
  const { data: profile } = useProfile();
  const invalidate = useInvalidate();

  const [persona, setPersona] = useState("");
  const [model, setModel] = useState("openai/gpt-5.6-sol");
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [autoExtract, setAutoExtract] = useState(true);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!settings) return;
    setPersona(settings.persona ?? "");
    setModel(settings.model ?? "openai/gpt-5.6-sol");
    setMemoryEnabled(settings.memory_enabled);
    setAutoExtract(settings.auto_extract);
  }, [settings]);

  useEffect(() => {
    if (profile) setDisplayName(profile.display_name ?? "");
  }, [profile]);

  async function save() {
    const { error } = await supabase
      .from("settings")
      .update({
        persona,
        model,
        memory_enabled: memoryEnabled,
        auto_extract: autoExtract,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", settings?.user_id ?? "");
    if (profile) {
      await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", profile.id);
    }
    if (error) toast.error(error.message);
    else {
      toast.success("Workspace updated");
      invalidate(["settings", "profile"]);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <div className="mt-6 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Display name</Label>
          <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="persona">Zero's persona</Label>
          <Textarea
            id="persona"
            rows={5}
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder="How should Zero speak to you, and what should it always keep in mind?"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="model">Model</Label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-card px-2 text-sm"
          >
            {AI_MODELS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <div className="text-sm font-medium">Use memory core</div>
            <p className="text-xs text-muted-foreground">
              Inject known facts and pillar state into every conversation.
            </p>
          </div>
          <Switch checked={memoryEnabled} onCheckedChange={setMemoryEnabled} />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <div className="text-sm font-medium">Auto-extract memory</div>
            <p className="text-xs text-muted-foreground">
              Let Zero save durable facts and next steps from your chats.
            </p>
          </div>
          <Switch checked={autoExtract} onCheckedChange={setAutoExtract} />
        </div>

        <Button onClick={save}>Save</Button>
      </div>
    </div>
  );
}
