import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useEvents, useInvalidate, currentUserId } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Gardens Zero" },
      { name: "description", content: "Everything scheduled across your four pillars." },
      { property: "og:title", content: "Calendar — Gardens Zero" },
      { property: "og:description", content: "Everything scheduled across your four pillars." },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { data: events } = useEvents();
  const invalidate = useInvalidate();
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");

  async function addEvent() {
    if (!title.trim() || !when) return;
    const userId = await currentUserId();
    if (!userId) return;
    await supabase.from("events").insert({
      user_id: userId,
      title: title.trim(),
      starts_at: new Date(when).toISOString(),
    });
    setTitle("");
    setWhen("");
    invalidate(["events"]);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
      <p className="mt-1 text-sm text-muted-foreground">Time as it lands across the pillars.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          className="h-9 min-w-0 flex-1"
        />
        <Input
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          className="h-9 w-56"
        />
        <Button onClick={addEvent}>Add</Button>
      </div>

      <ul className="mt-6 space-y-2">
        {(events ?? []).map((event) => (
          <li key={event.id} className="panel flex items-center gap-3 rounded-lg p-3">
            <div className="min-w-0 flex-1 text-sm">{event.title}</div>
            <div className="shrink-0 text-xs text-muted-foreground">
              {format(new Date(event.starts_at), "EEE d MMM · HH:mm")}
            </div>
          </li>
        ))}
        {events?.length === 0 && (
          <li className="text-sm text-muted-foreground">Nothing scheduled yet.</li>
        )}
      </ul>
    </div>
  );
}
