import { z } from 'zod';

// Shared validation schema – used by react-hook-form on the client
// and by the addTask Server Action on the server.
export const taskSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'You must enter a task title' })
    .max(200, { message: 'Title must be less than 200 characters' }),
  description: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
