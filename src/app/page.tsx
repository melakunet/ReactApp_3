import { initDb, getTasks } from '@/data/tasks';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import styles from './page.module.css';

// Server Component – data is fetched here before the page is sent to the browser.
export default async function Home() {
  await initDb(); // create the table on first run if needed
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
