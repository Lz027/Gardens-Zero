import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChatWindow } from "@/components/gardens/chat-window";
import { Button } from "@/components/ui/button";
import { useThreads, useThread, currentUserId, useInvalidate } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "Thread — Gardens Zero" },
      { name: "description", content: "A conversation with Zero inside your workspace." },
      { property: "og:title", content: "Thread — Gardens Zero" },
      {
        property: "og:description",
        content: "A conversation with Zero inside your workspace.",
      },
    ],
  }),
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  const { data: threads } = useThreads();
  const { data: thread } = useThread(threadId);
  const navigate = useNavigate();
  const invalidate = useInvalidate();

  async function newThread() {
    const userId = await currentUserId();
    if (!userId) return;
    const { data } = await supabase
      .from("threads")
      .insert({ user_id: userId, title: "New thread" })
      .select("id")
      .single();
    if (data) {
      invalidate(["threads"]);
      navigate({ to: "/chat/$threadId", params: { threadId: data.id } });
    }
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="hidden w-56 shrink-0 flex-col border-r border-border bg-fog/40 lg:flex">
        <div className="p-3">
          <Button size="sm" className="w-full" onClick={newThread}>
            <Plus className="size-3.5" /> New thread
          </Button>
        </div>
        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
          {(threads ?? []).map((item) => (
            <Link
              key={item.id}
              to="/chat/$threadId"
              params={{ threadId: item.id }}
              className={cn(
                "block truncate rounded-lg px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                item.id === threadId && "bg-accent font-medium text-accent-foreground",
              )}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-4">
          <span className="truncate text-xs text-muted-foreground">
            {thread?.title ?? "Thread"}
          </span>
          <Button size="icon-sm" variant="ghost" className="ml-auto lg:hidden" onClick={newThread}>
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1">
          <ChatWindow key={threadId} threadId={threadId} />
        </div>
      </div>
    </div>
  );
}
