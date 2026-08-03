# Gardens Zero — Personal Workspace OS

A private, single-user workspace that feels like a calm operating system: memory at the core, an adaptable AI assistant, and your four-pillar life system (Systems, Career, Projects, Academics) as first-class structure.

## Look and feel

- Palette: near-black and ghost-white foggy surfaces, with teal/turquoise as the working accent and magenta reserved for highlights, alerts, and active states.
- Chat and app background: soft foggy off-white in light mode, deep charcoal in dark mode. Dark mode default, light mode toggle.
- Iris-garden theme applied lightly: subtle gradient fog, soft glows, no heavy ornament.
- Density and typography tuned for all-day use: quiet borders, generous line height, keyboard-first.
- Logo: a generated foggy, ethereal garden of iris flowers in magenta and turquoise, used as the app mark and sign-in art.

## Layout

```text
┌────────────┬──────────────────────────────────────┬──────────┐
│  Sidebar   │  Command bar (search everything)     │ Right    │
│            ├──────────────────────────────────────┤ rail     │
│ Apps       │                                      │          │
│ (logo tiles│   Main surface:                      │ Calendar │
│  + links)  │   Chat / Pillars / Memory / Calendar │ Notifs   │
│            │                                      │ Quick    │
│ Recents    │                                      │ capture  │
│ Pillars    │                                      │          │
└────────────┴──────────────────────────────────────┴──────────┘
```

- Sidebar: add/edit/reorder app links, each with a fetched or uploaded logo tile, plus recently visited items. Fully editable by you.
- Command bar: one search box across memory, chats, notes, pillar entries, tasks, and app links. Keyboard shortcut to focus from anywhere.
- Right rail: built-in calendar and notification center, collapsible.

## Core features

**Memory core**
- Every chat, note, and pillar entry feeds a single memory store with type, pillar, tags, and timestamps.
- The AI auto-extracts facts, decisions, blockers, and next steps from conversations and saves them as memory entries you can review, edit, pin, or delete.
- The assistant loads relevant memory into context on every message, so it never feels contextless.
- A memory browser page: filter by pillar, type, date, pinned.

**Four pillars**
- Systems, Career, Projects, Academics each get a page with status narrative fields: done, in progress, changed, unchanged, blocked, next.
- Systems acts as the sync hub, showing cross-pillar signal.
- Monthly sync: generates a rollup summary per pillar from memory and entries, saved as a snapshot you can revisit.

**AI chat**
- Threaded conversations with a thread list, each thread at its own URL, saved to your account.
- Streaming responses, markdown rendering, thinking indicator.
- Adaptable assistant: editable system prompt/persona, selectable model, and toggles for which pillars and memory scopes it can see.

**Calendar and notifications**
- Built-in month/week calendar with events linked to pillars and tasks.
- Notification center for reminders, sync-due prompts, and blocked items.

**Account and sync**
- Email + password and Google sign-in.
- Everything stored in the cloud database, scoped to your account, so it syncs across devices.
- File storage for app logos, uploads, and attachments.

## Technical approach

- TanStack Start with file-based routes: public `/auth`, everything else under a protected `_authenticated` layout. Workspace shell as the layout, pillar/memory/calendar/chat as child routes, threads at `/chat/$threadId`.
- Lovable Cloud for database, auth (email/password + Google), and storage.
- Tables: `profiles`, `apps` (sidebar links), `recents`, `threads`, `messages`, `memory_entries`, `pillar_entries`, `pillar_snapshots`, `events`, `notifications`, `settings`. RLS on every table scoped to `auth.uid()`, plus explicit grants.
- AI via Lovable AI Gateway using `openai/gpt-5.6-sol` on the Responses API, streamed through a TanStack server route. Memory retrieval and auto-extraction run server-side.
- Chat UI built with AI Elements primitives; messages persisted per thread and restored on reload.
- Design tokens defined in `src/styles.css` (fog, ink, teal, magenta) — no hardcoded colors in components.
- No SEO work beyond basic route titles, since the site is personal.

## Build order

1. Enable Cloud, auth pages, protected layout, schema + RLS.
2. Design tokens, logo generation, workspace shell (sidebar, command bar, right rail).
3. Memory core: schema, browser, search.
4. Threaded AI chat with memory injection and auto-extraction.
5. Pillars pages, monthly sync snapshots.
6. Calendar and notifications.
7. Sidebar app manager, recents, settings (persona, model, memory scopes).

Once this is running, share your full system layers and I will map them into the pillar structure.
