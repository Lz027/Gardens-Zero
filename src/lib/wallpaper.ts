import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/queries";

export type WallpaperPreset = {
  id: string;
  label: string;
  /** CSS background shorthand, may reference theme tokens. */
  background: string;
};

export const WALLPAPERS: WallpaperPreset[] = [
  {
    id: "paper",
    label: "Paper",
    background: "var(--color-background)",
  },
  {
    id: "fog",
    label: "Fog",
    background:
      "radial-gradient(120% 90% at 12% -10%, color-mix(in oklab, var(--iris) 12%, transparent), transparent 60%), radial-gradient(100% 80% at 95% 0%, color-mix(in oklab, var(--teal) 14%, transparent), transparent 55%), var(--color-background)",
  },
  {
    id: "iris",
    label: "Iris bloom",
    background:
      "radial-gradient(90% 70% at 20% 100%, color-mix(in oklab, var(--iris) 26%, transparent), transparent 65%), radial-gradient(80% 60% at 85% 10%, color-mix(in oklab, var(--teal) 22%, transparent), transparent 60%), var(--color-background)",
  },
  {
    id: "lagoon",
    label: "Lagoon",
    background:
      "linear-gradient(160deg, color-mix(in oklab, var(--teal) 22%, var(--color-background)), var(--color-background) 55%, color-mix(in oklab, var(--iris) 14%, var(--color-background)))",
  },
  {
    id: "grid",
    label: "Grid",
    background:
      "linear-gradient(color-mix(in oklab, var(--border) 70%, transparent) 1px, transparent 1px) 0 0 / 28px 28px, linear-gradient(90deg, color-mix(in oklab, var(--border) 70%, transparent) 1px, transparent 1px) 0 0 / 28px 28px, var(--color-background)",
  },
  {
    id: "dusk",
    label: "Dusk",
    background:
      "radial-gradient(120% 100% at 50% 120%, color-mix(in oklab, var(--iris) 30%, transparent), transparent 70%), var(--color-fog)",
  },
];

export const DEFAULT_WALLPAPER = "fog";

/** Turns a stored wallpaper value (preset id or `url:<https…>`) into inline styles. */
export function wallpaperStyle(value?: string | null): CSSProperties {
  const v = value ?? DEFAULT_WALLPAPER;
  if (v.startsWith("url:")) {
    return {
      backgroundImage: `url(${JSON.stringify(v.slice(4))})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }
  const preset = WALLPAPERS.find((w) => w.id === v) ?? WALLPAPERS[1]!;
  return { background: preset.background };
}

export function useWallpaper() {
  const { data: profile } = useProfile();
  const qc = useQueryClient();

  const set = useMutation({
    mutationFn: async (value: string) => {
      if (!profile) throw new Error("Profile not loaded");
      const { error } = await supabase
        .from("profiles")
        .update({ wallpaper: value })
        .eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  return {
    value: profile?.wallpaper ?? DEFAULT_WALLPAPER,
    style: wallpaperStyle(profile?.wallpaper),
    set,
  };
}
