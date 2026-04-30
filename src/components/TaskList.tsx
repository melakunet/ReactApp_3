import type { Task } from '@/data/tasks';
import { TaskItem } from './TaskItem';
import styles from './TaskList.module.css';

type TaskListProps = {
  tasks: Task[];
};

// Server Component – receives tasks fetched in page.tsx and renders the list.
export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <section className={styles.container}>
        <h2>Your Tasks</h2>
        <p className={styles.empty}>No tasks yet – add one using the form above!</p>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <h2>Your Tasks ({tasks.length})</h2>
      <ul className={styles.list}>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
    </section>
  );
}
