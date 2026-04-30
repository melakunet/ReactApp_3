'use server';

import { revalidatePath } from 'next/cache';
import { taskSchema } from './schema';
import { insertTask } from './tasks';
import { z } from 'zod';

type FieldErrors = {
  title: { message: string } | null;
  description: { message: string } | null;
};

// State shared between useActionState and this action.
// formData carries submitted values back so the form can repopulate on error.
export type AddTaskState = {
  ok: boolean;
  error: string;
  errors: FieldErrors;
  formData: FormData;
};

// Server Action – validates with Zod then writes to the database.
// revalidatePath triggers a re-render of the task list after a successful insert.
export async function addTask(
  previousState: AddTaskState,
  formData: FormData,
): Promise<AddTaskState> {
  const parsedResult = taskSchema.safeParse(Object.fromEntries(formData));

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
    await insertTask(title, description ?? null);
  } catch {
    // Don't expose raw database errors to the client.
    return {
      ok: false,
      error: 'A server error occurred. Please try again.',
      errors: { title: null, description: null },
      formData,
    };
  }

  revalidatePath('/');

  return {
    ok: true,
    error: '',
    errors: { title: null, description: null },
    formData: new FormData(),
  };
}

function formatZodErrors(error: z.ZodError): FieldErrors {
  const fieldErrors = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  return {
    title: fieldErrors['title'] ? { message: fieldErrors['title']![0] } : null,
    description: fieldErrors['description'] ? { message: fieldErrors['description']![0] } : null,
  };
}
