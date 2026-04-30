# ReactApp_3 – Task Logger

**Course:** MWD4C – React Development | Assignment 3  
**Student repo:** https://github.com/melakunet/ReactApp_3

## About

A full-stack Task Logger app built with **Next.js 16**, **React 19**, and **TypeScript**.  
Users can view, add, complete, and delete tasks. Data is stored in a local SQLite database using `@libsql/client`.

## Features

- ✅ View a list of tasks fetched from a SQLite database (server-side fetch)
- ✅ Add a new task using a form (react-hook-form + Zod validation)
- ✅ Mark a task as complete / incomplete
- ✅ Delete a task

## Tech Stack

| Tool | Purpose |
|---|---|
| Next.js 16 (App Router) | Framework |
| React 19 | UI library |
| TypeScript | Type safety |
| react-hook-form | Form state management |
| Zod | Schema validation (client + server) |
| @libsql/client | SQLite database (local file) |
| CSS Modules | Styling |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with header
│   ├── page.tsx            # Home page (server component)
│   ├── globals.css         # Global styles
│   └── page.module.css     # Home page styles
├── components/
│   ├── TaskForm.tsx        # Add task form (client component)
│   ├── TaskList.tsx        # Task list (server component)
│   ├── TaskItem.tsx        # Single task row (client component)
│   └── *.module.css        # Component styles
└── data/
    ├── schema.ts           # Zod validation schema
    ├── tasks.ts            # Database helpers (initDb, getTasks, etc.)
    ├── addTask.ts          # Server Action: add a task
    ├── markComplete.ts     # Server Action: toggle complete
    └── removeTask.ts       # Server Action: delete a task
```

## How to Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
npm run build
npm start
```
