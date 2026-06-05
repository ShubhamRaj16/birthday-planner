import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { fetchChildren } from '../redux/slices/childrenSlice';
import { fetchUpcoming } from '../redux/slices/eventsSlice';
import { colors, spacing, radius } from '../design/tokens';
import ChildBirthdayCard from '../components/Dashboard/ChildBirthdayCard';
import EventRow from '../components/Dashboard/EventRow';

const PageTitle = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${colors.text};
  margin-bottom: 1.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: ${spacing.lg};
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${colors.textMuted};
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid ${colors.primaryBorder};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2.5rem 1rem;
  background: ${colors.bgLightest};
  border: 1px dashed ${colors.border};
  border-radius: ${radius.lg};
  color: ${colors.textSubtle};

  p {
    margin-bottom: ${spacing.lg};
  }
`;

const ActionLink = styled(Link)`
  color: ${colors.primary};
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
`;

const ReminderBanner = styled(Link)`
  display: block;
  background: ${colors.warningBg};
  border: 1px solid #fbbf24;
  border-radius: ${radius.md};
  padding: 0.75rem 1.25rem;
  margin-bottom: 1.5rem;
  color: ${colors.warning};
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;

  &:hover {
    background: #fde68a;
  }
`;

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { items: children, loading: childrenLoading } = useAppSelector((s) => s.children);
  const { items: events } = useAppSelector((s) => s.events);
  const unreadCount = useAppSelector((s) => s.reminders.unreadCount);

  useEffect(() => {
    dispatch(fetchChildren());
    dispatch(fetchUpcoming());
  }, [dispatch]);

  return (
    <div>
      <PageTitle>Dashboard</PageTitle>

      {unreadCount > 0 && (
        <ReminderBanner to="/reminders">
          You have {unreadCount} unread reminder{unreadCount !== 1 ? 's' : ''} — view them here
        </ReminderBanner>
      )}

      <SectionTitle>Children</SectionTitle>
      {childrenLoading && (
        <p style={{ color: colors.textSubtle, marginBottom: spacing.lg }}>Loading...</p>
      )}
      {!childrenLoading && children.length === 0 ? (
        <EmptyState style={{ marginBottom: '2rem' }}>
          <p>No children added yet.</p>
          <ActionLink to="/children">Add your first child to get started</ActionLink>
        </EmptyState>
      ) : (
        <Grid>
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
            <EventRow key={event.id} event={event} />
          ))}
          <ActionLink to="/events" style={{ display: 'block', marginTop: '0.75rem' }}>
            View all events
          </ActionLink>
        </div>
      )}
    </div>
  );
}
