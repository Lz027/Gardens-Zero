import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GardensLogo } from "@/components/gardens/logo";
import { Button } from "@/components/ui/button";
import { STARTER_PILLARS } from "@/lib/pillars";

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
          Your notes desk and{" "}
          <span className="text-gradient-iris">app dock, in one calm place</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Write in floating note windows on a desk you arrange yourself, or chat your thoughts out
          on your phone. Keep the links you live in as apps, one tap away, and file everything under
          folders you name yourself.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link to="/auth">Enter the workspace</Link>
          </Button>
          <span className="text-xs text-muted-foreground">
            New here? Everything is explained inside, under the question mark.
          </span>
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl gap-3 px-6 pb-24 sm:grid-cols-2">
        {STARTER_PILLARS.map((pillar) => (
          <div key={pillar.slug} className="panel rounded-xl p-5 text-left">
            <div
              className={
                pillar.accent === "iris"
                  ? "text-xs uppercase tracking-widest text-iris"
                  : "text-xs uppercase tracking-widest text-teal"
              }
            >
              {pillar.label}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{pillar.blurb}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
