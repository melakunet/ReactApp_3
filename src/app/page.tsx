// Home page – server component
// Fetches all tasks from the database and renders the TaskForm + TaskList.
import { initDb, getTasks } from '@/data/tasks';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import styles from './page.module.css';

/**
 * Home is a Next.js Server Component.
 * It initialises the DB on first load, fetches all tasks,
 * then passes them to the TaskList for rendering.
 */
export default async function Home() {
  // Ensure the tasks table exists before querying
  await initDb();

  // Fetch all tasks from the SQLite database (server-side)
  const tasks = await getTasks();

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>📝 Task Logger</h1>
      <p className={styles.subtitle}>
        Keep track of your tasks – add, complete, and delete them below.
      </p>

      {/* Form to add a new task */}
      <TaskForm />

      {/* List of existing tasks */}
      <TaskList tasks={tasks} />
    </main>
  );
}
