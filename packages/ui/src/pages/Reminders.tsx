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

const PageTitle = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
`;

const Button = styled.button`
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #6d28d9;
  }

  &:disabled {
    background: #c4b5fd;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: #f3f4f6;
  color: #374151;
  padding: 0.35rem 0.85rem;
  font-size: 0.82rem;

  &:hover {
    background: #e5e7eb;
  }
`;

const DangerButton = styled(Button)`
  background: #fee2e2;
  color: #b91c1c;
  padding: 0.35rem 0.85rem;
  font-size: 0.82rem;

  &:hover {
    background: #fecaca;
  }
`;

const SuccessButton = styled(Button)`
  background: #d1fae5;
  color: #065f46;
  padding: 0.35rem 0.85rem;
  font-size: 0.82rem;

  &:hover {
    background: #a7f3d0;
  }
`;

const FormPanel = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
`;

const FormTitle = styled.h2`
  font-size: 1.05rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

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
  color: #374151;
`;

const Input = styled.input`
  padding: 0.45rem 0.7rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;

  &:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15);
  }
`;

const Select = styled.select`
  padding: 0.45rem 0.7rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
  background: #fff;

  &:focus {
    border-color: #7c3aed;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ErrorMsg = styled.p`
  color: #b91c1c;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
`;

const ReminderCard = styled.div<{ $fired: boolean }>`
  background: #fff;
  border: 1px solid ${({ $fired }) => ($fired ? '#d1fae5' : '#e5e7eb')};
  border-radius: 8px;
  padding: 0.9rem 1.25rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
`;

const ReminderInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ReminderLabel = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 2px;
`;

const ReminderMeta = styled.p`
  font-size: 0.78rem;
  color: #6b7280;
  margin: 0;
`;

const ReminderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: 1rem;
  flex-shrink: 0;
`;

const FiredBadge = styled.span`
  background: #d1fae5;
  color: #065f46;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
`;

const UnfiredBadge = styled.span`
  background: #fef3c7;
  color: #92400e;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 10px;
  color: #6b7280;
`;

const REMINDER_TYPES = ['general', 'task', 'rsvp', 'payment', 'shopping', 'other'];

const EMPTY_FORM = {
  eventId: '',
  label: '',
  triggerAt: '',
  type: 'general',
};

export default function Reminders() {
  const dispatch = useAppDispatch();
  const { items: reminders, loading, error } = useAppSelector((state) => state.reminders);
  const { items: events } = useAppSelector((state) => state.events);
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
    const data = {
      eventId: form.eventId ? Number(form.eventId) : undefined,
      label: form.label,
      triggerAt: form.triggerAt,
      type: form.type,
    };
    dispatch(createReminder(data)).then((action) => {
      if (createReminder.fulfilled.match(action)) {
        setShowForm(false);
        setForm(EMPTY_FORM);
      }
    });
  }

  function handleDelete(id: number) {
    if (window.confirm('Delete this reminder?')) {
      dispatch(deleteReminder(id));
    }
  }

  function handleMarkRead(id: number) {
    dispatch(markRead([id]));
  }

  const sorted = [...reminders].sort(
    (a, b) => new Date(a.triggerAt).getTime() - new Date(b.triggerAt).getTime()
  );

  return (
    <div>
      <TopBar>
        <PageTitle style={{ margin: 0 }}>Reminders</PageTitle>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>+ Create Reminder</Button>
        )}
      </TopBar>

      {showForm && (
        <FormPanel>
          <FormTitle>New Reminder</FormTitle>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <form onSubmit={handleSubmit}>
            <FormRow>
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
            </FormRow>
            <FormRow>
              <FieldGroup>
                <Label htmlFor="eventId">Event (optional)</Label>
                <Select
                  id="eventId"
                  name="eventId"
                  value={form.eventId}
                  onChange={handleChange}
                >
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
                <Select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  {REMINDER_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </Select>
              </FieldGroup>
            </FormRow>
            <FormActions>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Reminder'}
              </Button>
              <SecondaryButton
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                }}
              >
                Cancel
              </SecondaryButton>
            </FormActions>
          </form>
        </FormPanel>
      )}

      {loading && !showForm && <p style={{ color: '#6b7280' }}>Loading reminders...</p>}

      {!loading && reminders.length === 0 && !showForm && (
        <EmptyState>
          <p>No reminders yet. Create one to stay on top of party planning!</p>
        </EmptyState>
      )}

      {sorted.map((reminder) => {
        const event = events.find((e) => e.id === reminder.eventId);
        return (
          <ReminderCard key={reminder.id} $fired={reminder.fired}>
            <ReminderInfo>
              <ReminderLabel>{reminder.label}</ReminderLabel>
              <ReminderMeta>
                {reminder.triggerAt
                  ? dayjs(reminder.triggerAt).format('MMM D, YYYY h:mm A')
                  : 'No time set'}
                {event ? ` · ${event.theme || 'Party'}` : ''}
                {reminder.type && reminder.type !== 'general'
                  ? ` · ${reminder.type}`
                  : ''}
              </ReminderMeta>
            </ReminderInfo>
            <ReminderActions>
              {reminder.fired ? (
                <FiredBadge>Fired</FiredBadge>
              ) : (
                <UnfiredBadge>Pending</UnfiredBadge>
              )}
              {reminder.fired && reminder.type !== 'read' && (
                <SuccessButton onClick={() => handleMarkRead(reminder.id)}>
                  Mark read
                </SuccessButton>
              )}
              <DangerButton onClick={() => handleDelete(reminder.id)}>
                Delete
              </DangerButton>
            </ReminderActions>
          </ReminderCard>
        );
      })}
    </div>
  );
}
