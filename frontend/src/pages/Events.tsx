import { useEffect, useState, type ChangeEvent, type FormEvent, type MouseEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import dayjs from 'dayjs';
import type { EventStatus } from '../types';
import { fetchEvents, createEvent, deleteEvent } from '../redux/slices/eventsSlice';
import { fetchChildren } from '../redux/slices/childrenSlice';

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

  &:hover {
    background: #e5e7eb;
  }
`;

const DangerButton = styled(Button)`
  background: #fee2e2;
  color: #b91c1c;

  &:hover {
    background: #fecaca;
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

const EventCard = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: box-shadow 0.15s;

  &:hover {
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.1);
  }
`;

const EventInfo = styled.div``;

const EventName = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px;
`;

const EventMeta = styled.p`
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
`;

const EventRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusBadge = styled.span<{ status: EventStatus }>`
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${({ status }) =>
    status === 'Active' ? '#d1fae5' : status === 'Completed' ? '#e5e7eb' : '#fef3c7'};
  color: ${({ status }) =>
    status === 'Active' ? '#065f46' : status === 'Completed' ? '#374151' : '#92400e'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 10px;
  color: #6b7280;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const FilterTab = styled.button<{ $active: boolean }>`
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid ${({ $active }) => ($active ? '#7c3aed' : '#e5e7eb')};
  background: ${({ $active }) => ($active ? '#7c3aed' : '#fff')};
  color: ${({ $active }) => ($active ? '#fff' : '#6b7280')};
  &:hover { border-color: #7c3aed; }
`;

const FILTERS = ['All', 'Draft', 'Active', 'Completed'] as const;
type EventFilter = (typeof FILTERS)[number];

const EMPTY_FORM = {
  childId: '',
  date: '',
  venue: '',
  theme: '',
  budget: '',
};

export default function Events() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: events, loading, error } = useAppSelector((state) => state.events);
  const { items: children } = useAppSelector((state) => state.children);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState<EventFilter>('All'); // SCRUM-45

  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchChildren());
  }, [dispatch]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = {
      childId: Number(form.childId),
      date: form.date,
      venue: form.venue,
      theme: form.theme,
      budget: form.budget ? Number(form.budget) : undefined,
    };
    dispatch(createEvent(data)).then((action) => {
      if (createEvent.fulfilled.match(action)) {
        setShowForm(false);
        setForm(EMPTY_FORM);
      }
    });
  }

  function handleDelete(e: MouseEvent<HTMLButtonElement>, id: number) {
    e.stopPropagation();
    if (window.confirm('Delete this event and all its data?')) {
      dispatch(deleteEvent(id));
    }
  }

  const sorted = [...events]
    .filter((e) => filter === 'All' || e.status === filter)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const countFor = (f: EventFilter) =>
    f === 'All' ? events.length : events.filter((e) => e.status === f).length;

  return (
    <div>
      <TopBar>
        <PageTitle style={{ margin: 0 }}>Events</PageTitle>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>+ Create Event</Button>
        )}
      </TopBar>

      {showForm && (
        <FormPanel>
          <FormTitle>New Event</FormTitle>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <form onSubmit={handleSubmit}>
            <FormRow>
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
                  {children.map((c) => (
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
            </FormRow>
            <FormRow>
              <FieldGroup>
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  name="venue"
                  value={form.venue}
                  onChange={handleChange}
                  placeholder="e.g. Backyard, Club House"
                />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="theme">Theme</Label>
                <Input
                  id="theme"
                  name="theme"
                  value={form.theme}
                  onChange={handleChange}
                  placeholder="e.g. Unicorn, Superhero"
                />
              </FieldGroup>
            </FormRow>
            <FormRow>
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
            </FormRow>
            <FormActions>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Event'}
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

      {events.length > 0 && (
        <FilterTabs>
          {FILTERS.map((f) => (
            <FilterTab key={f} $active={filter === f} onClick={() => setFilter(f)}>
              {f} ({countFor(f)})
            </FilterTab>
          ))}
        </FilterTabs>
      )}

      {loading && !showForm && <p style={{ color: '#6b7280' }}>Loading events...</p>}

      {!loading && events.length === 0 && !showForm && (
        <EmptyState>
          <p>No events yet. Click &ldquo;Create Event&rdquo; to plan the first party!</p>
        </EmptyState>
      )}

      {sorted.map((event) => (
        <EventCard key={event.id} onClick={() => navigate(`/events/${event.id}`)}>
          <EventInfo>
            <EventName>{event.theme || 'Birthday Party'}</EventName>
            <EventMeta>
              {event.child?.name && `${event.child.name} · `}
              {event.date ? dayjs(event.date).format('MMM D, YYYY') : 'Date TBD'}
              {event.venue ? ` · ${event.venue}` : ''}
              {event.budget ? ` · Budget: ₹${Number(event.budget).toLocaleString()}` : ''}
            </EventMeta>
          </EventInfo>
          <EventRight>
            <StatusBadge status={event.status}>{event.status}</StatusBadge>
            <DangerButton onClick={(e) => handleDelete(e, event.id)}>
              Delete
            </DangerButton>
          </EventRight>
        </EventCard>
      ))}
    </div>
  );
}
