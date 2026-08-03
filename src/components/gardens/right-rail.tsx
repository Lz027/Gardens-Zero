import { useMemo } from "react";
import { format, isToday, isTomorrow } from "date-fns";
import { Bell, CalendarClock } from "lucide-react";
import { useEvents, useNotifications } from "@/lib/queries";

function dayLabel(iso: string) {
  const date = new Date(iso);
  if (isToday(date)) return `Today · ${format(date, "HH:mm")}`;
  if (isTomorrow(date)) return `Tomorrow · ${format(date, "HH:mm")}`;
  return format(date, "EEE d MMM · HH:mm");
}

export function RightRail() {
  const { data: events } = useEvents();
  const { data: notifications } = useNotifications();

  const upcoming = useMemo(() => {
    const now = Date.now();
    return (events ?? [])
      .filter((e) => new Date(e.ends_at ?? e.starts_at).getTime() >= now)
      .slice(0, 6);
  }, [events]);

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-fog/60 p-4 xl:flex">
      <section>
        <h2 className="flex items-center gap-2 pb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <CalendarClock className="size-3.5 text-teal" /> Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nothing scheduled.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((event) => (
              <li key={event.id} className="panel rounded-lg p-2.5">
                <div className="text-xs font-medium text-foreground">{event.title}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {dayLabel(event.starts_at)}
                </div>
                {event.pillar && (
                  <div className="mt-1 inline-flex rounded-full bg-accent px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-accent-foreground">
                    {event.pillar}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="flex items-center gap-2 pb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <Bell className="size-3.5 text-iris" /> Signals
        </h2>
        {!notifications || notifications.length === 0 ? (
          <p className="text-xs text-muted-foreground">No signals yet.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.slice(0, 6).map((note) => (
              <li key={note.id} className="panel rounded-lg p-2.5">
                <div className="text-xs font-medium text-foreground">{note.title}</div>
                {note.body && (
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{note.body}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
