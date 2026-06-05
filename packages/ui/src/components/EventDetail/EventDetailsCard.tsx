import styled from 'styled-components';
import { Card } from '../ui';
import { colors, spacing } from '../../design/tokens';
import EventEditForm, { type EditFormState } from './EventEditForm';
import GooglePhotosField from './GooglePhotosField';
import type { AppDispatch } from '../../redux/store';
import type { Event } from '../../types';

interface Props {
  event: Event;
  eventId: number;
  dispatch: AppDispatch;
  editOpen: boolean;
  editForm: EditFormState;
  saving: boolean;
  onEditFormChange: (form: EditFormState) => void;
  onSave: () => void;
  onCancelEdit: () => void;
}

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${colors.textMuted};
  margin-bottom: ${spacing.md};
  padding-bottom: 0.4rem;
  border-bottom: 1px solid ${colors.bgLight};
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
  color: ${colors.textDisabled};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InfoValue = styled.span`
  font-size: 0.9rem;
  color: ${colors.text};
`;

const StyledCard = styled(Card)`
  margin-bottom: 1.25rem;
  padding: 1.25rem 1.5rem;
`;

export default function EventDetailsCard({
  event,
  eventId,
  dispatch,
  editOpen,
  editForm,
  saving,
  onEditFormChange,
  onSave,
  onCancelEdit,
}: Props) {
  return (
    <StyledCard>
      <SectionTitle>Event Details</SectionTitle>
      {editOpen ? (
        <EventEditForm
          form={editForm}
          saving={saving}
          onChange={onEditFormChange}
          onSave={onSave}
          onCancel={onCancelEdit}
        />
      ) : (
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
              <InfoValue>{event.date}</InfoValue>
            </InfoRow>
          )}
        </InfoGrid>
      )}
      <GooglePhotosField eventId={eventId} event={event} dispatch={dispatch} />
    </StyledCard>
  );
}
