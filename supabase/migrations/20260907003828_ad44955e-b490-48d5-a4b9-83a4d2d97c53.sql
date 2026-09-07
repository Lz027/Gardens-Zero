alter table public.notes alter column pillar type text using pillar::text;
alter table public.threads alter column pillar type text using pillar::text;
alter table public.pillar_entries alter column pillar type text using pillar::text;
alter table public.events alter column pillar type text using pillar::text;

-- make sure every existing account has the four starter pillar folders
insert into public.pillars (user_id, slug, label, blurb, accent, icon, sort_order)
select p.id, v.slug, v.label, v.blurb, v.accent, v.icon, v.sort_order
from public.profiles p
cross join (values
  ('systems','Systems','The sync layer. Rules, reset logic, structure.','iris','Boxes',0),
  ('career','Career','Professional identity, credibility, income path.','teal','Briefcase',1),
  ('projects','Projects','Execution, outputs, proof, assets, build work.','iris','Hammer',2),
  ('academics','Academics','Study direction, requirements, academic progress.','teal','GraduationCap',3)
) as v(slug,label,blurb,accent,icon,sort_order)
on conflict (user_id, slug) do nothing;