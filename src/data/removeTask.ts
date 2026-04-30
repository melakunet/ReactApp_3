'use server';

import { revalidatePath } from 'next/cache';
import { deleteTask } from './tasks';

/**
 * removeTask – Server Action triggered when the user clicks
 * the Delete button in TaskItem.
 *
 * After the row is deleted from the database, revalidatePath
 * invalidates the Next.js cache for the home page so the task
 * disappears from the list on the next render without a full
 * browser reload.
 */
export async function removeTask(id: number): Promise<void> {
  await deleteTask(id);
  revalidatePath('/');
}
