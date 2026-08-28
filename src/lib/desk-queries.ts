import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type NoteInsert = Database["public"]["Tables"]["notes"]["Insert"];
export type NoteUpdate = Database["public"]["Tables"]["notes"]["Update"];
export type AppItem = Database["public"]["Tables"]["apps"]["Row"];
export type AppInsert = Database["public"]["Tables"]["apps"]["Insert"];

async function unwrap<T>(promise: PromiseLike<{ data: T | null; error: unknown }>) {
  const { data, error } = await promise;
  if (error) throw error instanceof Error ? error : new Error(JSON.stringify(error));
  return data as T;
}

async function userId() {
  const { data } = await supabase.auth.getUser();
  const id = data.user?.id;
  if (!id) throw new Error("Not signed in");
  return id;
}

export function useNotes() {
  return useQuery({
    queryKey: ["notes"],
    queryFn: () =>
      unwrap<Note[]>(
        supabase.from("notes").select("*").order("updated_at", { ascending: false }),
      ),
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<NoteInsert> = {}) => {
      const user_id = await userId();
      return unwrap<Note[]>(
        supabase
          .from("notes")
          .insert({ user_id, ...input } as NoteInsert)
          .select(),
      );
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: NoteUpdate & { id: string }) =>
      unwrap(supabase.from("notes").update(patch).eq("id", id).select()),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useCreateApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<AppInsert, "user_id">) => {
      const user_id = await userId();
      return unwrap<AppItem[]>(
        supabase
          .from("apps")
          .insert({ user_id, ...input } as AppInsert)
          .select(),
      );
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["apps"] }),
  });
}

export function useUpdateApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<AppItem> & { id: string }) =>
      unwrap(supabase.from("apps").update(patch).eq("id", id).select()),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["apps"] }),
  });
}

export function useDeleteApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("apps").update({ parent_id: null }).eq("parent_id", id);
      const { error } = await supabase.from("apps").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["apps"] }),
  });
}
