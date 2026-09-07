# Gardens Zero

Gardens Zero is a private, desktop-style workspace for turning scattered thoughts into an organized personal system. It combines a floating notes desk, persistent folders called **pillars**, a calendar, a focused chat mode, customizable widgets, and an application dock in one calm, visual environment.

The project is designed around the idea that a workspace should feel less like a dashboard and more like a small operating system: personal, spatial, and easy to return to.

## Product overview

| Area                         | Implemented experience                                                                                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Desk (`/home`)               | A draggable workspace with floating note windows, desktop folders, a recycle bin, contextual placement actions, widgets, and selectable wallpapers.        |
| Chat mode (`/home`)          | Saved conversations with date separators, renaming, deletion, and filing into pillars. On smaller screens, chat is the default workspace mode.             |
| Widgets                      | Calendar, clock, upcoming agenda, and shortcuts widgets. Positions are persisted in the browser so the desk can be arranged to suit the user.              |
| Pillars (`/pillars/:pillar`) | User-owned folders with editable names, descriptions, icons, accent colors, and progress-oriented entries. Starter pillars are seeded for a new workspace. |
| Calendar (`/calendar`)       | A monthly calendar with event chips, a day detail panel, and event creation and removal.                                                                   |
| Settings (`/settings`)       | Profile information, appearance preferences, and pillar management.                                                                                        |
| Authentication (`/auth`)     | Email/password registration and sign-in, plus Google OAuth through Supabase. Authenticated routes are protected by the application route guard.            |

The interface supports light and dark themes, responsive layouts, keyboard-friendly controls, installable PWA metadata, and browser-persisted theme and workspace preferences.

## Technology

Gardens Zero is built as a full-stack React application using TanStack Start and file-based TanStack Router routes. Supabase provides authentication, PostgreSQL data access, storage integration, and row-level security. TanStack Query manages client-side reads, mutations, caching, and invalidation.

| Layer                   | Technology                                                      |
| ----------------------- | --------------------------------------------------------------- |
| Application framework   | TanStack Start with React 19                                    |
| Routing                 | TanStack Router file-based routing                              |
| Build system            | Vite with Nitro                                                 |
| Styling                 | Tailwind CSS v4 and project-specific CSS tokens                 |
| UI primitives           | Radix UI components with reusable application wrappers          |
| Data and authentication | Supabase and `@supabase/supabase-js`                            |
| Client data state       | TanStack Query                                                  |
| AI and chat UI          | AI SDK, Streamdown, Markdown, code, math, and Mermaid renderers |
| Motion and interaction  | Motion, Embla Carousel, and custom workspace interactions       |
| Validation and tooling  | TypeScript, ESLint, Prettier, and Zod                           |

## Project structure

```text
src/
  routes/                    File-based application routes and layouts
  components/gardens/        Desk, chat, dock, widgets, pillars, calendar, and brand UI
  components/ui/             Reusable interface primitives
  integrations/supabase/     Browser/server clients and generated database types
  lib/                       Queries, theme, wallpaper, auth helpers, and utilities
  assets/                    Product and brand assets
  styles.css                Global theme tokens and application styling
public/
  manifest.webmanifest       PWA metadata
  favicon.png                Browser favicon
  apple-touch-icon.png       iOS home-screen icon
supabase/
  gardens-zero-schema.sql    Database schema, policies, grants, and starter data
```

## Routes

| Route              | Purpose                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `/`                | Entry point that directs users to the workspace or authentication flow. |
| `/auth`            | Sign-in and account creation.                                           |
| `/home`            | Authenticated desk and chat workspace.                                  |
| `/calendar`        | Authenticated calendar view.                                            |
| `/pillars/:pillar` | A single authenticated pillar and its entries.                          |
| `/settings`        | Authenticated profile, theme, and pillar settings.                      |

TanStack Start generates the route tree from the files in `src/routes`. The generated route manifest should not be edited manually.

## Data model

The Supabase schema is defined in `supabase/gardens-zero-schema.sql`. The principal tables are organized around a single user-owned workspace.

| Table group                                        | Responsibility                                                               |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| `profiles`                                         | Display name, biography, links, wallpaper, and theme preferences.            |
| `pillars` and `pillar_entries`                     | Personal folders and progress/status entries associated with each folder.    |
| `notes` and `note_folders`                         | Desk notes, spatial position, size, open/minimized state, and soft deletion. |
| `threads` and `messages`                           | Saved chat conversations and message history.                                |
| `events`                                           | Calendar events and their dates.                                             |
| `apps`, `recents`, `notifications`, and `settings` | Dock links, recent activity, alerts, and additional workspace settings.      |

The schema uses Supabase row-level security so authenticated users can access only their own workspace data.

## Local development

Install the project dependencies and start the Vite development server:

```sh
npm install
npm run dev
```

The development server runs on port `8080` by default.

Before running the application, configure the Supabase values used by the browser and server clients:

```sh
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
SUPABASE_URL=your-supabase-project-url
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
```

The service-role key is server-only and must never be exposed to browser code. Configure the authentication redirect URLs and Google provider in the Supabase project before testing OAuth locally or in a deployed environment. For a new database, run `supabase/gardens-zero-schema.sql` in the Supabase SQL editor.

## Available commands

| Command             | Purpose                               |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start the Vite development server.    |
| `npm run build`     | Create a production build.            |
| `npm run build:dev` | Create a development-mode build.      |
| `npm run preview`   | Preview the production build locally. |
| `npm run lint`      | Run ESLint across the project.        |
| `npm run format`    | Format project files with Prettier.   |

## Design principles

Gardens Zero keeps high-frequency actions close to the workspace surface. Notes remain spatial instead of becoming another long list, pillars provide a simple organizing vocabulary, and the dock makes frequently used links available without taking over the screen. The visual system uses soft surfaces, restrained contrast, and subtle motion to keep the experience focused while still feeling personal.

The repository is intended as a portfolio project demonstrating full-stack React application structure, authenticated CRUD flows, responsive workspace interactions, route-level data loading, Supabase row-level security, and a cohesive product interface.
