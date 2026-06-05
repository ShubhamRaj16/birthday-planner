import { useEffect, useState, type MouseEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { fetchEvents, createEvent, deleteEvent } from '../redux/slices/eventsSlice';
import { fetchChildren } from '../redux/slices/childrenSlice';
import { Button } from '../components/ui';
import { colors, spacing, radius } from '../design/tokens';
import EventCard from '../components/Events/EventCard';
import EventForm from '../components/Events/EventForm';

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
const FilterTabs = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.lg};
  flex-wrap: wrap;
`;
const FilterTab = styled.button<{ $active: boolean }>`
  padding: 0.35rem 0.85rem;
  border-radius: ${radius.full};
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid ${({ $active }) => ($active ? colors.primary : colors.borderLight)};
  background: ${({ $active }) => ($active ? colors.primary : colors.white)};
  color: ${({ $active }) => ($active ? colors.white : colors.textSubtle)};
  &:hover {
    border-color: ${colors.primary};
  }
`;
const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background: ${colors.bgLightest};
  border: 1px dashed ${colors.border};
  border-radius: ${radius.lg};
  color: ${colors.textSubtle};
`;

const FILTERS = ['All', 'Draft', 'Active', 'Completed'] as const;
type EventFilter = (typeof FILTERS)[number];

export default function Events() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: events, loading, error } = useAppSelector((s) => s.events);
  const { items: children } = useAppSelector((s) => s.children);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<EventFilter>('All');

  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchChildren());
  }, [dispatch]);

  function handleCreate(data: {
    childId: number;
    date: string;
    venue: string;
    theme: string;
    budget?: number;
  }) {
    dispatch(createEvent(data)).then((action) => {
      if (createEvent.fulfilled.match(action)) setShowForm(false);
    });
  }

  function handleDelete(e: MouseEvent, id: number) {
    e.stopPropagation();
    if (window.confirm('Delete this event and all its data?')) dispatch(deleteEvent(id));
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
        {!showForm && <Button onClick={() => setShowForm(true)}>+ Create Event</Button>}
      </TopBar>

      {showForm && (
        <EventForm
          childList={children}
          loading={loading}
          error={error}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
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

      {loading && !showForm && <p style={{ color: colors.textSubtle }}>Loading events...</p>}

      {!loading && events.length === 0 && !showForm && (
        <EmptyState>
          <p>No events yet. Click &ldquo;Create Event&rdquo; to plan the first party!</p>
        </EmptyState>
      )}

      {sorted.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onClick={() => navigate(`/events/${event.id}`)}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
