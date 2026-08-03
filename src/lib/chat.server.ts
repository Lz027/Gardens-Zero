import type { SupabaseClient } from "@supabase/supabase-js";
import { streamText, type UIMessage } from "ai";
import type { Database } from "@/integrations/supabase/types";
import { createGardensAi } from "./ai-gateway.server";

type DB = SupabaseClient<Database>;
type PillarValue = Database["public"]["Enums"]["pillar"];
type MemoryTypeValue = Database["public"]["Enums"]["memory_type"];

const BASE_PERSONA = `You are Zero, the resident intelligence of Gardens Zero — a personal operating system built around four pillars: Systems, Career, Projects, Academics.

How you work:
- You are calm, exact and structural. No hype, no filler, no motivational padding.
- You track state, not vibes: what was done, what is in progress, what changed, what stayed the same, what is blocked, what comes next.
- When something belongs to a pillar, name the pillar.
- Prefer short paragraphs and tight lists. Use markdown.
- If the user's memory contains a fact, use it silently instead of asking again.
- If you are unsure, say what you would need to know rather than inventing detail.`;

export function messageText(message: UIMessage | undefined): string {
  if (!message) return "";
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

export async function buildSystemPrompt(
  supabase: DB,
  opts: { persona: string | null; memoryEnabled: boolean; pillar: PillarValue | null },
): Promise<string> {
  const sections: string[] = [BASE_PERSONA];
  if (opts.persona?.trim()) {
    sections.push(`Owner's persona instructions:\n${opts.persona.trim()}`);
  }
  if (opts.pillar) {
    sections.push(`This conversation is scoped to the ${opts.pillar} pillar.`);
  }

  if (opts.memoryEnabled) {
    const { data: memories } = await supabase
      .from("memory_entries")
      .select("title, content, type, pillar, pinned")
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(40);

    if (memories?.length) {
      const lines = memories.map(
        (m) =>
          `- [${m.type}${m.pillar ? `/${m.pillar}` : ""}${m.pinned ? "/pinned" : ""}] ${m.title}: ${m.content}`,
      );
      sections.push(`Memory core (known facts about the owner):\n${lines.join("\n")}`);
    }

    const { data: entries } = await supabase
      .from("pillar_entries")
      .select("pillar, kind, content")
      .order("updated_at", { ascending: false })
      .limit(40);

    if (entries?.length) {
      const lines = entries.map((e) => `- [${e.pillar}/${e.kind}] ${e.content}`);
      sections.push(`Current pillar state:\n${lines.join("\n")}`);
    }
  }

  return sections.join("\n\n");
}

export async function persistTurn(
  supabase: DB,
  opts: {
    userId: string;
    threadId: string;
    uiMessages: UIMessage[];
    responseMessage: UIMessage;
  },
) {
  const lastUser = [...opts.uiMessages].reverse().find((m) => m.role === "user");
  const rows: Database["public"]["Tables"]["messages"]["Insert"][] = [];

  if (lastUser) {
    const { data: existing } = await supabase
      .from("messages")
      .select("id")
      .eq("thread_id", opts.threadId)
      .eq("client_id", lastUser.id)
      .maybeSingle();
    if (!existing) {
      rows.push({
        user_id: opts.userId,
        thread_id: opts.threadId,
        client_id: lastUser.id,
        role: "user",
        parts: lastUser.parts as unknown as Database["public"]["Tables"]["messages"]["Row"]["parts"],
        text_content: messageText(lastUser),
      });
    }
  }

  rows.push({
    user_id: opts.userId,
    thread_id: opts.threadId,
    client_id: opts.responseMessage.id,
    role: "assistant",
    parts: opts.responseMessage
      .parts as unknown as Database["public"]["Tables"]["messages"]["Row"]["parts"],
    text_content: messageText(opts.responseMessage),
  });

  const { error } = await supabase.from("messages").insert(rows);
  if (error) console.error("failed to save messages", error);

  await supabase
    .from("threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", opts.threadId);

  // Auto-title a fresh thread from the first user message.
  const { data: thread } = await supabase
    .from("threads")
    .select("title")
    .eq("id", opts.threadId)
    .maybeSingle();
  if (thread && (!thread.title || thread.title === "New thread") && lastUser) {
    const raw = messageText(lastUser).replace(/\s+/g, " ").trim();
    if (raw) {
      await supabase
        .from("threads")
        .update({ title: raw.length > 60 ? `${raw.slice(0, 57)}...` : raw })
        .eq("id", opts.threadId);
    }
  }
}

const MEMORY_TYPES: MemoryTypeValue[] = [
  "fact",
  "decision",
  "blocker",
  "next_step",
  "preference",
  "note",
];
const PILLARS: PillarValue[] = ["systems", "career", "projects", "academics"];

type Extracted = {
  title?: unknown;
  content?: unknown;
  type?: unknown;
  pillar?: unknown;
};

export async function extractMemories(
  supabase: DB,
  opts: {
    apiKey: string;
    userId: string;
    threadId: string;
    pillar: PillarValue | null;
    uiMessages: UIMessage[];
    responseMessage: UIMessage;
  },
) {
  const lastUser = [...opts.uiMessages].reverse().find((m) => m.role === "user");
  const transcript = `User:\n${messageText(lastUser)}\n\nZero:\n${messageText(opts.responseMessage)}`;
  if (transcript.trim().length < 40) return;

  const { provider } = createGardensAi(opts.apiKey);
  const result = streamText({
    model: provider.responses("openai/gpt-5.6-luna"),
    system: `You extract durable memory from a conversation inside a personal operating system.
Return ONLY a JSON array (no prose, no code fences). Each item:
{"title": short label, "content": one sentence, "type": one of fact|decision|blocker|next_step|preference|note, "pillar": one of systems|career|projects|academics or null}
Only include things that stay true beyond this conversation: facts about the person, decisions made, blockers, concrete next steps, stated preferences.
Skip small talk, questions, and anything speculative. Return [] when nothing durable was said. Maximum 5 items.`,
    prompt: transcript,
    providerOptions: { openai: { store: false } },
  });

  const text = await result.text;
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return;

  let parsed: unknown;
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return;
  }
  if (!Array.isArray(parsed) || parsed.length === 0) return;

  const rows = parsed
    .slice(0, 5)
    .map((item: Extracted) => {
      const title = typeof item.title === "string" ? item.title.trim() : "";
      const content = typeof item.content === "string" ? item.content.trim() : "";
      if (!title || !content) return null;
      const type = MEMORY_TYPES.includes(item.type as MemoryTypeValue)
        ? (item.type as MemoryTypeValue)
        : "note";
      const pillar = PILLARS.includes(item.pillar as PillarValue)
        ? (item.pillar as PillarValue)
        : opts.pillar;
      return {
        user_id: opts.userId,
        title: title.slice(0, 120),
        content,
        type,
        pillar,
        source_thread_id: opts.threadId,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length === 0) return;

  const { data: existing } = await supabase.from("memory_entries").select("title").limit(200);
  const seen = new Set((existing ?? []).map((e) => e.title.toLowerCase()));
  const fresh = rows.filter((row) => !seen.has(row.title.toLowerCase()));
  if (fresh.length === 0) return;

  const { error } = await supabase.from("memory_entries").insert(fresh);
  if (error) console.error("memory extraction insert failed", error);
}
