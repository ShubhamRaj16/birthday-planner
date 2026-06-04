import { useState } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { tasksApi } from '../api/tasks.api';
import { getApiError } from '../lib/apiError';
import type { Task } from '../types';
import { Button, ProgressBar } from './ui';
import { colors, spacing } from '../design/tokens';
import TaskRow from './TaskChecklist/TaskRow';
import TaskForm from './TaskChecklist/TaskForm';

export type TaskChecklistTask = Pick<Task, 'id' | 'title' | 'done' | 'dueDate' | 'category'> &
  Partial<Omit<Task, 'id' | 'title' | 'done' | 'dueDate' | 'category'>>;

interface Props {
  eventId: number;
  tasks?: TaskChecklistTask[];
  onRefresh?: () => void;
}

const ProgressSection = styled.div`
  margin-bottom: 1.25rem;
`;
const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
`;
const ProgressLabel = styled.span`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${colors.textMuted};
`;
const ActionsRow = styled.div`
  display: flex;
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
  flex-wrap: wrap;
`;
const Msg = styled.p<{ $error?: boolean }>`
  color: ${({ $error }) => ($error ? colors.error : colors.success)};
  font-size: 0.82rem;
  margin-top: 0.4rem;
`;
const EmptyMsg = styled.p`
  color: ${colors.textDisabled};
  font-size: 0.875rem;
  padding: ${spacing.md} 0;
`;
const TaskList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
`;

export default function TaskChecklist({ eventId, tasks = [], onRefresh }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [opError, setOpError] = useState('');

  const sorted = [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return dayjs(a.dueDate).isBefore(dayjs(b.dueDate)) ? -1 : 1;
  });

  const doneCount = tasks.filter((t) => t.done).length;
  const pct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  function showOpError(msg: string) {
    setOpError(msg);
    setTimeout(() => setOpError(''), 5000);
  }

  async function handleToggle(task: TaskChecklistTask) {
    try {
      await tasksApi.setTaskDone(task.id, !task.done);
      onRefresh?.();
    } catch (err) {
      showOpError(getApiError(err) || 'Failed to update task.');
    }
  }

  async function handleDelete(taskId: number) {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksApi.deleteTask(eventId, taskId);
      onRefresh?.();
    } catch (err) {
      showOpError(getApiError(err) || 'Failed to delete task.');
    }
  }

  async function handleAddTask(data: { title: string; category: string; dueDate?: string }) {
    await tasksApi.createTask(eventId, data);
    setAddOpen(false);
    onRefresh?.();
  }

  async function handleResetDefaults() {
    if (!window.confirm('Reset tasks to default checklist? This will replace existing tasks.'))
      return;
    setResetting(true);
    try {
      await tasksApi.resetDefaults(eventId);
      onRefresh?.();
    } catch (err) {
      console.error('Reset defaults failed:', getApiError(err));
    } finally {
      setResetting(false);
    }
  }

  return (
    <div style={{ padding: '0.25rem 0' }}>
      {opError && (
        <Msg $error role="alert">
          {opError}
        </Msg>
      )}
      <ProgressSection>
        <ProgressHeader>
          <ProgressLabel>
            {doneCount}/{tasks.length} tasks completed
          </ProgressLabel>
          <ProgressLabel>{pct}%</ProgressLabel>
        </ProgressHeader>
        <ProgressBar value={doneCount} max={tasks.length} />
      </ProgressSection>
      <ActionsRow>
        <Button
          size="sm"
          variant={addOpen ? 'secondary' : 'primary'}
          onClick={() => setAddOpen((v) => !v)}
        >
          {addOpen ? 'Cancel' : '+ Add Task'}
        </Button>
        <Button size="sm" variant="secondary" onClick={handleResetDefaults} disabled={resetting}>
          {resetting ? 'Resetting...' : 'Reset to Defaults'}
        </Button>
      </ActionsRow>
      {addOpen && (
        <TaskForm
          onSubmit={handleAddTask}
          onCancel={() => setAddOpen(false)}
        />
      )}
      {sorted.length === 0 ? (
        <EmptyMsg>No tasks yet. Add tasks above or reset to defaults.</EmptyMsg>
      ) : (
        <TaskList>
          {sorted.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </TaskList>
      )}
    </div>
  );
}
