'use server';

import { revalidatePath } from 'next/cache';
import { toggleTask } from './tasks';

/**
 * markComplete – Server Action triggered when the user checks or
 * unchecks a task's checkbox in TaskItem.
 *
 * toggleTask flips the completed value (0 → 1 or 1 → 0) in one
 * SQL UPDATE, then revalidatePath forces Next.js to regenerate the
 * home page so the updated state is reflected immediately.
 */
export async function markComplete(id: number): Promise<void> {
  await toggleTask(id);
  revalidatePath('/');
}
