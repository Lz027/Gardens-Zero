import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useThreads, currentUserId } from "@/lib/queries";
import { Shimmer } from "@/components/ai-elements/shimmer";

export const Route = createFileRoute("/_authenticated/chat/")({
  head: () => ({
    meta: [
      { title: "Zero — Gardens Zero" },
      { name: "description", content: "Talk to Zero, the resident intelligence of your workspace." },
      { property: "og:title", content: "Zero — Gardens Zero" },
      {
        property: "og:description",
        content: "Talk to Zero, the resident intelligence of your workspace.",
      },
    ],
  }),
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();
  const { data: threads, isLoading } = useThreads();

  useEffect(() => {
    if (isLoading) return;
    if (threads && threads.length > 0) {
      const first = threads[0]!;
      navigate({ to: "/chat/$threadId", params: { threadId: first.id }, replace: true });
      return;
    }
    void (async () => {
      const userId = await currentUserId();
      if (!userId) return;
      const { data } = await supabase
        .from("threads")
        .insert({ user_id: userId, title: "New thread" })
        .select("id")
        .single();
      if (data) {
        navigate({ to: "/chat/$threadId", params: { threadId: data.id }, replace: true });
      }
    })();
  }, [threads, isLoading, navigate]);

  return (
    <div className="flex h-full items-center justify-center">
      <Shimmer className="text-sm">Opening your threads…</Shimmer>
    </div>
  );
}
