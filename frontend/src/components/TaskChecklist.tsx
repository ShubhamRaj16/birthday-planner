import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';
import apiClient from '../lib/apiClient';
import { getApiError } from '../lib/apiError';
import type { Task } from '../types';

export type TaskChecklistTask = Pick<Task, 'id' | 'title' | 'done' | 'dueDate' | 'category'> &
  Partial<Omit<Task, 'id' | 'title' | 'done' | 'dueDate' | 'category'>>;

interface TaskChecklistProps {
  eventId: number;
  tasks?: TaskChecklistTask[];
  onRefresh?: () => void;
}

// ─── Styled components ────────────────────────────────────────────────────────

const Wrapper = styled.div`
  padding: 0.25rem 0;
`;

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
  color: #374151;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  background: #7c3aed;
  border-radius: 999px;
  width: ${({ $pct }) => $pct}%;
  transition: width 0.3s ease;
`;

const TaskList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
`;

const TaskItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.25rem;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const TaskCheckbox = styled.input`
  accent-color: #7c3aed;
  width: 16px;
  height: 16px;
  cursor: pointer;
  flex-shrink: 0;
`;

const TaskInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TaskTitle = styled.span<{ $done: boolean; $overdue: boolean | '' | null }>`
  font-size: 0.875rem;
  color: ${({ $done, $overdue }) => $done ? '#9ca3af' : $overdue ? '#dc2626' : '#111827'};
  text-decoration: ${({ $done }) => $done ? 'line-through' : 'none'};
  font-weight: ${({ $overdue, $done }) => ($overdue && !$done) ? '600' : '400'};
`;

const TaskMeta = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 2px;
  flex-wrap: wrap;
`;

const CategoryChip = styled.span`
  background: #ede9fe;
  color: #5b21b6;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 999px;
  text-transform: capitalize;
`;

const DueDateLabel = styled.span<{ $overdue: boolean | '' | null }>`
  font-size: 0.72rem;
  color: ${({ $overdue }) => $overdue ? '#dc2626' : '#9ca3af'};
  font-weight: ${({ $overdue }) => $overdue ? '600' : '400'};
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;

  &:hover { background: #fee2e2; }
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const PrimaryBtn = styled.button`
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.45rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  &:hover { background: #6d28d9; }
  &:disabled { background: #c4b5fd; cursor: not-allowed; }
`;

const SecondaryBtn = styled.button`
  background: #fff;
  color: #7c3aed;
  border: 1.5px solid #7c3aed;
  border-radius: 8px;
  padding: 0.45rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  &:hover { background: #f3f0ff; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const FormSection = styled.div`
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
`;

const FormTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #5b21b6;
  margin-bottom: 0.75rem;
`;

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: flex-end;
  margin-bottom: 0.5rem;
`;

const FormInput = styled.input`
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font-size: 0.875rem;
  color: #111827;
  flex: 1 1 180px;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 2px #ede9fe;
  }
`;

const FormSelect = styled.select`
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font-size: 0.875rem;
  color: #111827;
  flex: 1 1 140px;
  min-width: 110px;
  background: #fff;

  &:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 2px #ede9fe;
  }
`;

const ErrorMsg = styled.p`
  color: #b91c1c;
  font-size: 0.82rem;
  margin-top: 0.4rem;
`;

const EmptyMsg = styled.p`
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 0.75rem 0;
`;

// ─── Task categories (common) ────────────────────────────────────────────────

const TASK_CATEGORIES = [
  'venue', 'catering', 'decorations', 'invitations', 'entertainment',
  'photography', 'gifts', 'logistics', 'miscellaneous',
];

const TODAY = dayjs().startOf('day');

// ─── Component ────────────────────────────────────────────────────────────────

export default function TaskChecklist({ eventId, tasks = [], onRefresh }: TaskChecklistProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'miscellaneous', dueDate: '' });
  const [formError, setFormError] = useState('');
  const [adding, setAdding] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [opError, setOpError] = useState('');

  // Sort tasks by dueDate ascending (null/undefined tasks go last)
  const sorted = [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return dayjs(a.dueDate).isBefore(dayjs(b.dueDate)) ? -1 : 1;
  });

  const doneCount = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  function isOverdue(task: TaskChecklistTask) {
    return !task.done && task.dueDate && dayjs(task.dueDate).isBefore(TODAY);
  }

  // SCRUM-41: surface operation errors to the user (auto-clears after 5s)
  function showOpError(msg: string) {
    setOpError(msg);
    setTimeout(() => setOpError(''), 5000);
  }

  async function handleToggle(task: TaskChecklistTask) {
    try {
      await apiClient.put(`/tasks/${task.id}`, { done: !task.done });
      onRefresh && onRefresh();
    } catch (err) {
      showOpError(getApiError(err) || 'Failed to update task.');
    }
  }

  async function handleDelete(taskId: number) {
    if (!window.confirm('Delete this task?')) return;
    try {
      await apiClient.delete(`/events/${eventId}/tasks/${taskId}`);
      onRefresh && onRefresh();
    } catch (err) {
      showOpError(getApiError(err) || 'Failed to delete task.');
    }
  }

  async function handleAddTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    setFormError('');
    setAdding(true);
    try {
      await apiClient.post(`/events/${eventId}/tasks`, {
        title: form.title.trim(),
        category: form.category,
        dueDate: form.dueDate || undefined,
      });
      setForm({ title: '', category: 'miscellaneous', dueDate: '' });
      setAddOpen(false);
      onRefresh && onRefresh();
    } catch (err) {
      setFormError(getApiError(err) || 'Failed to add task.');
    } finally {
      setAdding(false);
    }
  }

  async function handleResetDefaults() {
    if (!window.confirm('Reset tasks to default checklist? This will replace existing tasks.')) return;
    setResetting(true);
    try {
      await apiClient.post(`/events/${eventId}/tasks/reset-defaults`);
      onRefresh && onRefresh();
    } catch (err) {
      console.error('Reset defaults failed:', getApiError(err));
    } finally {
      setResetting(false);
    }
  }

  return (
    <Wrapper>
      {opError && <ErrorMsg role="alert">{opError}</ErrorMsg>}
      {/* Progress bar */}
      <ProgressSection>
        <ProgressHeader>
          <ProgressLabel>{doneCount}/{total} tasks completed</ProgressLabel>
          <ProgressLabel>{pct}%</ProgressLabel>
        </ProgressHeader>
        <ProgressBar>
          <ProgressFill $pct={pct} />
        </ProgressBar>
      </ProgressSection>

      {/* Actions */}
      <ActionsRow>
        <PrimaryBtn onClick={() => setAddOpen((v) => !v)}>
          {addOpen ? 'Cancel' : '+ Add Task'}
        </PrimaryBtn>
        <SecondaryBtn onClick={handleResetDefaults} disabled={resetting}>
          {resetting ? 'Resetting...' : 'Reset to Defaults'}
        </SecondaryBtn>
      </ActionsRow>

      {/* Add task form */}
      {addOpen && (
        <FormSection>
          <FormTitle>New Task</FormTitle>
          <form onSubmit={handleAddTask}>
            <FormRow>
              <FormInput
                placeholder="Task title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <FormSelect
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {TASK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </FormSelect>
              <FormInput
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                style={{ flex: '0 1 150px', minWidth: '130px' }}
              />
              <PrimaryBtn type="submit" disabled={adding}>
                {adding ? 'Adding...' : 'Add'}
              </PrimaryBtn>
            </FormRow>
            {formError && <ErrorMsg>{formError}</ErrorMsg>}
          </form>
        </FormSection>
      )}

      {/* Task list */}
      {sorted.length === 0 ? (
        <EmptyMsg>No tasks yet. Add tasks above or reset to defaults.</EmptyMsg>
      ) : (
        <TaskList>
          {sorted.map((task) => {
            const overdue = isOverdue(task);
            return (
              <TaskItem key={task.id}>
                <TaskCheckbox
                  type="checkbox"
                  id={`task-${task.id}`}
                  checked={!!task.done}
                  onChange={() => handleToggle(task)}
                />
                <TaskInfo>
                  <label htmlFor={`task-${task.id}`} style={{ cursor: 'pointer', display: 'block' }}>
                    <TaskTitle $done={task.done} $overdue={overdue}>
                      {task.title}
                      {overdue && ' — OVERDUE'}
                    </TaskTitle>
                  </label>
                  <TaskMeta>
                    {task.category && <CategoryChip>{task.category}</CategoryChip>}
                    {task.dueDate && (
                      <DueDateLabel $overdue={overdue}>
                        Due {dayjs(task.dueDate).format('MMM D')}
                      </DueDateLabel>
                    )}
                  </TaskMeta>
                </TaskInfo>
                <DeleteBtn onClick={() => handleDelete(task.id)} title="Delete task">
                  &#10005;
                </DeleteBtn>
              </TaskItem>
            );
          })}
        </TaskList>
      )}
    </Wrapper>
  );
}
