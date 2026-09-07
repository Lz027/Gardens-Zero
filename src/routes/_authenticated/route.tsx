import { createFileRoute, Outlet, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Command, LayoutDashboard, LogOut, Moon, Settings as SettingsIcon, Sun } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppDock } from "@/components/gardens/app-dock";
import { PillarTaskbar } from "@/components/gardens/pillar-taskbar";
import { RightRail } from "@/components/gardens/right-rail";
import { CommandBar } from "@/components/gardens/command-bar";
import { GuideDialog } from "@/components/gardens/guide-dialog";
import { GardensWordmark } from "@/components/gardens/logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { useProfile } from "@/lib/queries";


export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    return { user: data.user };
  },
  component: WorkspaceShell,
});

const NAV = [
  { to: "/home", label: "Desk", icon: LayoutDashboard },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function WorkspaceShell() {
  const [commandOpen, setCommandOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const { data: profile } = useProfile();


  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="fog-surface flex h-screen overflow-hidden">
      <AppDock />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          <Link to="/home" className="md:hidden" aria-label="Go to the desk">
            <GardensWordmark />
          </Link>


          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "bg-accent text-foreground" }}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="ml-auto flex h-8 min-w-0 items-center gap-2 rounded-lg border border-border bg-card/60 px-3 text-xs text-muted-foreground transition-colors hover:text-foreground sm:w-72"
          >
            <Command className="size-3.5" />
            <span className="truncate">Search notes and apps</span>
            <kbd className="ml-auto hidden rounded border border-border px-1 font-mono text-[10px] sm:block">
              ⌘K
            </kbd>
          </button>

          <div className="flex items-center gap-1">
            <span className="hidden text-xs text-muted-foreground sm:block">
              {profile?.display_name ?? profile?.email ?? ""}
            </span>
            <GuideDialog />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={signOut} aria-label="Sign out">
              <LogOut className="size-4" />
            </Button>
          </div>

        </header>

        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
          <RightRail />
        </div>

        <PillarTaskbar />
      </div>

      <CommandBar open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
