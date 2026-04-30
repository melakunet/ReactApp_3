// 'use server' makes every export in this file a Server Action.
// These helpers are called from other Server Actions (addTask, markComplete,
// removeTask) – never directly from client components.
'use server';

import { createClient, type Client } from '@libsql/client';
import path from 'path';

// Build an absolute path to the SQLite file so it works regardless of
// the working directory Next.js chooses at runtime.
const DB_PATH = path.resolve(process.cwd(), 'src/data/tasks.db');

/** Open a short-lived libSQL connection to the local SQLite file. */
function getClient(): Client {
  return createClient({ url: `file:${DB_PATH}` });
}

/**
 * Represents one row returned by the tasks table.
 * `completed` is stored as INTEGER (0/1) because SQLite has no boolean type.
 */
export type Task = {
  id: number;
  title: string;
  description: string | null;
  completed: number; // 0 = not done, 1 = done
  created_at: string;
};

/**
 * Creates the tasks table the first time the app starts.
 * IF NOT EXISTS means this is safe to call on every request.
 */
export async function initDb(): Promise<void> {
  const client = getClient();
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        title       TEXT    NOT NULL,
        description TEXT,
        completed   INTEGER NOT NULL DEFAULT 0,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
      )
    `);
  } finally {
    client.close();
  }
}

/** Returns all tasks, newest first. */
export async function getTasks(): Promise<Task[]> {
  const client = getClient();
  try {
    const result = await client.execute(
      'SELECT * FROM tasks ORDER BY created_at DESC',
    );
    return result.rows as unknown as Task[];
  } finally {
    client.close();
  }
}

/** Inserts a new task row. description can be null if the user left it blank. */
export async function insertTask(
  title: string,
  description: string | null,
): Promise<void> {
  const client = getClient();
  try {
    await client.execute({
      sql: 'INSERT INTO tasks (title, description) VALUES (?, ?)',
      args: [title, description ?? null],
    });
  } finally {
    client.close();
  }
}

/**
 * Flips completed between 0 and 1.
 * Using a CASE expression in SQL avoids a separate SELECT before the UPDATE.
 */
export async function toggleTask(id: number): Promise<void> {
  const client = getClient();
  try {
    await client.execute({
      sql: 'UPDATE tasks SET completed = CASE WHEN completed = 0 THEN 1 ELSE 0 END WHERE id = ?',
      args: [id],
    });
  } finally {
    client.close();
  }
}

/** Permanently removes a task row. The UI optimistically hides it via revalidatePath. */
export async function deleteTask(id: number): Promise<void> {
  const client = getClient();
  try {
    await client.execute({
      sql: 'DELETE FROM tasks WHERE id = ?',
      args: [id],
    });
  } finally {
    client.close();
  }
}
