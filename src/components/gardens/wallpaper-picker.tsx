import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WALLPAPERS, useWallpaper, wallpaperStyle } from "@/lib/wallpaper";
import { cn } from "@/lib/utils";

export function WallpaperPicker() {
  const { value, set } = useWallpaper();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  async function apply(next: string) {
    try {
      await set.mutateAsync(next);
      toast.success("Background updated");
      setOpen(false);
    } catch {
      toast.error("Could not save the background");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Change background">
          <ImageIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Background</DialogTitle>
          <DialogDescription>
            Pick a background for your desk and chat, or paste a picture link.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3">
          {WALLPAPERS.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => void apply(w.id)}
              className={cn(
                "glow-edge overflow-hidden rounded-xl border border-border text-left",
                value === w.id && "ring-2 ring-iris",
              )}
            >
              <span className="block h-16 w-full" style={wallpaperStyle(w.id)} />
              <span className="block px-2 py-1.5 text-xs">{w.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="wallpaper-url">Picture link</Label>
          <div className="flex gap-2">
            <Input
              id="wallpaper-url"
              placeholder="https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button
              onClick={() => {
                if (!/^https?:\/\//.test(url)) return toast.error("Paste a link starting with https");
                void apply(`url:${url}`);
              }}
            >
              Use
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
