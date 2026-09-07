import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEvents, useInvalidate, currentUserId } from "@/lib/queries";
import { MonthGrid } from "@/components/gardens/month-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Gardens Zero" },
      { name: "description", content: "A month grid of everything you have scheduled." },
      { property: "og:title", content: "Calendar — Gardens Zero" },
      {
        property: "og:description",
        content: "A month grid of everything you have scheduled.",
      },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const { data: events } = useEvents();
  const invalidate = useInvalidate();
  const [selected, setSelected] = useState<Date>(() => new Date());
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");

  const dayEvents = useMemo(
    () => (events ?? []).filter((e) => isSameDay(new Date(e.starts_at), selected)),
    [events, selected],
  );

  async function addEvent() {
    if (!title.trim()) return;
    const userId = await currentUserId();
    if (!userId) return;
    const [h, m] = time.split(":").map(Number);
    const when = new Date(selected);
    when.setHours(h || 0, m || 0, 0, 0);
    await supabase.from("events").insert({
      user_id: userId,
      title: title.trim(),
      starts_at: when.toISOString(),
    });
    setTitle("");
    invalidate(["events"]);
  }

  async function removeEvent(id: string) {
    await supabase.from("events").delete().eq("id", id);
    invalidate(["events"]);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
      <p className="mt-1 text-sm text-muted-foreground">Time as it lands across your folders.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="panel rounded-xl p-3 sm:p-4">
          <MonthGrid
            events={(events ?? []).map((e) => ({
              id: e.id,
              title: e.title,
              starts_at: e.starts_at,
              pillar: e.pillar,
            }))}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        <div className="panel flex min-w-0 flex-col rounded-xl p-3 sm:p-4">
          <h2 className="text-sm font-medium">{format(selected, "EEEE d MMMM")}</h2>

          <div className="mt-3 flex flex-wrap gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEvent()}
              placeholder="Add something"
              className="h-9 min-w-0 flex-1"
            />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="h-9 w-28"
            />
            <Button size="sm" onClick={addEvent}>
              Add
            </Button>
          </div>

          <ul className="mt-4 space-y-2">
            {dayEvents.map((event) => (
              <li key={event.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                <span className="shrink-0 text-xs text-muted-foreground">
                  {format(new Date(event.starts_at), "HH:mm")}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{event.title}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete event"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeEvent(event.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
            {dayEvents.length === 0 && (
              <li className="text-sm text-muted-foreground">Nothing on this day yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
