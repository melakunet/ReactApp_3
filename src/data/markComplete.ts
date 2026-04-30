// Server Action: markComplete
// Toggles the completed status of a task identified by its id.
'use server';

import { revalidatePath } from 'next/cache';
import { toggleTask } from './tasks';

/**
 * Called from TaskItem when the user clicks the complete checkbox.
 * @param id - The numeric id of the task to toggle.
 */
export async function markComplete(id: number): Promise<void> {
  await toggleTask(id);
  // Revalidate the home page so the updated list is re-rendered
  revalidatePath('/');
}
