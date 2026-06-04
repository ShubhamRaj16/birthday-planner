import http from './http';
import type { ApiResponse, Task } from '../types';

// ─── Tasks repository ─────────────────────────────────────────────────────────

/** Toggle a task's done state. */
export async function setTaskDone(taskId: number, done: boolean): Promise<Task> {
  const res = await http.put<ApiResponse<Task>>(`/tasks/${taskId}`, { done });
  return res.data.data;
}

/** Delete a task from an event. */
export async function deleteTask(eventId: number, taskId: number): Promise<void> {
  await http.delete(`/events/${eventId}/tasks/${taskId}`);
}

/** Add a task to an event's checklist. */
export async function createTask(
  eventId: number,
  data: { title: string; category: string; dueDate?: string }
): Promise<Task> {
  const res = await http.post<ApiResponse<Task>>(`/events/${eventId}/tasks`, data);
  return res.data.data;
}

/** Replace an event's tasks with the default checklist. */
export async function resetDefaults(eventId: number): Promise<void> {
  await http.post(`/events/${eventId}/tasks/reset-defaults`);
}

export const tasksApi = { setTaskDone, deleteTask, createTask, resetDefaults };
