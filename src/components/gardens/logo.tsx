import logo from "@/assets/gardens-zero-logo.png";
import { cn } from "@/lib/utils";

export function GardensLogo({ className }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Gardens Zero — a foggy garden of magenta and turquoise irises"
      className={cn("rounded-lg object-cover", className)}
    />
  );
}

export function GardensWordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <GardensLogo className="size-8 shrink-0" />
      <div className="leading-none">
        <div className="text-sm font-semibold tracking-tight text-foreground">Gardens</div>
        <div className="text-gradient-iris text-sm font-semibold tracking-tight">Zero</div>
      </div>
    </div>
  );
}
