'use client';

import { startTransition } from 'react';
import { markComplete } from '@/data/markComplete';
import { removeTask } from '@/data/removeTask';
import type { Task } from '@/data/tasks';
import styles from './TaskItem.module.css';

type TaskItemProps = {
  task: Task;
};

/**
 * TaskItem – one row in the task list.
 *
 * This is a Client Component because it responds to user
 * interactions (checkbox change, delete click). The actual
 * data mutations happen in Server Actions (markComplete,
 * removeTask), which run on the server and then trigger a
 * Next.js cache revalidation so the list refreshes without
 * a full page reload.
 *
 * startTransition wraps each Server Action call so React
 * can keep the UI interactive while the request is pending.
 */
export function TaskItem({ task }: TaskItemProps) {
  function handleToggle() {
    startTransition(() => {
      markComplete(task.id);
    });
  }

  function handleDelete() {
    startTransition(() => {
      removeTask(task.id);
    });
  }

  return (
    <li className={`${styles.item} ${task.completed ? styles.completed : ''}`}>
      {/*
        Checkbox is tied to the task id so its <label> below
        can use htmlFor to stay accessible.
      */}
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
        {/* description is optional – only render if it was provided */}
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
