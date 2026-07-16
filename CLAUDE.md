# Project: Personal Site

## Overview
A personal site combining a portfolio, a landing page for current projects/ventures, and
space for blog-style writing. Single-owner site, no user accounts or backend data needed
for v1.

## Tech Stack
- Framework: Next.js (App Router) + React
- Styling: Tailwind CSS
- Language: TypeScript preferred over plain JS
- Hosting target: Vercel

## Commands
```
npm run dev      # start local dev server
npm run build    # production build
npm run lint      # check code style
```

## Structure & Conventions
- Keep components small and single-purpose; split anything over ~150 lines.
- Put shared UI (buttons, nav, footer) in /components.
- Put page-level content in /app (App Router convention).
- Use Tailwind utility classes directly; avoid custom CSS files unless Tailwind can't do it.

## Design Direction
- Navigation concept: inspired by the Geometry Dash main menu — a central hub with
  clickable directional arrows (up/down/left/right) that navigate to different
  sections/pages instead of a traditional navbar.
- Aesthetic: futuristic/techno, neon green accents on a dark background, glow/pulse
  effects on interactive elements (arrows, buttons, hover states).
- Motion matters here — favor smooth transitions/animations between sections over
  static page loads, to keep the "menu" feel intact.

## Things to Avoid
- Don't add new npm dependencies without checking with me first.
- Don't overcomplicate v1 — no user accounts, no CMS, no backend unless I ask for it.
- Ask before restructuring folders/files that already exist.

## Current Status / v1 Goal
- [Fill in once we scope the pages/sections — e.g. "Home, Projects, About, Contact live and working."]
