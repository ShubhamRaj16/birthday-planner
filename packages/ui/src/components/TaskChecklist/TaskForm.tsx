import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import { Button, FormSection } from '../ui';
import { colors, spacing } from '../../design/tokens';

interface TaskData {
  title: string;
  category: string;
  dueDate?: string;
}

interface Props {
  onSubmit: (data: TaskData) => Promise<void>;
  onCancel: () => void;
}

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
  align-items: flex-end;
  margin-bottom: ${spacing.sm};
`;

const FlexInput = styled.input`
  border: 1px solid ${colors.border};
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font-size: 0.875rem;
  flex: 1 1 180px;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.primaryLight};
  }
`;

const FlexSelect = styled.select`
  border: 1px solid ${colors.border};
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font-size: 0.875rem;
  flex: 1 1 140px;
  min-width: 110px;
  background: ${colors.white};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.primaryLight};
  }
`;

const Err = styled.p`
  color: ${colors.error};
  font-size: 0.82rem;
  margin-top: 0.4rem;
`;

const TASK_CATEGORIES = [
  'venue',
  'catering',
  'decorations',
  'invitations',
  'entertainment',
  'photography',
  'gifts',
  'logistics',
  'miscellaneous',
];

const EMPTY = { title: '', category: 'miscellaneous', dueDate: '' };

export default function TaskForm({ onSubmit, onCancel: _onCancel }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSubmit({ title: form.title.trim(), category: form.category, dueDate: form.dueDate || undefined });
      setForm(EMPTY);
    } catch (err) {
      setError(String(err || 'Failed to add task.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormSection style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#5b21b6', marginBottom: spacing.md }}>
        New Task
      </p>
      <form onSubmit={handleSubmit}>
        <Row>
          <FlexInput
            placeholder="Task title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <FlexSelect
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {TASK_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </FlexSelect>
          <FlexInput
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            style={{ flex: '0 1 150px', minWidth: '130px' }}
          />
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? 'Adding...' : 'Add'}
          </Button>
        </Row>
        {error && <Err>{error}</Err>}
      </form>
    </FormSection>
  );
}
