'use client';

import { useActionState, startTransition, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskFormValues } from '@/data/schema';
import { addTask, type AddTaskState } from '@/data/addTask';
import styles from './TaskForm.module.css';

// The initial value useActionState needs before the first submission.
const initialState: AddTaskState = {
  ok: false,
  error: '',
  errors: { title: null, description: null },
  formData: new FormData(),
};

/**
 * TaskForm – the "Add a New Task" form.
 *
 * Validation runs twice:
 *   1. Client side – react-hook-form + Zod catches errors instantly
 *      without a network round-trip.
 *   2. Server side – the addTask Server Action re-validates with the
 *      same Zod schema, so bad data can never reach the database.
 *
 * useActionState (React 19) connects the Server Action to the
 * component's state and gives us `isPending` for free, so we can
 * disable the submit button while the request is in flight.
 */
export function TaskForm() {
  const [{ ok, error, errors, formData }, formAction, isPending] =
    useActionState(addTask, initialState);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors: clientErrors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    // Re-populate fields with the last submitted values if the server
    // returns a validation error, so the user doesn't lose their input.
    defaultValues: {
      title: (formData.get('title') as string) ?? '',
      description: (formData.get('description') as string) ?? '',
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  /**
   * Called by react-hook-form only after client-side Zod validation passes.
   * We build FormData manually here instead of reading formRef.current
   * inside the JSX, because reading a ref during render is not allowed
   * in React 19's strict mode.
   * startTransition marks the Server Action dispatch as a non-urgent
   * update so the UI stays responsive while the request is in flight.
   */
  function onSubmit(values: TaskFormValues) {
    const fd = new FormData();
    fd.append('title', values.title);
    if (values.description) fd.append('description', values.description);
    startTransition(() => {
      formAction(fd);
    });
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

      <div className={styles.field}>
        <label htmlFor="title">Task title</label>
        <input
          type="text"
          id="title"
          placeholder="e.g. Buy groceries"
          defaultValue={(formData.get('title') as string) ?? ''}
          // aria-invalid lets screen readers announce the field as invalid
          aria-invalid={clientErrors.title ?? errors.title ? 'true' : 'false'}
          aria-describedby="title-error"
          aria-required="true"
          {...register('title')}
        />
        {/* Prefer the client error (instant) over the server error (after round-trip) */}
        <FieldError
          clientError={clientErrors.title}
          serverError={errors.title}
          errorId="title-error"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          placeholder="Add more details..."
          defaultValue={(formData.get('description') as string) ?? ''}
          {...register('description')}
        />
      </div>

      {/* Only shown when the Server Action itself fails (e.g. database error) */}
      {!ok && error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      {ok && (
        <p role="status" className={styles.success}>
          Task added successfully!
        </p>
      )}

      {isPending && <p role="status">Saving…</p>}

      <button type="submit" disabled={isPending} className={styles.button}>
        {isPending ? 'Adding…' : 'Add Task'}
      </button>
    </form>
  );
}

// ── FieldError ────────────────────────────────────────────────────────────────

type Err = { message?: string } | undefined | null;

/**
 * Renders an accessible inline error for one form field.
 * The client error (from react-hook-form) is shown first because it's
 * available immediately. The server error is only used as a fallback
 * when the server action catches something the client didn't.
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
