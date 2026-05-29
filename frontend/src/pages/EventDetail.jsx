import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { fetchEvent, activateEvent } from '../redux/slices/eventsSlice';
import apiClient from '../lib/apiClient';

const BackLink = styled(Link)`
  color: #7c3aed;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 1.25rem;

  &:hover {
    text-decoration: underline;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  align-items: center;
`;

const MetaItem = styled.span`
  font-size: 0.85rem;
  color: #6b7280;
`;

const StatusBadge = styled.span`
  font-size: 0.78rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  background: ${({ status }) =>
    status === 'Active' ? '#d1fae5' : status === 'Completed' ? '#e5e7eb' : '#fef3c7'};
  color: ${({ status }) =>
    status === 'Active' ? '#065f46' : status === 'Completed' ? '#374151' : '#92400e'};
`;

const Section = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #f3f4f6;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 1.5rem;

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

const InfoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const InfoLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InfoValue = styled.span`
  font-size: 0.9rem;
  color: #111827;
`;

const TaskList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TaskItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem 0;
  border-bottom: 1px solid #f9fafb;

  &:last-child {
    border-bottom: none;
  }
`;

const TaskCheckbox = styled.input`
  accent-color: #7c3aed;
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const TaskLabel = styled.label`
  font-size: 0.88rem;
  color: ${({ $done }) => ($done ? '#9ca3af' : '#111827')};
  text-decoration: ${({ $done }) => ($done ? 'line-through' : 'none')};
  cursor: pointer;
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

const ErrorMsg = styled.p`
  color: #b91c1c;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
`;

const LoadingMsg = styled.p`
  color: #6b7280;
  padding: 2rem 0;
`;

export default function EventDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: event, loading, error } = useSelector((state) => state.events);

  useEffect(() => {
    if (id) dispatch(fetchEvent(id));
  }, [id, dispatch]);

  function handleActivate() {
    dispatch(activateEvent(id));
  }

  async function handleToggleTask(taskId, done) {
    try {
      await apiClient.put(`/tasks/${taskId}`, { done: !done });
      // Re-fetch event to get updated tasks
      dispatch(fetchEvent(id));
    } catch (err) {
      console.error('Task update failed — PUT /tasks/:id not yet implemented:', err.message);
    }
  }

  if (loading) return <LoadingMsg>Loading event...</LoadingMsg>;
  if (!event) return <LoadingMsg>Event not found.</LoadingMsg>;

  const tasks = event.tasks || [];

  return (
    <div>
      <BackLink to="/events">&larr; Back to Events</BackLink>

      <PageTitle>{event.theme || 'Birthday Party'}</PageTitle>

      <MetaRow>
        <StatusBadge status={event.status}>{event.status}</StatusBadge>
        {event.child && <MetaItem>For {event.child.name}</MetaItem>}
        {event.date && (
          <MetaItem>{dayjs(event.date).format('dddd, MMMM D, YYYY')}</MetaItem>
        )}
        {event.status === 'Draft' && (
          <Button onClick={handleActivate} disabled={loading}>
            Activate Event
          </Button>
        )}
      </MetaRow>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <Section>
        <SectionTitle>Event Details</SectionTitle>
        <InfoGrid>
          {event.venue && (
            <InfoRow>
              <InfoLabel>Venue</InfoLabel>
              <InfoValue>{event.venue}</InfoValue>
            </InfoRow>
          )}
          {event.theme && (
            <InfoRow>
              <InfoLabel>Theme</InfoLabel>
              <InfoValue>{event.theme}</InfoValue>
            </InfoRow>
          )}
          {event.budget != null && (
            <InfoRow>
              <InfoLabel>Budget</InfoLabel>
              <InfoValue>&#x20B9;{Number(event.budget).toLocaleString()}</InfoValue>
            </InfoRow>
          )}
          {event.date && (
            <InfoRow>
              <InfoLabel>Date</InfoLabel>
              <InfoValue>{dayjs(event.date).format('MMM D, YYYY')}</InfoValue>
            </InfoRow>
          )}
        </InfoGrid>
      </Section>

      <Section>
        <SectionTitle>Tasks ({tasks.filter((t) => t.done).length}/{tasks.length} done)</SectionTitle>
        {tasks.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No tasks yet.</p>
        ) : (
          <TaskList>
            {tasks.map((task) => (
              <TaskItem key={task.id}>
                <TaskCheckbox
                  type="checkbox"
                  id={`task-${task.id}`}
                  checked={!!task.done}
                  onChange={() => handleToggleTask(task.id, task.done)}
                />
                <TaskLabel htmlFor={`task-${task.id}`} $done={task.done}>
                  {task.title}
                </TaskLabel>
              </TaskItem>
            ))}
          </TaskList>
        )}
      </Section>
    </div>
  );
}
