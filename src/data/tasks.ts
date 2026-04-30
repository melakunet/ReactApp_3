'use server';

import { createClient, type Client } from '@libsql/client';
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), 'src/data/tasks.db');

function getClient(): Client {
  return createClient({ url: `file:${DB_PATH}` });
}

// completed is stored as INTEGER (0/1) – SQLite has no boolean type.
export type Task = {
  id: number;
  title: string;
  description: string | null;
  completed: number;
  created_at: string;
};

// Creates the tasks table on first run. Safe to call repeatedly – IF NOT EXISTS.
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

export async function getTasks(): Promise<Task[]> {
  const client = getClient();
  try {
    const result = await client.execute(
      'SELECT * FROM tasks ORDER BY created_at DESC',
    );
    // Map to plain objects so Next.js can safely pass them to Client Components.
    // libSQL rows carry internal methods that React's serialization rejects.
    return result.rows.map((row) => ({
      id: row.id as number,
      title: row.title as string,
      description: row.description as string | null,
      completed: row.completed as number,
      created_at: row.created_at as string,
    })) as Task[];
  } finally {
    client.close();
  }
}

export async function insertTask(title: string, description: string | null): Promise<void> {
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

// CASE expression flips 0→1 or 1→0 in a single UPDATE, no separate SELECT needed.
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

export async function deleteTask(id: number): Promise<void> {
  const client = getClient();
  try {
    await client.execute({ sql: 'DELETE FROM tasks WHERE id = ?', args: [id] });
  } finally {
    client.close();
  }
}
