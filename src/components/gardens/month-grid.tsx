import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarEvent = {
  id: string;
  title: string;
  starts_at: string;
  pillar?: string | null;
};

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

/** Month grid. `compact` renders a small widget-sized version with dots instead of titles. */
export function MonthGrid({
  events,
  compact = false,
  selected,
  onSelect,
}: {
  events: CalendarEvent[];
  compact?: boolean;
  selected?: Date | null;
  onSelect?: (day: Date) => void;
}) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = format(new Date(event.starts_at), "yyyy-MM-dd");
      map.set(key, [...(map.get(key) ?? []), event]);
    }
    return map;
  }, [events]);

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex items-center gap-2 pb-2">
        <div className={cn("min-w-0 flex-1 truncate font-medium", compact ? "text-xs" : "text-sm")}>
          {format(cursor, "MMMM yyyy")}
        </div>
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setCursor((c) => subMonths(c, 1))}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setCursor((c) => addMonths(c, 1))}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 pb-1 text-center text-[10px] uppercase tracking-wide text-muted-foreground">
        {WEEKDAYS.map((day, i) => (
          <div key={`${day}-${i}`}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = byDay.get(key) ?? [];
          const outside = !isSameMonth(day, cursor);
          const isSelected = selected ? isSameDay(day, selected) : false;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect?.(day)}
              className={cn(
                "min-w-0 rounded-lg border border-transparent p-1 text-left transition-colors hover:border-border hover:bg-accent/60",
                compact ? "h-9" : "h-20 sm:h-24",
                outside && "opacity-40",
                isSelected && "border-iris/60 bg-iris/10",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-5 items-center justify-center rounded-full text-[11px]",
                  isToday(day) ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {format(day, "d")}
              </span>
              {compact ? (
                dayEvents.length > 0 && (
                  <span className="mt-0.5 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((e) => (
                      <span key={e.id} className="size-1 rounded-full bg-teal" />
                    ))}
                  </span>
                )
              ) : (
                <span className="mt-1 flex flex-col gap-0.5">
                  {dayEvents.slice(0, 2).map((e) => (
                    <span
                      key={e.id}
                      className="truncate rounded bg-teal/15 px-1 text-[10px] text-foreground"
                    >
                      {e.title}
                    </span>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="px-1 text-[10px] text-muted-foreground">
                      +{dayEvents.length - 2} more
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
