// TaskList component – server component
// Renders the list of tasks fetched from the database.
import type { Task } from '@/data/tasks';
import { TaskItem } from './TaskItem';
import styles from './TaskList.module.css';

/** Props for TaskList */
type TaskListProps = {
  tasks: Task[];
};

/**
 * TaskList renders the full list of tasks.
 * If no tasks exist it shows a friendly empty state.
 * Each task is rendered by the TaskItem client component.
 */
export function TaskList({ tasks }: TaskListProps) {
  // Empty state – shown when there are no tasks yet
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
        {/* Render each task as a TaskItem */}
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
    </section>
  );
}
