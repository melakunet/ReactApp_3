import type { Task } from '@/data/tasks';
import { TaskItem } from './TaskItem';
import styles from './TaskList.module.css';

type TaskListProps = {
  tasks: Task[];
};

/**
 * TaskList – renders the full collection of tasks.
 *
 * This is a Server Component: it receives the task array
 * as a prop (already fetched in page.tsx) and renders it
 * as static HTML. Each row is handed off to TaskItem,
 * which is a Client Component that handles user interactions.
 */
export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <section className={styles.container}>
        <h2>Your Tasks</h2>
        <p className={styles.empty}>
          No tasks yet – add one using the form above!
        </p>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <h2>Your Tasks ({tasks.length})</h2>
      <ul className={styles.list}>
        {tasks.map((task) => (
          // key must be unique per item so React can track additions/removals
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
    </section>
  );
}
