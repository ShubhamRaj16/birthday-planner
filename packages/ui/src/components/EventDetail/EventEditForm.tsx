import type { ChangeEvent } from 'react';
import styled from 'styled-components';
import { Button } from '../ui';
import { colors, spacing, radius, fontSize } from '../../design/tokens';

export interface EditFormState {
  date: string;
  venue: string;
  address: string;
  theme: string;
  budget: string;
  notes: string;
}

interface Props {
  form: EditFormState;
  saving: boolean;
  onChange: (form: EditFormState) => void;
  onSave: () => void;
  onCancel: () => void;
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1.5rem;
  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

const FieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Label = styled.span`
  font-size: ${fontSize.xs};
  font-weight: 600;
  color: ${colors.textDisabled};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.4rem 0.7rem;
  border: 1px solid ${colors.border};
  border-radius: ${radius.sm};
  font-size: ${fontSize.sm};
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-top: ${spacing.md};
`;

export default function EventEditForm({ form, saving, onChange, onSave, onCancel }: Props) {
  const set = (key: keyof EditFormState) => (e: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...form, [key]: e.target.value });

  return (
    <div>
      <Grid>
        <FieldRow>
          <Label>Date</Label>
          <Input type="date" value={form.date} onChange={set('date')} />
        </FieldRow>
        <FieldRow>
          <Label>Theme</Label>
          <Input value={form.theme} onChange={set('theme')} />
        </FieldRow>
        <FieldRow>
          <Label>Venue</Label>
          <Input value={form.venue} onChange={set('venue')} />
        </FieldRow>
        <FieldRow>
          <Label>Address</Label>
          <Input value={form.address} onChange={set('address')} />
        </FieldRow>
        <FieldRow>
          <Label>Budget (₹)</Label>
          <Input type="number" min="0" value={form.budget} onChange={set('budget')} />
        </FieldRow>
        <FieldRow>
          <Label>Notes</Label>
          <Input value={form.notes} onChange={set('notes')} />
        </FieldRow>
      </Grid>
      <Actions>
        <Button size="sm" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </Actions>
    </div>
  );
}
