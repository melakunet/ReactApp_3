// Zod validation schema for task form fields
// Used for both client-side (react-hook-form) and server-side validation
import { z } from 'zod';

export const taskSchema = z.object({
  // Title is required, min 1 character, max 200 characters
  title: z
    .string()
    .min(1, { message: 'You must enter a task title' })
    .max(200, { message: 'Title must be less than 200 characters' }),

  // Description is optional
  description: z.string().optional(),
});

// TypeScript type inferred from the schema
export type TaskFormValues = z.infer<typeof taskSchema>;
