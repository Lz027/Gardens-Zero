import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type NoteInsert = Database["public"]["Tables"]["notes"]["Insert"];
export type NoteUpdate = Database["public"]["Tables"]["notes"]["Update"];
export type AppItem = Database["public"]["Tables"]["apps"]["Row"];
export type AppInsert = Database["public"]["Tables"]["apps"]["Insert"];
export type NoteFolder = Database["public"]["Tables"]["note_folders"]["Row"];

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

/** Live notes (everything not in the trash bin). */
export function useNotes() {
  return useQuery({
    queryKey: ["notes"],
    queryFn: () =>
      unwrap<Note[]>(
        supabase
          .from("notes")
          .select("*")
          .is("deleted_at", null)
          .order("updated_at", { ascending: false }),
      ),
  });
}

/** Notes sitting in the trash bin. */
export function useTrashedNotes() {
  return useQuery({
    queryKey: ["notes", "trash"],
    queryFn: () =>
      unwrap<Note[]>(
        supabase
          .from("notes")
          .select("*")
          .not("deleted_at", "is", null)
          .order("deleted_at", { ascending: false }),
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

/** Soft delete — the note moves to the trash bin. */
export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notes")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useRestoreNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").update({ deleted_at: null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function usePurgeNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

/* ---------------------------------- folders --------------------------------- */

export function useNoteFolders() {
  return useQuery({
    queryKey: ["note_folders"],
    queryFn: () =>
      unwrap<NoteFolder[]>(
        supabase.from("note_folders").select("*").order("created_at", { ascending: true }),
      ),
  });
}

export function useCreateNoteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name?: string; pos_x?: number; pos_y?: number } = {}) => {
      const user_id = await userId();
      return unwrap<NoteFolder[]>(
        supabase
          .from("note_folders")
          .insert({ user_id, ...input })
          .select(),
      );
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["note_folders"] }),
  });
}

export function useUpdateNoteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<NoteFolder> & { id: string }) =>
      unwrap(supabase.from("note_folders").update(patch).eq("id", id).select()),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["note_folders"] }),
  });
}

export function useDeleteNoteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("note_folders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["note_folders"] });
      void qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

/* ----------------------------------- apps ----------------------------------- */

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

/** Counts a share and returns the link to copy. */
export function useShareApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (app: AppItem) => {
      const { error } = await supabase
        .from("apps")
        .update({ share_count: (app.share_count ?? 0) + 1 })
        .eq("id", app.id);
      if (error) throw error;
      return app.url;
    },
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
