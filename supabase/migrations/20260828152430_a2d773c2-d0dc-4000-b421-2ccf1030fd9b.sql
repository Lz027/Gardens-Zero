CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Untitled note',
  body text NOT NULL DEFAULT '',
  pillar pillar,
  pos_x integer NOT NULL DEFAULT 80,
  pos_y integer NOT NULL DEFAULT 80,
  width integer NOT NULL DEFAULT 380,
  height integer NOT NULL DEFAULT 300,
  z_index integer NOT NULL DEFAULT 1,
  is_open boolean NOT NULL DEFAULT true,
  is_minimized boolean NOT NULL DEFAULT false,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own notes" ON public.notes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER notes_set_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.apps
  ADD COLUMN is_folder boolean NOT NULL DEFAULT false,
  ADD COLUMN parent_id uuid REFERENCES public.apps(id) ON DELETE SET NULL,
  ALTER COLUMN url SET DEFAULT '';

CREATE INDEX notes_user_idx ON public.notes(user_id, updated_at DESC);
CREATE INDEX apps_parent_idx ON public.apps(parent_id);