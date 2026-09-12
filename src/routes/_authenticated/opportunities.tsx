import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bookmark, CheckCircle2, ExternalLink, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useApplications,
  useCreateApplication,
  useOpportunities,
  useSaveOpportunity,
  useSavedOpportunities,
  useUnsaveOpportunity,
} from "@/lib/opportunity-queries";

export const Route = createFileRoute("/_authenticated/opportunities")({
  component: OpportunitiesPage,
  head: () => ({ meta: [{ title: "Opportunities — Gardens Zero" }] }),
});
function OpportunitiesPage() {
  const { data, isLoading, error } = useOpportunities();
  const { data: saved } = useSavedOpportunities();
  const { data: applications } = useApplications();
  const save = useSaveOpportunity();
  const unsave = useUnsaveOpportunity();
  const apply = useCreateApplication();
  const [query, setQuery] = useState("");
  const savedIds = new Set((saved ?? []).map((row) => row.opportunity_id));
  const appliedIds = new Set((applications ?? []).map((row) => row.opportunity_id));
  const rows = (data ?? []).filter((row) =>
    `${row.title} ${row.provider} ${row.country} ${row.level}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  async function toggleSave(id: string) {
    try {
      if (savedIds.has(id)) await unsave.mutateAsync(id);
      else await save.mutateAsync(id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update saved opportunities");
    }
  }
  async function startApplication(id: string) {
    try {
      await apply.mutateAsync(id);
      toast.success("Application tracker started");
    } catch (e) {
      toast.error(
        e instanceof Error && e.message.includes("duplicate")
          ? "You already track this application"
          : e instanceof Error
            ? e.message
            : "Could not start application",
      );
    }
  }
  return (
    <main className="fog-surface min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-teal">Garden Zero / Growth</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Opportunities</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Find, save, and move promising opportunities forward.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/dashboard">
                <LayoutDashboard className="size-4" /> Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/home">Workspace</Link>
            </Button>
          </div>
        </header>
        <input
          className="mb-6 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
          placeholder="Search by title, provider, country, or level"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isLoading && <p className="text-sm text-muted-foreground">Loading opportunities…</p>}
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
            Could not load opportunities. Check your connection and try again.
          </p>
        )}{" "}
        {!isLoading && !error && rows.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No active opportunities match your search.
            </CardContent>
          </Card>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((row) => (
            <Card key={row.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{row.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {row.provider} · {row.country}
                      {row.city ? ` · ${row.city}` : ""}
                    </CardDescription>
                  </div>
                  <button
                    aria-label={savedIds.has(row.id) ? "Unsave opportunity" : "Save opportunity"}
                    onClick={() => void toggleSave(row.id)}
                    className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Bookmark className={savedIds.has(row.id) ? "fill-current text-iris" : ""} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="line-clamp-3 text-sm text-muted-foreground">{row.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-accent px-2 py-1">{row.level}</span>
                  <span className="rounded-full bg-accent px-2 py-1">{row.opportunity_type}</span>
                  <span className="rounded-full bg-accent px-2 py-1">{row.funding_type}</span>
                </div>
                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                  <Button asChild size="sm" variant="outline">
                    <a href={row.official_url} target="_blank" rel="noreferrer">
                      Official site <ExternalLink />
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => void startApplication(row.id)}
                    disabled={appliedIds.has(row.id)}
                  >
                    {appliedIds.has(row.id) ? (
                      <>
                        <CheckCircle2 /> Tracking
                      </>
                    ) : (
                      "Track application"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
