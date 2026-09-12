/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const APPLICATION_STATUSES = [
  "planning",
  "preparing",
  "submitted",
  "interview",
  "accepted",
  "rejected",
  "withdrawn",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type Opportunity = {
  id: string;
  title: string;
  provider: string;
  description: string;
  country: string;
  city: string | null;
  level: string;
  opportunity_type: string;
  funding_type: string;
  official_url: string;
  deadline: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
export type SavedOpportunity = {
  id: string;
  user_id: string;
  opportunity_id: string;
  created_at: string;
};
export type Application = {
  id: string;
  user_id: string;
  opportunity_id: string;
  status: ApplicationStatus;
  notes: string;
  next_action: string | null;
  next_action_due_at: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  opportunity?: Opportunity;
};
const db = supabase as any;
async function unwrap<T>(request: PromiseLike<{ data: T | null; error: any }>) {
  const { data, error } = await request;
  if (error) throw error;
  return (data ?? []) as T;
}
export function useOpportunities() {
  return useQuery({
    queryKey: ["opportunities"],
    queryFn: () =>
      unwrap<Opportunity[]>(
        db
          .from("opportunities")
          .select("*")
          .eq("is_active", true)
          .order("deadline", { ascending: true, nullsFirst: false }),
      ),
  });
}
export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ["opportunity", id],
    enabled: Boolean(id),
    queryFn: () =>
      unwrap<Opportunity[]>(db.from("opportunities").select("*").eq("id", id).limit(1)).then(
        (rows) => rows[0] ?? null,
      ),
  });
}
export function useSavedOpportunities() {
  return useQuery({
    queryKey: ["saved-opportunities"],
    queryFn: () => unwrap<SavedOpportunity[]>(db.from("saved_opportunities").select("*")),
  });
}
export function useApplications() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: async () =>
      unwrap<Application[]>(
        db
          .from("applications")
          .select("*, opportunity:opportunities(*)")
          .order("updated_at", { ascending: false }),
      ),
  });
}
export function useDashboard() {
  const applications = useApplications();
  const saved = useSavedOpportunities();
  const opportunities = useOpportunities();
  const byStatus = APPLICATION_STATUSES.reduce<Record<ApplicationStatus, number>>(
    (result, status) => {
      result[status] = (applications.data ?? []).filter((row) => row.status === status).length;
      return result;
    },
    {} as Record<ApplicationStatus, number>,
  );
  return {
    applications,
    saved,
    opportunities,
    totals: {
      activeOpportunities: opportunities.data?.length ?? 0,
      saved: saved.data?.length ?? 0,
      applications: applications.data?.length ?? 0,
    },
    byStatus,
  };
}
export function useSaveOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (opportunityId: string) => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw new Error("Please sign in to save an opportunity");
      return db
        .from("saved_opportunities")
        .insert({ user_id: data.user.id, opportunity_id: opportunityId })
        .select()
        .single()
        .then((result: any) => {
          if (result.error) throw result.error;
          return result.data;
        });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-opportunities"] }),
  });
}
export function useUnsaveOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (opportunityId: string) =>
      db
        .from("saved_opportunities")
        .delete()
        .eq("opportunity_id", opportunityId)
        .then((result: any) => {
          if (result.error) throw result.error;
        }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-opportunities"] }),
  });
}
export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (opportunityId: string) => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw new Error("Please sign in to track an application");
      return db
        .from("applications")
        .insert({ user_id: data.user.id, opportunity_id: opportunityId })
        .select()
        .single()
        .then((result: any) => {
          if (result.error) throw result.error;
          return result.data;
        });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });
}
export function useUpdateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<
        Pick<
          Application,
          "status" | "notes" | "next_action" | "next_action_due_at" | "submitted_at"
        >
      >;
    }) =>
      db
        .from("applications")
        .update(patch)
        .eq("id", id)
        .select()
        .single()
        .then((result: any) => {
          if (result.error) throw result.error;
          return result.data;
        }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });
}
export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      db
        .from("applications")
        .delete()
        .eq("id", id)
        .then((result: any) => {
          if (result.error) throw result.error;
        }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
  });
}
