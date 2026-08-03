export const PILLARS = ["systems", "career", "projects", "academics"] as const;
export type Pillar = (typeof PILLARS)[number];

export const PILLAR_META: Record<
  Pillar,
  { label: string; blurb: string; accent: "iris" | "teal" }
> = {
  systems: {
    label: "Systems",
    blurb: "The sync layer. Rules, reset logic, structure, cross-pillar memory.",
    accent: "iris",
  },
  career: {
    label: "Career",
    blurb: "Earning direction, professional identity, credibility, income path.",
    accent: "teal",
  },
  projects: {
    label: "Projects",
    blurb: "Execution, outputs, proof, assets, build work.",
    accent: "iris",
  },
  academics: {
    label: "Academics",
    blurb: "Study direction, requirements, long-term academic progress.",
    accent: "teal",
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

export const MEMORY_TYPES = [
  "fact",
  "decision",
  "blocker",
  "next_step",
  "preference",
  "note",
] as const;
export type MemoryType = (typeof MEMORY_TYPES)[number];

export const MEMORY_TYPE_LABEL: Record<MemoryType, string> = {
  fact: "Fact",
  decision: "Decision",
  blocker: "Blocker",
  next_step: "Next step",
  preference: "Preference",
  note: "Note",
};

export const AI_MODELS = [
  { id: "openai/gpt-5.6-sol", label: "Sol — deepest reasoning" },
  { id: "openai/gpt-5.6-terra", label: "Terra — balanced everyday" },
  { id: "openai/gpt-5.6-luna", label: "Luna — fast and light" },
] as const;

export function isPillar(value: unknown): value is Pillar {
  return typeof value === "string" && (PILLARS as readonly string[]).includes(value);
}
