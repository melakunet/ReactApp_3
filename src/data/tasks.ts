// Task database operations using libSQL (SQLite)
// All functions run server-side only ('use server')
'use server';

import { createClient, type Client } from '@libsql/client';
import path from 'path';

// Resolve the path to the local SQLite database file
const DB_PATH = path.resolve(process.cwd(), 'src/data/tasks.db');

/** Create and return a libSQL client connected to the local SQLite file */
function getClient(): Client {
  return createClient({ url: `file:${DB_PATH}` });
}

/** Represents a single task row in the database */
export type Task = {
  id: number;
  title: string;
  description: string | null;
  completed: number; // 0 = false, 1 = true (SQLite booleans)
  created_at: string;
};

/**
 * Initialise the tasks table if it does not already exist.
 * Called once at startup (from the GET route).
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

/** Fetch all tasks ordered by newest first */
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

/** Insert a new task and return the inserted row */
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

/** Toggle the completed status of a task (0 → 1, 1 → 0) */
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

/** Delete a task by its id */
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
