# K8s Interview Prep — web app

A visual study hub for the team to revise Kubernetes and prep for interviews.
Content is generated from the lesson notes in [`../theory/`](../theory).

## Features

- **Interactive architecture diagram** — click any control-plane / worker
  component to see what it does and the interview questions about it.
- **Lessons** — all 48 CKA-style lessons, rendered with tables and syntax
  highlighting, plus search.
- **Flashcards** — flip Q&A cards by topic and difficulty.
- **Quiz** — multiple-choice questions with instant feedback and scoring.

## Run locally

```bash
cd web
npm install
npm run dev      # http://localhost:5173
```

## Build for production

```bash
npm run build    # outputs static files to web/dist/
npm run preview  # serve the built site locally
```

The build uses a hash router and relative asset paths, so `dist/` can be hosted
as-is on GitHub Pages, Vercel, Netlify, or any static file server.

## Updating content

Lesson pages are generated from the repo's `theory/**/README.md` files into
`src/data/lessons.json`. This runs automatically before `dev` and `build`, or
manually:

```bash
npm run gen
```

Interview questions and the architecture diagram data live in:

- `src/data/questions.ts` — flashcards + quiz questions
- `src/data/architecture.ts` — diagram nodes, edges, and their Q&A
- `src/data/curriculum.ts` — section titles, icons, and descriptions

## Tech stack

Vite · React · TypeScript · Tailwind CSS · react-markdown.
