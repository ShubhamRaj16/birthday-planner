import { useState, type ChangeEvent, type FormEvent } from 'react';
import styled from 'styled-components';
import { Button, Card } from '../ui';
import { colors, spacing, radius } from '../../design/tokens';
import type { Child } from '../../types';

interface Props {
  childList: Child[];
  loading: boolean;
  error: string | null;
  onSubmit: (data: {
    childId: number;
    date: string;
    venue: string;
    theme: string;
    budget?: number;
  }) => void;
  onCancel: () => void;
}

const Title = styled.h2`
  font-size: 1.05rem;
  font-weight: 600;
  color: ${colors.textMuted};
  margin-bottom: ${spacing.lg};
`;
const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.md};
  margin-bottom: ${spacing.md};
  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;
const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const Label = styled.label`
  font-size: 0.82rem;
  font-weight: 500;
  color: ${colors.textMuted};
`;
const Input = styled.input`
  padding: 0.45rem 0.7rem;
  border: 1px solid ${colors.border};
  border-radius: ${radius.sm};
  font-size: 0.9rem;
  outline: none;
  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15);
  }
`;
const Select = styled.select`
  padding: 0.45rem 0.7rem;
  border: 1px solid ${colors.border};
  border-radius: ${radius.sm};
  font-size: 0.9rem;
  outline: none;
  background: ${colors.white};
  &:focus {
    border-color: ${colors.primary};
  }
`;
const Actions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-top: ${spacing.lg};
`;
const Msg = styled.p`
  color: ${colors.error};
  font-size: 0.85rem;
  margin-bottom: ${spacing.md};
`;

const EMPTY = { childId: '', date: '', venue: '', theme: '', budget: '' };

export default function EventForm({ childList, loading, error, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState(EMPTY);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit({
      childId: Number(form.childId),
      date: form.date,
      venue: form.venue,
      theme: form.theme,
      budget: form.budget ? Number(form.budget) : undefined,
    });
  }

  return (
    <Card style={{ marginBottom: '1.5rem', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
      <Title>New Event</Title>
      {error && <Msg>{error}</Msg>}
      <form onSubmit={handleSubmit}>
        <Grid2>
          <FieldGroup>
            <Label htmlFor="childId">Child *</Label>
            <Select
              id="childId"
              name="childId"
              value={form.childId}
              onChange={handleChange}
              required
            >
              <option value="">Select a child</option>
              {childList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="date">Event Date *</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </FieldGroup>
        </Grid2>
        <Grid2>
          <FieldGroup>
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              name="venue"
              value={form.venue}
              onChange={handleChange}
              placeholder="e.g. Club House"
            />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="theme">Theme</Label>
            <Input
              id="theme"
              name="theme"
              value={form.theme}
              onChange={handleChange}
              placeholder="e.g. Unicorn"
            />
          </FieldGroup>
        </Grid2>
        <Grid2>
          <FieldGroup>
            <Label htmlFor="budget">Budget (INR)</Label>
            <Input
              id="budget"
              name="budget"
              type="number"
              min="0"
              value={form.budget}
              onChange={handleChange}
              placeholder="e.g. 25000"
            />
          </FieldGroup>
        </Grid2>
        <Actions>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Event'}
          </Button>
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
        </Actions>
      </form>
    </Card>
  );
}
