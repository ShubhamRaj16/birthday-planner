import { Link } from 'react-router-dom';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { colors, spacing, radius, shadow } from '../../design/tokens';
import type { Event, EventStatus } from '../../types';

interface Props {
  event: Event;
}

const Item = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.borderLight};
  border-radius: ${radius.md};
  padding: 1rem 1.25rem;
  margin-bottom: ${spacing.sm};
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${shadow.sm};
`;

const Meta = styled.div``;

const Name = styled.p`
  font-weight: 600;
  font-size: 0.95rem;
  color: ${colors.text};
`;

const DateLine = styled.p`
  font-size: 0.8rem;
  color: ${colors.textSubtle};
  margin-top: 2px;
`;

const StatusBadge = styled.span<{ status: EventStatus }>`
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: ${radius.full};
  background: ${({ status }) =>
    status === 'Active' ? colors.successBg : status === 'Completed' ? colors.bgLight : colors.warningBg};
  color: ${({ status }) =>
    status === 'Active' ? colors.success : status === 'Completed' ? colors.textMuted : colors.warning};
`;

const MyGateWarning = styled(Link)`
  display: inline-block;
  font-size: 0.75rem;
  color: #9a3412;
  background: #fff7ed;
  border: 1px solid #fb923c;
  border-radius: 5px;
  padding: 2px 8px;
  margin-top: 4px;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    background: #fed7aa;
  }
`;

export default function EventRow({ event }: Props) {
  const daysUntil = event.date ? dayjs(event.date).diff(dayjs(), 'day') : null;
  const showMyGateWarning =
    event.status === 'Active' &&
    !event.myGateLink &&
    daysUntil !== null &&
    daysUntil >= 0 &&
    daysUntil <= 14;

  return (
    <Item>
      <Meta>
        <Name>{event.theme || 'Birthday Party'}</Name>
        <DateLine>
          {event.child?.name && `${event.child.name} — `}
          {event.date ? dayjs(event.date).format('MMM D, YYYY') : 'Date TBD'}
          {event.venue ? ` @ ${event.venue}` : ''}
        </DateLine>
        {showMyGateWarning && (
          <MyGateWarning to={`/events/${event.id}`}>&#9888;&#65039; Add MyGate link</MyGateWarning>
        )}
      </Meta>
      <StatusBadge status={event.status}>{event.status}</StatusBadge>
    </Item>
  );
}
