ALTER TABLE public.apps
  ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_count integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.note_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Folder',
  pos_x integer NOT NULL DEFAULT 40,
  pos_y integer NOT NULL DEFAULT 40,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.note_folders TO authenticated;
GRANT ALL ON public.note_folders TO service_role;
ALTER TABLE public.note_folders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own note folders" ON public.note_folders;
CREATE POLICY "Users manage own note folders" ON public.note_folders FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS is_maximized boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES public.note_folders(id) ON DELETE SET NULL;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS links jsonb NOT NULL DEFAULT '[]'::jsonb;