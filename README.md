# Gardens Zero

A personal workspace that feels like a small operating system: a notes desk with
floating windows and widgets, a chat mode for quick thinking, customizable
folders ("pillars"), a calendar, and an app dock — all private to one signed-in
person.

**Live app**: https://garden-of-zero.lovable.app

## What's inside

| Area | What it does |
| --- | --- |
| Desk (`/home`, desk mode) | Draggable, resizable note windows, desktop folders, recycle bin, right-click to place a note or folder, background picker, addable widgets |
| Chat mode (`/home`, chat mode) | WhatsApp-style saved conversations with date separators, rename, delete, pillar filing. Default on phones |
| Widgets | Calendar, clock, up-next agenda and shortcuts cards; drag to place, positions kept in the browser |
| Folders (`/pillars/$pillar`) | Customizable named folders with a pick-your-icon set and accent colour. Four starters are seeded and can be renamed or deleted |
| Calendar (`/calendar`) | Month grid with event chips, day panel to add and remove events |
| Settings (`/settings`) | Profile, theme, folder management |
| Auth (`/auth`) | Email and Google sign-in; everything behind `/_authenticated` |

Light theme is the default with a dark toggle; the choice is stored per person.
The app is installable as a PWA (manifest plus 192/512/1024 and maskable icons).

## Tech

- TanStack Start v1 (React 19, file-based routing in `src/routes`), Vite 7
- Tailwind CSS v4 via `src/styles.css`, shadcn/ui components
- TanStack Query for all reads and writes
- Supabase for database, auth and storage, with row-level security per user

## Project layout

```
src/
  routes/                 file-based routes (__root, index, auth, _authenticated/*)
  components/gardens/     desk, widgets, chat, dock, taskbar, calendar grid, logo
  components/ui/          shadcn primitives
  lib/                    queries (desk, chat, pillars, events), theme, wallpaper, utils
  integrations/supabase/  generated client and types
supabase/
  gardens-zero-schema.sql full schema: tables, grants, RLS policies, seeds
```

## Backend configuration (environment only)

No keys are hardcoded. The client reads:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

To deploy outside Lovable (e.g. Netlify):

1. Set those three variables in the host's environment settings.
2. Build command `npm run build`, then serve the produced output.
3. In the Supabase project, set the site URL to your deployed domain and add it
   to the redirect allow-list, then enable Email and Google providers.
4. If you are starting a fresh database, run `supabase/gardens-zero-schema.sql`
   in the SQL editor — it is re-runnable and seeds the starter folders.

## Local development

```sh
npm i
npm run dev     # http://localhost:8080
```

## Data model (summary)

- `profiles` — display name, bio, links, wallpaper, theme
- `pillars` — user-owned folders: slug, label, blurb, icon, accent, sort order
- `notes`, `note_folders` — desk notes with position, size, open/minimized state,
  soft delete via `deleted_at`
- `threads`, `messages` — chat conversations and their bubbles
- `pillar_entries` — status log entries per folder
- `events` — calendar items
- `apps`, `recents`, `notifications`, `settings` — dock links, history, alerts

Every table is row-level-secured to `auth.uid()` and granted to `authenticated`.
