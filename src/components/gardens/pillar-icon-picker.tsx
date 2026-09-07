import { PILLAR_ICON_NAMES, iconFor, accentText } from "@/lib/pillars";
import { cn } from "@/lib/utils";

export function PillarIconPicker({
  icon,
  accent,
  onIcon,
  onAccent,
}: {
  icon: string;
  accent: string;
  onIcon: (icon: string) => void;
  onAccent: (accent: "iris" | "teal") => void;
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-8 gap-1.5">
        {PILLAR_ICON_NAMES.map((name) => {
          const Icon = iconFor(name);
          return (
            <button
              key={name}
              type="button"
              aria-label={`Use the ${name} icon`}
              onClick={() => onIcon(name)}
              className={cn(
                "grid aspect-square place-items-center rounded-lg border border-border transition-colors hover:border-ring",
                icon === name && "border-ring bg-accent",
              )}
            >
              <Icon className={cn("size-4", accentText(accent))} />
            </button>
          );
        })}
      </div>
      <div className="flex gap-1.5">
        {(["iris", "teal"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onAccent(option)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] capitalize",
              accent === option && "border-ring bg-accent",
            )}
          >
            <span
              className={cn(
                "size-2.5 rounded-full",
                option === "iris" ? "bg-iris" : "bg-teal",
              )}
            />
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
