'use server';

import { revalidatePath } from 'next/cache';
import { toggleTask } from './tasks';

// Server Action – flips a task's completed status, then refreshes the task list.
export async function markComplete(id: number): Promise<void> {
  await toggleTask(id);
  revalidatePath('/');
}
