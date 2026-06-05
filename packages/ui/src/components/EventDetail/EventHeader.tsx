import { Link } from 'react-router-dom';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { Button } from '../ui';
import { colors, spacing, radius, fontSize } from '../../design/tokens';
import type { Event, EventStatus } from '../../types';

interface Props {
  event: Event;
  loading: boolean;
  onActivate: () => void;
  onRefresh: () => void;
  onEdit: () => void;
}

const BackLink = styled(Link)`
  color: ${colors.primary};
  text-decoration: none;
  font-size: ${fontSize.sm};
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 1.25rem;
  &:hover {
    text-decoration: underline;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${spacing.lg};
  flex-wrap: wrap;
  margin-bottom: 0.4rem;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colors.text};
  margin: 0;
`;
const Actions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  flex-wrap: wrap;
  align-items: center;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.md};
  margin-bottom: 1.5rem;
  align-items: center;
`;

const MetaItem = styled.span`
  font-size: 0.85rem;
  color: ${colors.textSubtle};
`;

const StatusBadge = styled.span<{ status: EventStatus }>`
  font-size: 0.78rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: ${radius.full};
  background: ${({ status }) =>
    status === 'Active'
      ? colors.successBg
      : status === 'Completed'
        ? colors.bgLight
        : colors.warningBg};
  color: ${({ status }) =>
    status === 'Active'
      ? colors.success
      : status === 'Completed'
        ? colors.textMuted
        : colors.warning};
`;

const WarningBanner = styled.div`
  background: #fff7ed;
  border: 1px solid #fb923c;
  border-radius: ${radius.md};
  padding: 0.65rem ${spacing.lg};
  font-size: ${fontSize.sm};
  color: #9a3412;
  font-weight: 500;
  margin-top: ${spacing.sm};
  width: 100%;
`;

export default function EventHeader({ event, loading, onActivate, onRefresh, onEdit }: Props) {
  const daysUntil = event.date ? dayjs(event.date).diff(dayjs(), 'day') : null;
  const showWarning =
    event.status === 'Active' &&
    !event.myGateLink &&
    daysUntil !== null &&
    daysUntil >= 0 &&
    daysUntil <= 14;

  return (
    <>
      <BackLink to="/events">&larr; Back to Events</BackLink>
      <HeaderRow>
        <PageTitle>{event.theme || 'Birthday Party'}</PageTitle>
        <Actions>
          <Button variant="secondary" size="sm" onClick={onRefresh}>
            &#x21bb; Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Edit
          </Button>
          {event.status === 'Draft' && (
            <Button size="sm" onClick={onActivate} disabled={loading}>
              Activate Event
            </Button>
          )}
        </Actions>
      </HeaderRow>
      <MetaRow>
        <StatusBadge status={event.status}>{event.status}</StatusBadge>
        {event.child && <MetaItem>For {event.child.name}</MetaItem>}
        {event.date && <MetaItem>{dayjs(event.date).format('dddd, MMMM D, YYYY')}</MetaItem>}
        {showWarning && (
          <WarningBanner>
            &#9888;&#65039; Event is in {daysUntil} days — add your MyGate link in the Invites tab
          </WarningBanner>
        )}
      </MetaRow>
    </>
  );
}
