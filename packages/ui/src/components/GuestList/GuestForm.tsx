import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import { Button, FormSection } from '../ui';
import { colors, spacing } from '../../design/tokens';

interface GuestData {
  name: string;
  phone: string;
  ageGroup: string;
  dietary: string;
}

interface Props {
  onSubmit: (data: GuestData) => Promise<void>;
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
  flex: 1 1 120px;
  min-width: 90px;
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

const EMPTY: GuestData = { name: '', phone: '', ageGroup: 'adult', dietary: '' };

export default function GuestForm({ onSubmit, onCancel: _onCancel }: Props) {
  const [form, setForm] = useState<GuestData>(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSubmit(form);
      setForm(EMPTY);
    } catch (err) {
      setError(String(err || 'Failed to add guest.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormSection style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#5b21b6', marginBottom: spacing.md }}>
        Add Guest
      </p>
      <form onSubmit={handleSubmit}>
        <Row>
          <FlexInput
            placeholder="Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <FlexInput
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <FlexSelect
            value={form.ageGroup}
            onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
          >
            <option value="adult">Adult</option>
            <option value="child">Child</option>
          </FlexSelect>
          <FlexInput
            placeholder="Dietary"
            value={form.dietary}
            onChange={(e) => setForm({ ...form, dietary: e.target.value })}
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
