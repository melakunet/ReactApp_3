// Server Action: removeTask
// Deletes a task from the database by its id.
'use server';

import { revalidatePath } from 'next/cache';
import { deleteTask } from './tasks';

/**
 * Called from TaskItem when the user clicks the Delete button.
 * @param id - The numeric id of the task to delete.
 */
export async function removeTask(id: number): Promise<void> {
  await deleteTask(id);
  // Revalidate the home page so the task is removed from the list
  revalidatePath('/');
}
