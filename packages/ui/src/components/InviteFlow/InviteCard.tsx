import { useState, type ChangeEvent } from 'react';
import styled from 'styled-components';
import type { AppDispatch } from '../../redux/store';
import { updateEvent } from '../../redux/slices/eventsSlice';
import { eventsApi } from '../../api/events.api';
import { getApiError } from '../../lib/apiError';
import { mediaUrl } from '../../lib/media';
import { Button } from '../ui';
import { colors, spacing, radius, fontSize } from '../../design/tokens';
import type { Event } from '../../types';
import dayjs from 'dayjs';

interface Props {
  eventId: number;
  event: Event;
  dispatch: AppDispatch;
  onRefresh?: () => void;
}

const CardPreviewImg = styled.img`
  max-width: 240px;
  max-height: 200px;
  border-radius: ${radius.md};
  border: 1px solid ${colors.borderLight};
  display: block;
  margin-bottom: ${spacing.md};
  object-fit: contain;
`;

const FileInput = styled.input`
  font-size: ${fontSize.sm};
  color: ${colors.textMuted};
  margin-bottom: ${spacing.sm};
  display: block;
`;

const UploadStatus = styled.span<{ $success?: boolean }>`
  font-size: 0.82rem;
  color: ${({ $success }) => ($success ? colors.success : colors.textSubtle)};
  margin-left: ${spacing.sm};
`;

const Row = styled.div`
  display: flex;
  gap: ${spacing.md};
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: ${spacing.sm};
`;

const TextInput = styled.input`
  border: 1px solid ${colors.border};
  border-radius: ${radius.sm};
  padding: 0.4rem 0.7rem;
  font-size: ${fontSize.sm};
  color: ${colors.text};
  flex: 1 1 200px;
  min-width: 180px;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.primaryLight};
  }
`;

const WarningBanner = styled.div`
  background: #fff7ed;
  border: 1px solid #fb923c;
  border-radius: ${radius.md};
  padding: 0.65rem 1rem;
  font-size: ${fontSize.sm};
  color: #9a3412;
  font-weight: 500;
  margin-bottom: ${spacing.md};
`;

const SubTitle = styled.h4`
  font-size: 0.85rem;
  font-weight: 600;
  color: #5b21b6;
  margin-bottom: ${spacing.sm};
  margin-top: ${spacing.lg};
  &:first-child {
    margin-top: 0;
  }
`;

const Msg = styled.p<{ $error?: boolean }>`
  color: ${({ $error }) => ($error ? colors.error : colors.success)};
  font-size: 0.82rem;
  margin-top: 0.25rem;
`;

export default function InviteCard({ eventId, event, dispatch, onRefresh }: Props) {
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [showReplaceInput, setShowReplaceInput] = useState(false);
  const [myGateLink, setMyGateLink] = useState(event.myGateLink || '');
  const [myGateSaving, setMyGateSaving] = useState(false);
  const [myGateSaved, setMyGateSaved] = useState(false);
  const [myGateError, setMyGateError] = useState('');
  const [validErr, setValidErr] = useState('');

  const cardImageUrl = event.cardPath ? mediaUrl(event.cardPath) : null;
  const daysUntilEvent = event.date ? dayjs(event.date).diff(dayjs(), 'day') : null;
  const showWarning =
    event.status === 'Active' &&
    !event.myGateLink &&
    daysUntilEvent !== null &&
    daysUntilEvent >= 0 &&
    daysUntilEvent <= 14;

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large (max 10MB).');
      return;
    }
    setUploadError('');
    setUploadStatus('uploading');
    try {
      await eventsApi.uploadInviteCard(eventId, file);
      setUploadStatus('done');
      setShowReplaceInput(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      setUploadStatus('error');
      setUploadError(getApiError(err) || 'Upload failed.');
    }
  }

  async function handleMyGateSave() {
    if (myGateLink && !myGateLink.startsWith('http://') && !myGateLink.startsWith('https://')) {
      setValidErr('URL must start with http:// or https://');
      return;
    }
    setValidErr('');
    setMyGateSaving(true);
    try {
      await dispatch(updateEvent({ id: eventId, data: { myGateLink } })).unwrap();
      setMyGateSaved(true);
      setTimeout(() => setMyGateSaved(false), 3000);
    } catch (err) {
      setMyGateError(String(err || 'Failed to save.'));
    } finally {
      setMyGateSaving(false);
    }
  }

  return (
    <>
      <SubTitle>Invite Card</SubTitle>
      {cardImageUrl && !showReplaceInput ? (
        <>
          <CardPreviewImg src={cardImageUrl} alt="Invite card preview" />
          <Button variant="secondary" size="sm" onClick={() => setShowReplaceInput(true)}>
            Replace Card
          </Button>
        </>
      ) : (
        <>
          <FileInput
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploadStatus === 'uploading'}
          />
          {uploadStatus === 'uploading' && <UploadStatus>Uploading...</UploadStatus>}
          {uploadStatus === 'done' && <UploadStatus $success>Uploaded</UploadStatus>}
          {uploadError && <Msg $error>{uploadError}</Msg>}
        </>
      )}

      <SubTitle style={{ marginTop: '1.25rem' }}>MyGate Link</SubTitle>
      {showWarning && (
        <WarningBanner>
          Event is in {daysUntilEvent} day{daysUntilEvent !== 1 ? 's' : ''} — add your MyGate link
          so guests can pre-approve
        </WarningBanner>
      )}
      <Row>
        <TextInput
          type="url"
          placeholder="https://mygate.com/society/..."
          value={myGateLink}
          onChange={(e) => {
            setMyGateLink(e.target.value);
            setValidErr('');
          }}
        />
        <Button size="sm" onClick={handleMyGateSave} disabled={myGateSaving}>
          {myGateSaving ? 'Saving...' : 'Save'}
        </Button>
      </Row>
      {validErr && <Msg $error>{validErr}</Msg>}
      {myGateSaved && <Msg>MyGate link saved.</Msg>}
      {myGateError && <Msg $error>{myGateError}</Msg>}
    </>
  );
}
