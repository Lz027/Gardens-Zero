
CREATE TABLE IF NOT EXISTS public.pillars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  label text not null,
  blurb text default '',
  accent text not null default 'iris',
  icon text not null default 'Boxes',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pillars TO authenticated;
GRANT ALL ON public.pillars TO service_role;
ALTER TABLE public.pillars ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users manage their own pillars" ON public.pillars FOR ALL TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS pillar_id uuid REFERENCES public.pillars(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallpaper text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'light';

-- seed the four starter pillars for every existing profile
INSERT INTO public.pillars (user_id, slug, label, blurb, accent, icon, sort_order)
SELECT p.id, v.slug, v.label, v.blurb, v.accent, v.icon, v.sort_order
FROM public.profiles p
CROSS JOIN (VALUES
  ('systems','Systems','The sync layer. Rules, reset logic, structure.','iris','Boxes',0),
  ('career','Career','Professional identity, credibility, income path.','teal','Briefcase',1),
  ('projects','Projects','Execution, outputs, proof, assets, build work.','iris','Hammer',2),
  ('academics','Academics','Study direction, requirements, academic progress.','teal','GraduationCap',3)
) AS v(slug,label,blurb,accent,icon,sort_order)
ON CONFLICT (user_id, slug) DO NOTHING;

-- backfill note links from the legacy enum column
UPDATE public.notes n SET pillar_id = pl.id
FROM public.pillars pl
WHERE n.pillar_id IS NULL AND n.pillar IS NOT NULL
  AND pl.user_id = n.user_id AND pl.slug = n.pillar::text;

CREATE OR REPLACE FUNCTION public.seed_default_pillars()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.pillars (user_id, slug, label, blurb, accent, icon, sort_order)
  VALUES
    (NEW.id,'systems','Systems','The sync layer. Rules, reset logic, structure.','iris','Boxes',0),
    (NEW.id,'career','Career','Professional identity, credibility, income path.','teal','Briefcase',1),
    (NEW.id,'projects','Projects','Execution, outputs, proof, assets, build work.','iris','Hammer',2),
    (NEW.id,'academics','Academics','Study direction, requirements, academic progress.','teal','GraduationCap',3)
  ON CONFLICT (user_id, slug) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS seed_pillars_on_profile ON public.profiles;
CREATE TRIGGER seed_pillars_on_profile AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.seed_default_pillars();
