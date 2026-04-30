'use server';

import { revalidatePath } from 'next/cache';
import { taskSchema } from './schema';
import { insertTask } from './tasks';
import { z } from 'zod';

/** Field-level errors returned to the form when Zod validation fails. */
type FieldErrors = {
  title: { message: string } | null;
  description: { message: string } | null;
};

/**
 * The state object passed between useActionState and this action.
 * `ok` tells the form whether the last submission succeeded.
 * `formData` carries the submitted values back so the form can
 * re-populate fields after a server-side validation error.
 */
export type AddTaskState = {
  ok: boolean;
  error: string;
  errors: FieldErrors;
  formData: FormData;
};

/**
 * addTask – Server Action called by TaskForm on every submission.
 *
 * The same Zod schema used on the client is run here again on the
 * server. This "double validation" means even if someone bypasses
 * the browser form, invalid data is rejected before it reaches
 * the database.
 *
 * On success, revalidatePath('/') tells Next.js to rebuild the
 * cached home page so the new task appears without a manual reload.
 */
export async function addTask(
  previousState: AddTaskState,
  formData: FormData,
): Promise<AddTaskState> {
  const parsedResult = taskSchema.safeParse(Object.fromEntries(formData));

  if (!parsedResult.success) {
    // Send validation errors back to the form so each field can show
    // its own inline message.
    return {
      ok: false,
      error: 'Unable to save – please fix the errors below',
      errors: formatZodErrors(parsedResult.error),
      formData,
    };
  }

  const { title, description } = parsedResult.data;

  try {
    await insertTask(title, description ?? null);
  } catch {
    // Catch any unexpected database error and surface a generic message.
    // We don't expose raw DB errors to the client for security.
    return {
      ok: false,
      error: 'A server error occurred. Please try again.',
      errors: { title: null, description: null },
      formData,
    };
  }

  // Invalidate the cached home page so Next.js re-fetches and re-renders
  // the updated task list on the next request.
  revalidatePath('/');

  return {
    ok: true,
    error: '',
    errors: { title: null, description: null },
    formData: new FormData(),
  };
}

/**
 * Converts a ZodError (which can have many formats) into the flat
 * FieldErrors shape expected by the form.
 */
function formatZodErrors(error: z.ZodError): FieldErrors {
  const fieldErrors = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  return {
    title: fieldErrors['title'] ? { message: fieldErrors['title']![0] } : null,
    description: fieldErrors['description'] ? { message: fieldErrors['description']![0] } : null,
  };
}
