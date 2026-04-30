// TaskForm component – client component
// Handles adding a new task using react-hook-form + Zod + useActionState.
// Mirrors the instructor's ContactForm.tsx pattern exactly.
'use client';

import { useActionState, startTransition, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskFormValues } from '@/data/schema';
import { addTask, type AddTaskState } from '@/data/addTask';
import styles from './TaskForm.module.css';

/** Initial state passed to useActionState */
const initialState: AddTaskState = {
  ok: false,
  error: '',
  errors: { title: null, description: null },
  formData: new FormData(),
};

/**
 * TaskForm – renders the "Add a Task" form.
 * Uses useActionState (React 19) + react-hook-form for dual client/server validation.
 */
export function TaskForm() {
  // useActionState wires the server action to React's transition system
  const [{ ok, error, errors, formData }, formAction, isPending] =
    useActionState(addTask, initialState);

  // react-hook-form provides client-side validation via Zod resolver
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors: clientErrors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: (formData.get('title') as string) ?? '',
      description: (formData.get('description') as string) ?? '',
    },
  });

  // Ref to the <form> element so we can pass its FormData to the server action
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * onSubmit – called by react-hook-form after client validation passes.
   * Builds FormData from validated values and dispatches the server action.
   */
  function onSubmit(values: TaskFormValues) {
    // Build FormData manually from validated values — avoids ref access during render
    const fd = new FormData();
    fd.append('title', values.title);
    if (values.description) fd.append('description', values.description);
    startTransition(() => {
      formAction(fd);
    });
    // Clear the form fields after dispatching
    reset();
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={styles.form}
    >
      <h2 className={styles.heading}>Add a New Task</h2>

      {/* Title field */}
      <div className={styles.field}>
        <label htmlFor="title">Task title</label>
        <input
          type="text"
          id="title"
          placeholder="e.g. Buy groceries"
          defaultValue={(formData.get('title') as string) ?? ''}
          aria-invalid={
            clientErrors.title ?? errors.title ? 'true' : 'false'
          }
          aria-describedby="title-error"
          aria-required="true"
          {...register('title')}
        />
        {/* Show client-side error first, fall back to server error */}
        <FieldError
          clientError={clientErrors.title}
          serverError={errors.title}
          errorId="title-error"
        />
      </div>

      {/* Description field (optional) */}
      <div className={styles.field}>
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          placeholder="Add more details..."
          defaultValue={(formData.get('description') as string) ?? ''}
          {...register('description')}
        />
      </div>

      {/* Server-level error (e.g. DB failure) */}
      {!ok && error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      {/* Success feedback */}
      {ok && (
        <p role="status" className={styles.success}>
          Task added successfully!
        </p>
      )}

      {/* Pending indicator while the server action runs */}
      {isPending && <p role="status">Saving…</p>}

      <button type="submit" disabled={isPending} className={styles.button}>
        {isPending ? 'Adding…' : 'Add Task'}
      </button>
    </form>
  );
}

// ── FieldError helper ─────────────────────────────────────────────────────────

/** Type for a single Zod / RHF field error */
type Err = { message?: string } | undefined | null;

/**
 * Renders an accessible error message for a single field.
 * Prefers the client-side error; falls back to the server-side error.
 */
function FieldError({
  clientError,
  serverError,
  errorId,
}: {
  clientError: Err;
  serverError: Err;
  errorId: string;
}) {
  const fieldError = clientError ?? serverError;
  if (!fieldError) return null;

  return (
    <div id={errorId} role="alert" className="field-error">
      {fieldError.message}
    </div>
  );
}
