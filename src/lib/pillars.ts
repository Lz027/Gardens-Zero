import { Boxes, Briefcase, GraduationCap, Hammer, type LucideIcon } from "lucide-react";

export const PILLARS = ["systems", "career", "projects", "academics"] as const;
export type Pillar = (typeof PILLARS)[number];

export const PILLAR_META: Record<
  Pillar,
  { label: string; blurb: string; accent: "iris" | "teal"; icon: LucideIcon; premade: true }
> = {
  systems: {
    label: "Systems",
    blurb: "The sync layer. Rules, reset logic, structure, cross-pillar notes.",
    accent: "iris",
    icon: Boxes,
    premade: true,
  },
  career: {
    label: "Career",
    blurb: "Earning direction, professional identity, credibility, income path.",
    accent: "teal",
    icon: Briefcase,
    premade: true,
  },
  projects: {
    label: "Projects",
    blurb: "Execution, outputs, proof, assets, build work.",
    accent: "iris",
    icon: Hammer,
    premade: true,
  },
  academics: {
    label: "Academics",
    blurb: "Study direction, requirements, long-term academic progress.",
    accent: "teal",
    icon: GraduationCap,
    premade: true,
  },
};

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

export function isPillar(value: unknown): value is Pillar {
  return typeof value === "string" && (PILLARS as readonly string[]).includes(value);
}
