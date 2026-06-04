import { useEffect, useState } from 'react';
import styled from 'styled-components';
import type { AppDispatch } from '../../redux/store';
import { updateEvent } from '../../redux/slices/eventsSlice';
import { colors, spacing, radius, fontSize } from '../../design/tokens';
import type { Event } from '../../types';

interface Props {
  eventId: number;
  event: Event;
  dispatch: AppDispatch;
}

const Label = styled.span`
  font-size: ${fontSize.xs};
  font-weight: 600;
  color: ${colors.textDisabled};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  margin-top: ${spacing.md};
  flex-wrap: wrap;
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  padding: 0.4rem 0.7rem;
  border: 1px solid ${colors.border};
  border-radius: ${radius.sm};
  font-size: ${fontSize.sm};
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const SaveBtn = styled.button`
  background: ${colors.primary};
  color: ${colors.white};
  border: none;
  border-radius: ${radius.sm};
  padding: 0.4rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background: ${colors.primaryHover};
  }
`;

const Anchor = styled.a`
  color: ${colors.primary};
  font-size: ${fontSize.sm};
  font-weight: 600;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

export default function GooglePhotosField({ eventId, event, dispatch }: Props) {
  const [url, setUrl] = useState(event.googlePhotosUrl || '');
  const [saved, setSaved] = useState(false);

  // Sync local input when the event prop updates from Redux (e.g. after save)
  useEffect(() => {
    setUrl(event.googlePhotosUrl || ''); // eslint-disable-line react-hooks/set-state-in-effect
  }, [event.googlePhotosUrl]);

  async function handleSave() {
    await dispatch(updateEvent({ id: eventId, data: { googlePhotosUrl: url.trim() || null } }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ marginTop: spacing.md }}>
      <Label>Google Photos Album</Label>
      <Row>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste Google Photos shared album URL"
        />
        <SaveBtn onClick={handleSave}>{saved ? 'Saved' : 'Save'}</SaveBtn>
        {event.googlePhotosUrl && (
          <Anchor href={event.googlePhotosUrl} target="_blank" rel="noopener noreferrer">
            Open Album ↗
          </Anchor>
        )}
      </Row>
    </div>
  );
}
