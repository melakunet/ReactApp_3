// Server Action: addTask
// Validates the submitted form data using Zod, then inserts a new task into the DB.
// Follows the same pattern as the instructor's insertContact.ts.
'use server';

import { revalidatePath } from 'next/cache';
import { taskSchema } from './schema';
import { insertTask } from './tasks';
import { z } from 'zod';

/** Shape of field-level validation errors returned to the form */
type FieldErrors = {
  title: { message: string } | null;
  description: { message: string } | null;
};

/** State shape used by useActionState in TaskForm */
export type AddTaskState = {
  ok: boolean;
  error: string;
  errors: FieldErrors;
  formData: FormData;
};

/**
 * Server Action called by TaskForm via useActionState.
 * Validates with Zod, inserts into SQLite, and revalidates the page cache.
 */
export async function addTask(
  previousState: AddTaskState,
  formData: FormData,
): Promise<AddTaskState> {
  // Parse and validate form fields with Zod schema
  const parsedResult = taskSchema.safeParse(
    Object.fromEntries(formData),
  );

  // Return validation errors to the client if parsing fails
  if (!parsedResult.success) {
    return {
      ok: false,
      error: 'Unable to save – please fix the errors below',
      errors: formatZodErrors(parsedResult.error),
      formData,
    };
  }

  const { title, description } = parsedResult.data;

  try {
    // Insert the validated task into the database
    await insertTask(title, description ?? null);
  } catch {
    // Return a generic server error if the DB write fails
    return {
      ok: false,
      error: 'A server error occurred. Please try again.',
      errors: { title: null, description: null },
      formData,
    };
  }

  // Revalidate the home page so the task list refreshes
  revalidatePath('/');

  return {
    ok: true,
    error: '',
    errors: { title: null, description: null },
    formData: new FormData(),
  };
}

/** Helper: map a ZodError into the FieldErrors shape */
function formatZodErrors(error: z.ZodError): FieldErrors {
  const fieldErrors = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  return {
    title: fieldErrors['title']
      ? { message: fieldErrors['title']![0] }
      : null,
    description: fieldErrors['description']
      ? { message: fieldErrors['description']![0] }
      : null,
  };
}
