import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GardensLogo } from "@/components/gardens/logo";
import { Button } from "@/components/ui/button";
import { PILLARS, PILLAR_META } from "@/lib/pillars";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gardens Zero — Notes Desk & App Dock" },
      {
        name: "description",
        content:
          "A desktop-style notes workspace: floating note windows, desktop folders and a recycle bin, plus a sliding dock of your favourite links as apps.",
      },
      { property: "og:title", content: "Gardens Zero — Notes Desk & App Dock" },
      {
        property: "og:description",
        content:
          "Write notes in movable windows, file them into pillar folders, and keep your links one click away in the app dock.",
      },
    ],
    links: [{ rel: "canonical", href: "https://garden-of-zero.lovable.app/" }],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      const stored = sessionStorage.getItem("gz:redirect");
      sessionStorage.removeItem("gz:redirect");
      navigate({ to: stored && stored.startsWith("/") ? stored : "/home", replace: true });
    });
  }, [navigate]);

  return (
    <main className="fog-surface min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <GardensLogo className="size-9" />
          <span className="text-sm font-semibold tracking-tight">
            Gardens <span className="text-gradient-iris">Zero</span>
          </span>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-16 pt-16 text-center">
        <GardensLogo className="mx-auto size-40 shadow-2xl" />
        <h1 className="mt-10 text-4xl font-semibold tracking-tight sm:text-5xl">
          A quiet operating system for{" "}
          <span className="text-gradient-iris">the whole of your life</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Four pillars, one memory. Gardens Zero tracks what was done, what changed, what stayed
          the same and what comes next — and its resident intelligence, Zero, remembers all of it
          without being asked twice.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg">
            <Link to="/auth">Enter the workspace</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl gap-3 px-6 pb-24 sm:grid-cols-2">
        {PILLARS.map((pillar) => (
          <div key={pillar} className="panel rounded-xl p-5 text-left">
            <div
              className={
                PILLAR_META[pillar].accent === "iris"
                  ? "text-xs uppercase tracking-widest text-iris"
                  : "text-xs uppercase tracking-widest text-teal"
              }
            >
              {PILLAR_META[pillar].label}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{PILLAR_META[pillar].blurb}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
