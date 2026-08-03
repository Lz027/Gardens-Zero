import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createGardensAi,
  getLovableAiGatewayRunId,
  getLovableAiGatewayResponseHeaders,
  withLovableAiGatewayRunIdHeader,
  GARDENS_PROVIDER_OPTIONS,
} from "@/lib/ai-gateway.server";
import { getRequestUser } from "@/lib/api-auth.server";
import { buildSystemPrompt, persistTurn, extractMemories } from "@/lib/chat.server";

type ChatBody = { messages?: unknown; threadId?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await getRequestUser(request);
        if (!auth) return new Response("Unauthorized", { status: 401 });

        const body = (await request.json()) as ChatBody;
        const messages = body.messages;
        const threadId = typeof body.threadId === "string" ? body.threadId : null;
        if (!Array.isArray(messages) || !threadId) {
          return new Response("messages and threadId are required", { status: 400 });
        }

        const { supabase, userId } = auth;
        const { data: thread } = await supabase
          .from("threads")
          .select("id, pillar, title")
          .eq("id", threadId)
          .maybeSingle();
        if (!thread) return new Response("Thread not found", { status: 404 });

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const { data: settings } = await supabase
          .from("settings")
          .select("persona, model, memory_enabled, auto_extract")
          .eq("user_id", userId)
          .maybeSingle();

        const system = await buildSystemPrompt(supabase, {
          persona: settings?.persona ?? null,
          memoryEnabled: settings?.memory_enabled ?? true,
          pillar: thread.pillar,
        });

        const initialRunId = getLovableAiGatewayRunId(request);
        const { provider, runIdFetch } = createGardensAi(apiKey, initialRunId);
        const modelId = settings?.model ?? "openai/gpt-5.6-sol";

        const uiMessages = messages as UIMessage[];
        const result = streamText({
          model: provider.responses(modelId),
          system,
          messages: await convertToModelMessages(uiMessages),
          providerOptions: GARDENS_PROVIDER_OPTIONS,
        });

        const response = result.toUIMessageStreamResponse({
          originalMessages: uiMessages,
          sendReasoning: true,
          headers: getLovableAiGatewayResponseHeaders(undefined, {
            ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
          }),
          onFinish: async ({ responseMessage }) => {
            try {
              await persistTurn(supabase, {
                userId,
                threadId,
                uiMessages,
                responseMessage,
              });
              if (settings?.auto_extract !== false) {
                await extractMemories(supabase, {
                  apiKey,
                  userId,
                  threadId,
                  pillar: thread.pillar,
                  uiMessages,
                  responseMessage,
                });
              }
            } catch (error) {
              console.error("chat persistence failed", error);
            }
          },
        });

        return withLovableAiGatewayRunIdHeader(response, runIdFetch);
      },
    },
  },
});
