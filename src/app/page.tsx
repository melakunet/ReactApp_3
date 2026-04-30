import { initDb, getTasks } from '@/data/tasks';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import styles from './page.module.css';

/**
 * Home page – runs entirely on the server.
 *
 * Because this is a Next.js Server Component, the database
 * call happens before any HTML is sent to the browser.
 * The resulting task array is passed straight to TaskList
 * as a prop, so no client-side fetch is needed for the
 * initial page load.
 */
export default async function Home() {
  // Create the tasks table on first run if it doesn't exist yet.
  // Safe to call on every request – uses CREATE TABLE IF NOT EXISTS.
  await initDb();

  const tasks = await getTasks();

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>📝 Task Logger</h1>
      <p className={styles.subtitle}>
        Keep track of your tasks – add, complete, and delete them below.
      </p>
      <TaskForm />
      <TaskList tasks={tasks} />
    </main>
  );
}
