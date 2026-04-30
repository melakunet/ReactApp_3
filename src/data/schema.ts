import { z } from 'zod';

/**
 * taskSchema defines the validation rules for the Add Task form.
 *
 * It is used in two places:
 *   1. TaskForm (client) – passed to zodResolver so react-hook-form
 *      can validate fields instantly in the browser.
 *   2. addTask (server) – called again with safeParse before the data
 *      is written to the database, ensuring server-side safety.
 *
 * Keeping a single shared schema means both sides always enforce
 * the same rules.
 */
export const taskSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'You must enter a task title' })
    .max(200, { message: 'Title must be less than 200 characters' }),

  // description is optional – the user may leave it blank
  description: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
