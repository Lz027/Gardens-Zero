import { Link, useRouterState } from "@tanstack/react-router";
import {
  Boxes,
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  Hammer,
  Brain,
  MessagesSquare,
  Settings as SettingsIcon,
  LayoutDashboard,
  ExternalLink,
} from "lucide-react";
import { GardensWordmark } from "@/components/gardens/logo";
import { useApps } from "@/lib/queries";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/home", label: "Overview", icon: LayoutDashboard },
  { to: "/chat", label: "Zero", icon: MessagesSquare },
  { to: "/memory", label: "Memory core", icon: Brain },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
] as const;

const PILLAR_NAV = [
  { pillar: "systems", label: "Systems", icon: Boxes },
  { pillar: "career", label: "Career", icon: BriefcaseBusiness },
  { pillar: "projects", label: "Projects", icon: Hammer },
  { pillar: "academics", label: "Academics", icon: GraduationCap },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: apps } = useApps();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="px-4 py-4">
        <Link to="/home">
          <GardensWordmark />
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        <div className="space-y-0.5">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
                pathname.startsWith(item.to) && "bg-sidebar-accent font-medium",
              )}
            >
              <item.icon className="size-4 text-teal" />
              {item.label}
            </Link>
          ))}
        </div>

        <div>
          <div className="px-2.5 pb-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
            Pillars
          </div>
          <div className="space-y-0.5">
            {PILLAR_NAV.map((item) => {
              const active = pathname === `/pillars/${item.pillar}`;
              return (
                <Link
                  key={item.pillar}
                  to="/pillars/$pillar"
                  params={{ pillar: item.pillar }}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
                    active && "bg-sidebar-accent font-medium",
                  )}
                >
                  <item.icon className="size-4 text-iris" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {apps && apps.length > 0 && (
          <div>
            <div className="px-2.5 pb-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
              Apps
            </div>
            <div className="space-y-0.5">
              {apps.map((app) => (
                <a
                  key={app.id}
                  href={app.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                >
                  <ExternalLink className="size-4 text-muted-foreground" />
                  <span className="truncate">{app.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
            pathname === "/settings" && "bg-sidebar-accent font-medium",
          )}
        >
          <SettingsIcon className="size-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
