import { useEffect, useMemo, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { GardensLogo } from "@/components/gardens/logo";
import { useThreadMessages, useInvalidate } from "@/lib/queries";

const transport = new DefaultChatTransport({
  api: "/api/chat",
  fetch: async (input, init) => {
    const { data } = await supabase.auth.getSession();
    const headers = new Headers(init?.headers);
    if (data.session) headers.set("Authorization", `Bearer ${data.session.access_token}`);
    return fetch(input, { ...init, headers });
  },
});

export function ChatWindow({ threadId }: { threadId: string }) {
  const { data: stored } = useThreadMessages(threadId);
  const invalidate = useInvalidate();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const initialMessages = useMemo<UIMessage[]>(
    () =>
      (stored ?? []).map((row) => ({
        id: row.client_id ?? row.id,
        role: row.role as UIMessage["role"],
        parts: (row.parts as unknown as UIMessage["parts"]) ?? [
          { type: "text", text: row.text_content ?? "" },
        ],
      })),
    [stored],
  );

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (error) => toast.error(error.message),
    onFinish: () => invalidate(["threads", "memories"]),
  });

  useEffect(() => {
    if (status === "ready") textareaRef.current?.focus();
  }, [status, threadId]);

  const busy = status === "submitted" || status === "streaming";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const textarea = form.querySelector("textarea");
    const text = textarea?.value.trim();
    if (!text || busy) return;
    void sendMessage({ text }, { body: { threadId } });
    if (textarea) textarea.value = "";
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl">
          {messages.length === 0 && (
            <ConversationEmptyState
              icon={<GardensLogo className="size-14" />}
              title="Zero is listening"
              description="Ask about a pillar, dump a status update, or think out loud. Durable facts land in the memory core automatically."
            />
          )}

          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent
                className={
                  message.role === "assistant" ? "bg-transparent p-0 text-foreground" : undefined
                }
              >
                {message.parts.map((part, index) =>
                  part.type === "text" ? (
                    <MessageResponse key={index}>{part.text}</MessageResponse>
                  ) : null,
                )}
              </MessageContent>
            </Message>
          ))}

          {status === "submitted" && (
            <Shimmer className="px-1 text-sm">Zero is thinking…</Shimmer>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="shrink-0 border-t border-border p-4">
        <div className="mx-auto w-full max-w-3xl">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea ref={textareaRef} placeholder="Talk to Zero…" />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={busy} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
