import type { MouseEvent } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { Button } from '../ui';
import { colors, radius, shadow } from '../../design/tokens';
import type { Event, EventStatus } from '../../types';

interface Props {
  event: Event;
  onClick: () => void;
  onDelete: (e: MouseEvent, id: number) => void;
}

const Card = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.borderLight};
  border-radius: ${radius.lg};
  padding: 1.25rem;
  margin-bottom: 0.75rem;
  box-shadow: ${shadow.card};
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: box-shadow 0.15s;
  &:hover {
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.1);
  }
`;

const Name = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${colors.text};
  margin: 0 0 4px;
`;
const Meta = styled.p`
  font-size: 0.8rem;
  color: ${colors.textSubtle};
  margin: 0;
`;
const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusBadge = styled.span<{ status: EventStatus }>`
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
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

export default function EventCard({ event, onClick, onDelete }: Props) {
  return (
    <Card onClick={onClick}>
      <div>
        <Name>{event.theme || 'Birthday Party'}</Name>
        <Meta>
          {event.child?.name && `${event.child.name} · `}
          {event.date ? dayjs(event.date).format('MMM D, YYYY') : 'Date TBD'}
          {event.venue ? ` · ${event.venue}` : ''}
          {event.budget ? ` · Budget: ₹${Number(event.budget).toLocaleString()}` : ''}
        </Meta>
      </div>
      <Right>
        <StatusBadge status={event.status}>{event.status}</StatusBadge>
        <Button
          variant="danger"
          size="sm"
          onClick={(e) => onDelete(e as MouseEvent, event.id)}
        >
          Delete
        </Button>
      </Right>
    </Card>
  );
}
