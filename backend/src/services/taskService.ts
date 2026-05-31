import prisma from '../lib/prisma';
import type { Task } from '@prisma/client';

interface UpdateTaskInput {
  done?: boolean;
  title?: string;
  notes?: string;
  dueDate?: string | null;
}

export async function getTask(id: number): Promise<Task | null> {
  return prisma.task.findUnique({ where: { id } });
}

export async function updateTask(id: number, data: UpdateTaskInput): Promise<Task> {
  return prisma.task.update({
    where: { id },
    data: {
      ...(data.done !== undefined && { done: Boolean(data.done) }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
    },
  });
}
