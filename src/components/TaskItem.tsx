'use client';

import { startTransition } from 'react';
import { markComplete } from '@/data/markComplete';
import { removeTask } from '@/data/removeTask';
import type { Task } from '@/data/tasks';
import styles from './TaskItem.module.css';

type TaskItemProps = {
  task: Task;
};

// Client Component – handles checkbox and delete button interactions.
export function TaskItem({ task }: TaskItemProps) {
  function handleToggle() {
    startTransition(() => { markComplete(task.id); });
  }

  function handleDelete() {
    startTransition(() => { removeTask(task.id); });
  }

  return (
    <li className={`${styles.item} ${task.completed ? styles.completed : ''}`}>
      <input
        type="checkbox"
        id={`task-${task.id}`}
        checked={task.completed === 1}
        onChange={handleToggle}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
      />

      <div className={styles.details}>
        <label htmlFor={`task-${task.id}`} className={styles.title}>
          {task.title}
        </label>
        {/* description is optional */}
        {task.description && (
          <p className={styles.description}>{task.description}</p>
        )}
        <span className={styles.date}>
          Added: {new Date(task.created_at).toLocaleDateString()}
        </span>
      </div>

      <button
        type="button"
        onClick={handleDelete}
        className={styles.deleteBtn}
        aria-label={`Delete task: ${task.title}`}
      >
        Delete
      </button>
    </li>
  );
}
