import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import { Button, FormSection } from '../ui';
import { colors, spacing } from '../../design/tokens';

interface ExpenseData {
  label: string;
  amount: number;
  category: string;
  paid: boolean;
}

interface Props {
  categories: string[];
  onSubmit: (data: ExpenseData) => Promise<void>;
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
  flex: 1 1 140px;
  min-width: 100px;

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
  flex: 1 1 160px;
  min-width: 130px;
  background: ${colors.white};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.primaryLight};
  }
`;

const CheckLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: ${colors.textMuted};
  cursor: pointer;
`;

const Err = styled.p`
  color: ${colors.error};
  font-size: 0.82rem;
  margin-top: 0.4rem;
`;

const EMPTY = { label: '', amount: '', category: 'miscellaneous', paid: false };

export default function ExpenseForm({ categories, onSubmit, onCancel: _onCancel }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.label.trim()) {
      setError('Label is required.');
      return;
    }
    if (!form.amount || isNaN(Number(form.amount))) {
      setError('Valid amount is required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSubmit({ label: form.label, amount: Number(form.amount), category: form.category, paid: form.paid });
      setForm(EMPTY);
    } catch (err) {
      setError(String(err || 'Failed to add expense.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormSection style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#5b21b6', marginBottom: spacing.md }}>
        Add Expense
      </p>
      <form onSubmit={handleSubmit}>
        <Row>
          <FlexInput
            placeholder="Label *"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
          />
          <FlexInput
            type="number"
            placeholder="Amount ₹ *"
            value={form.amount}
            min="0"
            step="1"
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <FlexSelect
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </FlexSelect>
          <CheckLabel>
            <input
              type="checkbox"
              style={{ accentColor: colors.primary }}
              checked={form.paid}
              onChange={(e) => setForm({ ...form, paid: e.target.checked })}
            />
            Paid
          </CheckLabel>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? 'Adding...' : 'Add'}
          </Button>
        </Row>
        {error && <Err>{error}</Err>}
      </form>
    </FormSection>
  );
}
