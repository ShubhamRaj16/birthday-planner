import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import styled from 'styled-components';
import dayjs from 'dayjs';
import {
  fetchReminders,
  createReminder,
  deleteReminder,
  markRead,
} from '../redux/slices/remindersSlice';
import { fetchEvents } from '../redux/slices/eventsSlice';
import { Button, Card } from '../components/ui';
import { colors, spacing, radius } from '../design/tokens';
import ReminderRow from '../components/Reminders/ReminderRow';

const PageTitle = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${colors.text};
  margin-bottom: 1.5rem;
`;
const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
`;
const FormTitle = styled.h2`
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
const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background: ${colors.bgLightest};
  border: 1px dashed ${colors.border};
  border-radius: ${radius.lg};
  color: ${colors.textSubtle};
`;

const REMINDER_TYPES = ['general', 'task', 'rsvp', 'payment', 'shopping', 'other'];
const EMPTY_FORM = { eventId: '', label: '', triggerAt: '', type: 'general' };

export default function Reminders() {
  const dispatch = useAppDispatch();
  const { items: reminders, loading, error } = useAppSelector((s) => s.reminders);
  const { items: events } = useAppSelector((s) => s.events);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    dispatch(fetchReminders());
    dispatch(fetchEvents());
  }, [dispatch]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch(
      createReminder({
        eventId: form.eventId ? Number(form.eventId) : undefined,
        label: form.label,
        triggerAt: form.triggerAt,
        type: form.type,
      })
    ).then((action) => {
      if (createReminder.fulfilled.match(action)) {
        setShowForm(false);
        setForm(EMPTY_FORM);
      }
    });
  }

  const sorted = [...reminders].sort(
    (a, b) => new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime()
  );

  return (
    <div>
      <TopBar>
        <PageTitle style={{ margin: 0 }}>Reminders</PageTitle>
        {!showForm && <Button onClick={() => setShowForm(true)}>+ Create Reminder</Button>}
      </TopBar>

      {showForm && (
        <Card style={{ marginBottom: '1.5rem', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
          <FormTitle>New Reminder</FormTitle>
          {error && (
            <p style={{ color: colors.error, fontSize: '0.85rem', marginBottom: spacing.md }}>
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <Grid2>
              <FieldGroup>
                <Label htmlFor="label">Label *</Label>
                <Input
                  id="label"
                  name="label"
                  value={form.label}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Order cake"
                />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="triggerAt">Trigger Date &amp; Time *</Label>
                <Input
                  id="triggerAt"
                  name="triggerAt"
                  type="datetime-local"
                  value={form.triggerAt}
                  onChange={handleChange}
                  required
                />
              </FieldGroup>
            </Grid2>
            <Grid2>
              <FieldGroup>
                <Label htmlFor="eventId">Event (optional)</Label>
                <Select id="eventId" name="eventId" value={form.eventId} onChange={handleChange}>
                  <option value="">None</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.theme || 'Party'} — {e.date ? dayjs(e.date).format('MMM D') : 'TBD'}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="type">Type</Label>
                <Select id="type" name="type" value={form.type} onChange={handleChange}>
                  {REMINDER_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
            </Grid2>
            <Actions>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Reminder'}
              </Button>
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                }}
              >
                Cancel
              </Button>
            </Actions>
          </form>
        </Card>
      )}

      {loading && !showForm && <p style={{ color: colors.textSubtle }}>Loading reminders...</p>}
      {!loading && reminders.length === 0 && !showForm && (
        <EmptyState>
          <p>No reminders yet. Create one to stay on top of party planning!</p>
        </EmptyState>
      )}
      {sorted.map((reminder) => (
        <ReminderRow
          key={reminder.id}
          reminder={reminder}
          event={events.find((e) => e.id === reminder.eventId)}
          onMarkRead={(id) => dispatch(markRead([id]))}
          onDelete={(id) => {
            if (window.confirm('Delete this reminder?')) dispatch(deleteReminder(id));
          }}
        />
      ))}
    </div>
  );
}
