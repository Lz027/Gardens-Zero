import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  APPLICATION_STATUSES,
  useDashboard,
  useDeleteApplication,
  useUpdateApplication,
  type ApplicationStatus,
} from "@/lib/opportunity-queries";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard — Gardens Zero" }] }),
});
function DashboardPage() {
  const { applications, totals, byStatus } = useDashboard();
  const update = useUpdateApplication();
  const remove = useDeleteApplication();
  async function changeStatus(id: string, status: ApplicationStatus) {
    try {
      await update.mutateAsync({
        id,
        patch: {
          status,
          ...(status === "submitted" ? { submitted_at: new Date().toISOString() } : {}),
        },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update status");
    }
  }
  return (
    <main className="fog-surface min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-iris">Garden Zero / Progress</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Opportunity dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              A calm overview of what you are exploring and moving forward.
            </p>
          </div>
          <Button asChild>
            <Link to="/opportunities">Browse opportunities</Link>
          </Button>
        </header>
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Active opportunities" value={totals.activeOpportunities} />
          <Metric label="Saved" value={totals.saved} />
          <Metric label="Applications" value={totals.applications} />
        </div>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Application pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {APPLICATION_STATUSES.map((status) => (
                <div key={status} className="rounded-lg bg-accent p-3">
                  <p className="text-xs capitalize text-muted-foreground">{status}</p>
                  <p className="mt-1 text-2xl font-semibold">{byStatus[status]}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Your applications</h2>
          {applications.isLoading && (
            <p className="text-sm text-muted-foreground">Loading applications…</p>
          )}
          {!applications.isLoading && (applications.data ?? []).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No applications yet. Start with an opportunity that feels worth exploring.
              </CardContent>
            </Card>
          )}
          <div className="space-y-3">
            {(applications.data ?? []).map((application) => (
              <Card key={application.id}>
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{application.opportunity?.title ?? "Opportunity"}</p>
                    <p className="text-xs text-muted-foreground">
                      {application.opportunity?.provider ?? ""}
                    </p>
                    {application.next_action && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Next: {application.next_action}
                      </p>
                    )}
                  </div>
                  <select
                    aria-label="Application status"
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    value={application.status}
                    onChange={(e) =>
                      void changeStatus(application.id, e.target.value as ApplicationStatus)
                    }
                  >
                    {APPLICATION_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void remove.mutateAsync(application.id)}
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-semibold text-gradient-iris">{value}</p>
      </CardContent>
    </Card>
  );
}
