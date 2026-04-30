'use client';

import { useActionState, startTransition, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskFormValues } from '@/data/schema';
import { addTask, type AddTaskState } from '@/data/addTask';
import styles from './TaskForm.module.css';

const initialState: AddTaskState = {
  ok: false,
  error: '',
  errors: { title: null, description: null },
  formData: new FormData(),
};

// Add Task form – validates on the client with react-hook-form + Zod,
// then sends data to the addTask Server Action for a second server-side check.
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
    // Re-populate fields from the last submission if the server returns an error.
    defaultValues: {
      title: (formData.get('title') as string) ?? '',
      description: (formData.get('description') as string) ?? '',
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  // Build FormData from validated values and dispatch the Server Action.
  // startTransition keeps the UI responsive while the request is in flight.
  function onSubmit(values: TaskFormValues) {
    const fd = new FormData();
    fd.append('title', values.title);
    if (values.description) fd.append('description', values.description);
    startTransition(() => { formAction(fd); });
    reset();
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
      <h2 className={styles.heading}>Add a New Task</h2>

      <div className={styles.field}>
        <label htmlFor="title">Task title</label>
        <input
          type="text"
          id="title"
          placeholder="e.g. Buy groceries"
          defaultValue={(formData.get('title') as string) ?? ''}
          aria-invalid={clientErrors.title ?? errors.title ? 'true' : 'false'}
          aria-describedby="title-error"
          aria-required="true"
          {...register('title')}
        />
        <FieldError clientError={clientErrors.title} serverError={errors.title} errorId="title-error" />
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

      {/* Server-level error shown only when the database write itself fails */}
      {!ok && error && <p role="alert" className={styles.error}>{error}</p>}
      {ok && <p role="status" className={styles.success}>Task added successfully!</p>}
      {isPending && <p role="status">Saving…</p>}

      <button type="submit" disabled={isPending} className={styles.button}>
        {isPending ? 'Adding…' : 'Add Task'}
      </button>
    </form>
  );
}

type Err = { message?: string } | undefined | null;

// Shows the client error (instant) first; falls back to the server error if needed.
function FieldError({ clientError, serverError, errorId }: {
  clientError: Err;
  serverError: Err;
  errorId: string;
}) {
  const fieldError = clientError ?? serverError;
  if (!fieldError) return null;
  return <div id={errorId} role="alert" className="field-error">{fieldError.message}</div>;
}
