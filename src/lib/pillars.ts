import {
  Boxes,
  Briefcase,
  Compass,
  GraduationCap,
  Hammer,
  Heart,
  Lightbulb,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/** The eight icons a pillar folder can wear. */
export const PILLAR_ICONS: Record<string, LucideIcon> = {
  Boxes,
  Briefcase,
  Hammer,
  GraduationCap,
  Lightbulb,
  Heart,
  Sparkles,
  Compass,
};

export const PILLAR_ICON_NAMES = Object.keys(PILLAR_ICONS);

export function iconFor(name: string | null | undefined): LucideIcon {
  return (name && PILLAR_ICONS[name]) || Boxes;
}

export const PILLAR_ACCENTS = ["iris", "teal"] as const;
export type PillarAccent = (typeof PILLAR_ACCENTS)[number];

export function accentText(accent: string | null | undefined) {
  return accent === "teal" ? "text-teal" : "text-iris";
}
export function accentChip(accent: string | null | undefined) {
  return accent === "teal" ? "bg-teal/15 text-teal" : "bg-iris/15 text-iris";
}

export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || `pillar-${Math.random().toString(36).slice(2, 7)}`
  );
}

/** The four folders every new workspace starts with — renameable and deletable. */
export const STARTER_PILLARS = [
  {
    slug: "systems",
    label: "Systems",
    blurb: "The sync layer. Rules, reset logic, structure, cross-folder notes.",
    accent: "iris",
    icon: "Boxes",
  },
  {
    slug: "career",
    label: "Career",
    blurb: "Earning direction, professional identity, credibility, income path.",
    accent: "teal",
    icon: "Briefcase",
  },
  {
    slug: "projects",
    label: "Projects",
    blurb: "Execution, outputs, proof, assets, build work.",
    accent: "iris",
    icon: "Hammer",
  },
  {
    slug: "academics",
    label: "Academics",
    blurb: "Study direction, requirements, long-term academic progress.",
    accent: "teal",
    icon: "GraduationCap",
  },
] as const;

export const STARTER_SLUGS = STARTER_PILLARS.map((p) => p.slug) as readonly string[];

export const ENTRY_KINDS = [
  "done",
  "in_progress",
  "changed",
  "unchanged",
  "blocked",
  "next",
] as const;
export type EntryKind = (typeof ENTRY_KINDS)[number];

export const ENTRY_KIND_LABEL: Record<EntryKind, string> = {
  done: "What was done",
  in_progress: "In progress",
  changed: "What changed",
  unchanged: "What stayed the same",
  blocked: "Blocked",
  next: "What comes next",
};
