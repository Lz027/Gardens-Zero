# Garden Zero

> A private digital workspace for notes, conversations, planning, and the links that keep a project moving.

Garden Zero is a responsive personal workspace built around the feeling of a small operating system. It offers two complementary ways to work: a spatial desktop mode for arranging notes, folders, widgets, and links, and a focused chat mode for capturing and revisiting conversations. Users can move between these modes depending on the device, task, or preferred way of thinking.

The desktop experience is designed for larger screens, where notes can live in movable windows and related work can be grouped into **pillars**. The chat experience is optimized for mobile, with a familiar messaging layout that makes Garden Zero practical on a phone rather than a desktop interface simply compressed into a narrow viewport. On smaller screens, chat mode becomes the natural default while the wider workspace remains available as the responsive layout allows.

The project combines calm visual design with authenticated persistence, giving each signed-in user a private space for thinking, organizing, and returning to unfinished work across desktop and mobile.

## Workspace modes

| Mode | Best for | Experience |
| --- | --- | --- |
| **Desktop mode** | Planning, arranging, and exploring work on a larger screen | A spatial desk with floating notes, desktop folders, widgets, wallpapers, a recycle bin, and an app dock. |
| **Chat mode** | Quick capture, reflection, and mobile use | A focused conversation interface with saved threads, date separators, rename and delete actions, and pillar filing. It is optimized for touch-sized mobile layouts and is the default mode on smaller screens. |

The two modes are part of the same workspace rather than separate products. Notes, conversations, pillars, calendar information, and preferences remain connected through the shared authenticated data model.

## Core experience

| Workspace area | What is included |
| --- | --- |
| **Desk** | Draggable and resizable notes, desktop folders, a recycle bin, contextual placement actions, widgets, and selectable wallpapers in desktop mode. |
| **Chat mode** | A mobile-friendly, WhatsApp-style conversation surface with saved threads, date separators, rename and delete actions, and the ability to file a conversation into a pillar. |
| **Pillars** | Personal folders with editable names, descriptions, icons, accent colors, and progress-oriented entries. Starter pillars are available for a new workspace. |
| **Calendar** | A monthly view with event chips, a day detail panel, and event creation and removal. |
| **App dock** | A visual set of user-managed links treated as apps, with recent items and shortcuts available from the workspace. |
| **Widgets** | Calendar, clock, upcoming agenda, and shortcuts widgets that can be positioned on the desk. |
| **Settings** | Profile information, theme preferences, wallpaper selection, and pillar management. |
| **Authentication** | Email/password registration and sign-in, plus Google OAuth through Supabase. Authenticated workspace routes are protected by a route guard. |

The interface supports responsive layouts, light and dark themes, installable PWA metadata, persistent browser preferences, keyboard-friendly controls, and a focused visual language built from soft surfaces, subtle borders, and restrained motion.

## Technical architecture

Garden Zero is a full-stack React application built with TanStack Start. File-based TanStack Router routes define the application surface, while TanStack Query coordinates server reads, writes, caching, and invalidation. Supabase provides authentication, database access, storage integration, and row-level security.

| Layer | Implementation |
| --- | --- |
| Application | TanStack Start and React 19 |
| Routing | TanStack Router file-based routes |
| Build and server | Vite and Nitro |
| Styling | Tailwind CSS v4 with project-specific design tokens |
| Components | Radix UI primitives and reusable application components |
| Data and auth | Supabase and `@supabase/supabase-js` |
| Client state | TanStack Query |
| Content and chat UI | AI SDK, Streamdown, Markdown, code, math, and Mermaid renderers |
| Interaction | Motion, Embla Carousel, and custom desk interactions |
| Quality tooling | TypeScript, ESLint, Prettier, and Zod |

## Repository structure

```text
src/
  routes/                    File-based routes, layouts, and route guards
  components/gardens/        Desk, chat, dock, widgets, pillars, calendar, and brand UI
  components/ui/             Reusable interface primitives
  integrations/supabase/     Browser/server clients and generated database types
  lib/                       Queries, auth helpers, theme, wallpaper, and utilities
  assets/                    Product and brand assets
  styles.css                Global theme tokens and application styles
public/
  manifest.webmanifest       PWA metadata
  favicon.png                Browser favicon
  apple-touch-icon.png       Mobile home-screen icon
supabase/
  gardens-zero-schema.sql    Database schema, policies, grants, and starter data
```

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | Public entry page that directs signed-in users to the workspace and new users to authentication. |
| `/auth` | Account creation, email/password sign-in, and Google OAuth. |
| `/home` | Authenticated desk and chat workspace. |
| `/calendar` | Authenticated monthly calendar and event management. |
| `/pillars/:pillar` | A single authenticated pillar and its entries. |
| `/settings` | Authenticated profile, appearance, wallpaper, and pillar settings. |

The route tree is generated from the files in `src/routes`. The generated route manifest should not be edited manually.

## Persistence and data model

The database schema lives in `supabase/gardens-zero-schema.sql`. It is organized around a user-owned workspace, with row-level security policies limiting authenticated users to their own records.

| Data | Responsibility |
| --- | --- |
| `profiles` | Display name, biography, links, wallpaper, and theme preferences. |
| `pillars` and `pillar_entries` | Personal folders and progress/status entries. |
| `notes` and `note_folders` | Note content, spatial position, size, open/minimized state, and soft deletion. |
| `threads` and `messages` | Saved chat conversations and message history. |
| `events` | Calendar events and dates. |
| `apps`, `recents`, `notifications`, and `settings` | Dock links, recent activity, alerts, and workspace preferences. |

Theme and selected workspace preferences also use browser persistence so the interface remains consistent between visits.

## Local development

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

The development server runs on port `8080` by default. The application expects Supabase configuration for browser and server operations:

```sh
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
SUPABASE_URL=your-supabase-project-url
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
```

The service-role key is server-only and must never be exposed to browser code. Configure the authentication redirect URLs and Google provider before testing OAuth.

### Deploying outside Lovable (Netlify)

No environment variables are required. The backend URL and publishable key are baked into the build through `src/lib/backend-config.ts`, which environment variables override when they are present. `netlify.toml` already sets the build command, the `netlify` server preset, and the publish directory, so connecting the repository to Netlify and deploying is enough. Remember to add the deployed domain to the backend's allowed redirect URLs so sign-in works there.


## Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create the production build. |
| `npm run build:dev` | Create a development-mode build. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint across the project. |
| `npm run format` | Format source files with Prettier. |

## Product direction

Garden Zero is intentionally more flexible than a conventional productivity dashboard. Desktop mode gives notes a place and makes work spatial; chat mode provides a lower-friction, mobile-optimized way to capture ideas and continue conversations; pillars provide an adaptable vocabulary for grouping work; and the dock keeps important links close.

As a portfolio project, it demonstrates authenticated full-stack React development, route-level application structure, persistent CRUD workflows, responsive interaction design across desktop and mobile, Supabase row-level security, and the ability to carry a product concept from interface direction through working implementation.
