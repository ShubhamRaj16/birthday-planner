import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { fetchChildren } from '../redux/slices/childrenSlice';
import { fetchUpcoming } from '../redux/slices/eventsSlice';

const PageTitle = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid #e9d5ff;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const Avatar = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #7c3aed;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CardInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ChildName = styled.p`
  font-weight: 600;
  color: #111827;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DaysUntil = styled.p`
  font-size: 0.8rem;
  color: ${({ $soon }) => ($soon ? '#f59e0b' : '#6b7280')};
  margin-top: 2px;
`;

const EventItem = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
`;

const EventMeta = styled.div``;

const EventName = styled.p`
  font-weight: 600;
  font-size: 0.95rem;
  color: #111827;
`;

const EventDate = styled.p`
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 2px;
`;

const StatusBadge = styled.span`
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
  padding: 2.5rem 1rem;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 10px;
  color: #6b7280;

  p {
    margin-bottom: 1rem;
  }
`;

const ActionLink = styled(Link)`
  color: #7c3aed;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
`;

const ReminderBanner = styled(Link)`
  display: block;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1.5rem;
  color: #92400e;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;

  &:hover {
    background: #fde68a;
  }
`;

function getDaysUntilBirthday(dobStr) {
  if (!dobStr) return null;
  const today = dayjs();
  const dob = dayjs(dobStr);
  let next = dob.year(today.year());
  if (next.isBefore(today, 'day')) {
    next = next.add(1, 'year');
  }
  return next.diff(today, 'day');
}

function ChildBirthdayCard({ child }) {
  const days = getDaysUntilBirthday(child.dob);
  const initial = (child.name || '?')[0].toUpperCase();

  return (
    <Card>
      <Avatar>
        {child.photo ? <img src={`http://localhost:3001${child.photo}`} alt={child.name} /> : initial}
      </Avatar>
      <CardInfo>
        <ChildName>{child.name}</ChildName>
        <DaysUntil $soon={days !== null && days <= 30}>
          {days === 0
            ? 'Birthday today!'
            : days === 1
            ? 'Birthday tomorrow!'
            : days !== null
            ? `Birthday in ${days} day${days !== 1 ? 's' : ''}`
            : 'No birthday set'}
        </DaysUntil>
      </CardInfo>
    </Card>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { items: children, loading: childrenLoading } = useSelector(
    (state) => state.children
  );
  const { items: events } = useSelector((state) => state.events);
  const unreadCount = useSelector((state) => state.reminders.unreadCount);

  useEffect(() => {
    dispatch(fetchChildren());
    dispatch(fetchUpcoming());
  }, [dispatch]);

  return (
    <div>
      <PageTitle>Dashboard</PageTitle>

      {unreadCount > 0 && (
        <ReminderBanner to="/reminders">
          You have {unreadCount} unread reminder{unreadCount !== 1 ? 's' : ''} — view them
          here
        </ReminderBanner>
      )}

      <SectionTitle>Children</SectionTitle>
      {childrenLoading && <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Loading...</p>}
      {!childrenLoading && children.length === 0 ? (
        <EmptyState style={{ marginBottom: '2rem' }}>
          <p>No children added yet.</p>
          <ActionLink to="/children">Add your first child to get started</ActionLink>
        </EmptyState>
      ) : (
        <Grid style={{ marginBottom: '2rem' }}>
          {children.map((child) => (
            <ChildBirthdayCard key={child.id} child={child} />
          ))}
        </Grid>
      )}

      <SectionTitle>Upcoming Events</SectionTitle>
      {events.length === 0 ? (
        <EmptyState>
          <p>No upcoming events.</p>
          <ActionLink to="/events">Create an event</ActionLink>
        </EmptyState>
      ) : (
        <div>
          {events.slice(0, 5).map((event) => (
            <EventItem key={event.id}>
              <EventMeta>
                <EventName>{event.theme || 'Birthday Party'}</EventName>
                <EventDate>
                  {event.child?.name && `${event.child.name} — `}
                  {event.date ? dayjs(event.date).format('MMM D, YYYY') : 'Date TBD'}
                  {event.venue ? ` @ ${event.venue}` : ''}
                </EventDate>
              </EventMeta>
              <StatusBadge status={event.status}>{event.status}</StatusBadge>
            </EventItem>
          ))}
          <ActionLink to="/events" style={{ display: 'block', marginTop: '0.75rem' }}>
            View all events
          </ActionLink>
        </div>
      )}
    </div>
  );
}
