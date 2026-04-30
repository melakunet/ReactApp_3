'use server';

import { revalidatePath } from 'next/cache';
import { deleteTask } from './tasks';

// Server Action – deletes a task from the database, then refreshes the task list.
export async function removeTask(id: number): Promise<void> {
  await deleteTask(id);
  revalidatePath('/');
}
