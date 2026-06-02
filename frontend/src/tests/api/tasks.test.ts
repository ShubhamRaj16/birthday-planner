import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import http from '../../api/http';
import { tasksApi } from '../../api/tasks.api';
import { ok } from '../../test/mockHttp';

const mockHttp = vi.mocked(http);
beforeEach(() => vi.clearAllMocks());

describe('tasksApi', () => {
  it('setTaskDone puts done flag and returns task', async () => {
    mockHttp.put.mockResolvedValue(ok({ id: 1, done: true }));
    const result = await tasksApi.setTaskDone(1, true);
    expect(result).toEqual({ id: 1, done: true });
    expect(mockHttp.put).toHaveBeenCalledWith('/tasks/1', { done: true });
  });

  it('deleteTask deletes the nested route', async () => {
    mockHttp.delete.mockResolvedValue(ok({ deleted: true }));
    await tasksApi.deleteTask(10, 1);
    expect(mockHttp.delete).toHaveBeenCalledWith('/events/10/tasks/1');
  });

  it('createTask posts payload and returns task', async () => {
    mockHttp.post.mockResolvedValue(ok({ id: 2, title: 'Cake' }));
    const result = await tasksApi.createTask(10, { title: 'Cake', category: 'cake' });
    expect(result).toEqual({ id: 2, title: 'Cake' });
    expect(mockHttp.post).toHaveBeenCalledWith('/events/10/tasks', { title: 'Cake', category: 'cake' });
  });

  it('resetDefaults posts to reset-defaults', async () => {
    mockHttp.post.mockResolvedValue(ok({ count: 9 }));
    await tasksApi.resetDefaults(10);
    expect(mockHttp.post).toHaveBeenCalledWith('/events/10/tasks/reset-defaults');
  });
});
