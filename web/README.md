# K8s Interview Prep — web app

A visual study hub for the team to revise Kubernetes and prep for interviews.
Content is generated from the lesson notes in [`../theory/`](../theory).

## Features

- **Interactive diagrams** — click any component in the **cluster architecture**,
  **networking**, or **storage** diagram to see what it does, with the interview
  questions that go with it.
- **Lessons** — all 48 CKA-style lessons, rendered with tables and syntax
  highlighting, plus search.
- **Flashcards** — flip Q&A cards by topic and difficulty.
- **Quiz** — multiple-choice questions with instant feedback and scoring.

## Run locally

```bash
cd web
pnpm install
pnpm dev      # http://localhost:5173
```

## Build for production

```bash
pnpm build    # outputs static files to web/dist/
pnpm preview  # serve the built site locally
```

The build uses a hash router and relative asset paths, so `dist/` can be hosted
as-is on GitHub Pages, Vercel, Netlify, or any static file server.

## Updating content

Lesson pages are generated from the repo's `theory/**/README.md` files into
`src/data/lessons.json`. This runs automatically before `dev` and `build`, or
manually:

```bash
pnpm gen
```

Interview questions and the diagram data live in:

- `src/data/questions.ts` — flashcards + quiz questions
- `src/data/architecture.ts`, `networking.ts`, `storage.ts` — the three diagrams
  (nodes, edges, and their Q&A); registered in `src/data/diagrams.ts`
- `src/data/curriculum.ts` — section titles, icons, and descriptions

## Tech stack

Vite · React · TypeScript · Tailwind CSS · react-markdown · pnpm.
