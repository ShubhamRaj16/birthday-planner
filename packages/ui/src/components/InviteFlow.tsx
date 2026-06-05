import { useEffect } from 'react';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchGuests } from '../redux/slices/guestsSlice';
import { Card } from './ui';
import { colors, spacing, fontSize } from '../design/tokens';
import InviteCard from './InviteFlow/InviteCard';
import WaComposer from './InviteFlow/WaComposer';
import BulkSendQueue from './InviteFlow/BulkSendQueue';
import type { Event } from '../types';

interface InviteFlowProps {
  eventId: number;
  event: Event;
  onRefresh?: () => void;
  suggestedTemplate?: string;
}

const FlowWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const SectionTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${colors.textMuted};
  margin-bottom: ${spacing.lg};
  padding-bottom: 0.4rem;
  border-bottom: 1px solid ${colors.bgLight};
`;

const StyledCard = styled(Card)`
  padding: 1.25rem 1.5rem;
`;

const Label = styled.p`
  font-size: ${fontSize.xs};
  color: ${colors.textSubtle};
  margin-bottom: 0.25rem;
`;

export default function InviteFlow({
  eventId,
  event,
  onRefresh,
  suggestedTemplate,
}: InviteFlowProps) {
  const dispatch = useAppDispatch();
  const guests = useAppSelector((state) => state.guests.byEventId[eventId] || []);

  useEffect(() => {
    dispatch(fetchGuests(eventId));
  }, [eventId, dispatch]);

  return (
    <FlowWrapper>
      <StyledCard>
        <SectionTitle>A. Invite Card &amp; MyGate Link</SectionTitle>
        <InviteCard eventId={eventId} event={event} dispatch={dispatch} onRefresh={onRefresh} />
      </StyledCard>

      <StyledCard>
        <SectionTitle>B. Message Template</SectionTitle>
        <Label>
          Use placeholders: {'{guestName}'}, {'{childName}'}, {'{date}'}, {'{venue}'},{' '}
          {'{myGateLink}'}
        </Label>
        <WaComposer
          eventId={eventId}
          event={event}
          dispatch={dispatch}
          suggestedTemplate={suggestedTemplate}
        />
      </StyledCard>

      <StyledCard>
        <SectionTitle>C. Send Queue</SectionTitle>
        <BulkSendQueue eventId={eventId} guests={guests} dispatch={dispatch} />
      </StyledCard>
    </FlowWrapper>
  );
}
