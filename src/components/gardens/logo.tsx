import logo from "@/assets/iris-mark.png";
import { cn } from "@/lib/utils";

export function GardensLogo({ className }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Gardens Zero iris mark"
      width={816}
      height={816}
      className={cn("object-contain", className)}
    />
  );
}

export function GardensWordmark({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <GardensLogo className="size-8 shrink-0" />
      {!compact && (
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight text-foreground">Gardens</div>
          <div className="text-gradient-iris text-sm font-semibold tracking-tight">Zero</div>
        </div>
      )}
    </div>
  );
}
