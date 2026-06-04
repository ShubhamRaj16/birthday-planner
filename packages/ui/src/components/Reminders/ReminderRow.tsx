import styled from 'styled-components';
import dayjs from 'dayjs';
import { Button } from '../ui';
import { colors, radius, shadow } from '../../design/tokens';
import type { Reminder, Event } from '../../types';

interface Props {
  reminder: Reminder;
  event?: Event;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const Card = styled.div<{ $fired: boolean }>`
  background: ${colors.white};
  border: 1px solid ${({ $fired }) => ($fired ? colors.successBg : colors.borderLight)};
  border-radius: ${radius.md};
  padding: 0.9rem 1.25rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${shadow.sm};
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
`;
const Label = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${colors.text};
  margin: 0 0 2px;
`;
const Meta = styled.p`
  font-size: 0.78rem;
  color: ${colors.textSubtle};
  margin: 0;
`;
const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: 1rem;
  flex-shrink: 0;
`;

const FiredBadge = styled.span`
  background: ${colors.successBg};
  color: ${colors.success};
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: ${radius.full};
`;
const PendingBadge = styled.span`
  background: ${colors.warningBg};
  color: ${colors.warning};
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: ${radius.full};
`;

export default function ReminderRow({ reminder, event, onMarkRead, onDelete }: Props) {
  return (
    <Card $fired={reminder.fired}>
      <Info>
        <Label>{reminder.label}</Label>
        <Meta>
          {reminder.triggerAt
            ? dayjs(reminder.triggerAt).format('MMM D, YYYY h:mm A')
            : 'No time set'}
          {event ? ` · ${event.theme || 'Party'}` : ''}
          {reminder.type && reminder.type !== 'general' ? ` · ${reminder.type}` : ''}
        </Meta>
      </Info>
      <Actions>
        {reminder.fired ? <FiredBadge>Fired</FiredBadge> : <PendingBadge>Pending</PendingBadge>}
        {reminder.fired && reminder.type !== 'read' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkRead(reminder.id)}
            style={{ background: colors.successBg, color: colors.success }}
          >
            Mark read
          </Button>
        )}
        <Button variant="danger" size="sm" onClick={() => onDelete(reminder.id)}>
          Delete
        </Button>
      </Actions>
    </Card>
  );
}
