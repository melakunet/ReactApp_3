// TaskItem component – client component
// Displays a single task with a complete toggle and a delete button.
'use client';

import { startTransition } from 'react';
import { markComplete } from '@/data/markComplete';
import { removeTask } from '@/data/removeTask';
import type { Task } from '@/data/tasks';
import styles from './TaskItem.module.css';

/** Props for TaskItem */
type TaskItemProps = {
  task: Task;
};

/**
 * TaskItem renders one row in the task list.
 * - Checkbox: marks the task complete/incomplete (calls markComplete server action)
 * - Delete button: removes the task (calls removeTask server action)
 */
export function TaskItem({ task }: TaskItemProps) {
  /**
   * Handle the complete checkbox change.
   * Wraps the server action in startTransition for smooth UI updates.
   */
  function handleToggle() {
    startTransition(() => {
      markComplete(task.id);
    });
  }

  /**
   * Handle the delete button click.
   * Wraps the server action in startTransition.
   */
  function handleDelete() {
    startTransition(() => {
      removeTask(task.id);
    });
  }

  return (
    <li className={`${styles.item} ${task.completed ? styles.completed : ''}`}>
      {/* Complete toggle */}
      <input
        type="checkbox"
        id={`task-${task.id}`}
        checked={task.completed === 1}
        onChange={handleToggle}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
      />

      {/* Task details */}
      <div className={styles.details}>
        <label htmlFor={`task-${task.id}`} className={styles.title}>
          {task.title}
        </label>
        {task.description && (
          <p className={styles.description}>{task.description}</p>
        )}
        <span className={styles.date}>
          Added: {new Date(task.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Delete button */}
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
