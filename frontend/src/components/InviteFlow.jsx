import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import dayjs from 'dayjs';
import apiClient from '../lib/apiClient';
import { updateEvent } from '../redux/slices/eventsSlice';
import { fetchGuests } from '../redux/slices/guestsSlice';

// ─── Styled components ────────────────────────────────────────────────────────

const FlowWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const SectionCard = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const SectionTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 1rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #f3f4f6;
`;

const SubTitle = styled.h4`
  font-size: 0.85rem;
  font-weight: 600;
  color: #5b21b6;
  margin-bottom: 0.6rem;
  margin-top: 1rem;

  &:first-child {
    margin-top: 0;
  }
`;

const CardPreviewImg = styled.img`
  max-width: 240px;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  display: block;
  margin-bottom: 0.75rem;
  object-fit: contain;
`;

const FileInput = styled.input`
  font-size: 0.85rem;
  color: #374151;
  margin-bottom: 0.5rem;
  display: block;
`;

const UploadStatus = styled.span`
  font-size: 0.82rem;
  color: ${({ $success }) => ($success ? '#065f46' : '#6b7280')};
  margin-left: 0.5rem;
`;

const Row = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
`;

const TextInput = styled.input`
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.4rem 0.7rem;
  font-size: 0.875rem;
  color: #111827;
  flex: 1 1 200px;
  min-width: 180px;

  &:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 2px #ede9fe;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #111827;
  resize: vertical;
  min-height: 120px;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 2px #ede9fe;
  }
`;

const ReadOnlyBox = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  margin-top: 0.6rem;
`;

const PlaceholderHints = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.5rem;
  margin-bottom: 0.75rem;
`;

const PlaceholderChip = styled.code`
  background: #f3f0ff;
  color: #5b21b6;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
`;

const PrimaryBtn = styled.button`
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.45rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  &:hover { background: #6d28d9; }
  &:disabled { background: #c4b5fd; cursor: not-allowed; }
`;

const SecondaryBtn = styled.button`
  background: #fff;
  color: #7c3aed;
  border: 1.5px solid #7c3aed;
  border-radius: 8px;
  padding: 0.45rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  &:hover { background: #f3f0ff; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const WarningBanner = styled.div`
  background: #fff7ed;
  border: 1px solid #fb923c;
  border-radius: 8px;
  padding: 0.65rem 1rem;
  font-size: 0.875rem;
  color: #9a3412;
  font-weight: 500;
  margin-bottom: 0.75rem;
`;

const ErrorMsg = styled.p`
  color: #b91c1c;
  font-size: 0.82rem;
  margin-top: 0.4rem;
`;

const SuccessMsg = styled.p`
  color: #065f46;
  font-size: 0.82rem;
  margin-top: 0.4rem;
`;

const ValidationError = styled.p`
  color: #b91c1c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

// ─── Send Queue Styled Components ────────────────────────────────────────────

const FilterRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  user-select: none;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  margin-bottom: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.5rem 0.75rem;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.55rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
  color: #111827;
`;

const RsvpBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 999px;
  background: ${({ rsvp }) =>
    rsvp === 'Confirmed' ? '#d1fae5' :
    rsvp === 'Declined'  ? '#fee2e2' : '#fef3c7'};
  color: ${({ rsvp }) =>
    rsvp === 'Confirmed' ? '#065f46' :
    rsvp === 'Declined'  ? '#991b1b' : '#92400e'};
`;

const SentBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 999px;
  background: ${({ $sent }) => ($sent ? '#d1fae5' : '#f3f4f6')};
  color: ${({ $sent }) => ($sent ? '#065f46' : '#6b7280')};
`;

const NoPhoneWarning = styled.span`
  font-size: 0.72rem;
  color: #b91c1c;
  font-style: italic;
`;

const ProgressNote = styled.p`
  font-size: 0.875rem;
  color: #5b21b6;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const CardNote = styled.div`
  background: #fef9c3;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  color: #78350f;
  margin-bottom: 0.75rem;
`;

const EmptyMsg = styled.p`
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 0.5rem 0;
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function InviteFlow({ eventId, event, onRefresh }) {
  const dispatch = useDispatch();
  const guests = useSelector((state) => state.guests.byEventId[eventId] || []);

  // ── Section A: Card upload ────────────────────────────────────────────────
  const [uploadStatus, setUploadStatus] = useState('');  // '' | 'uploading' | 'done' | 'error'
  const [uploadError, setUploadError] = useState('');
  const [showReplaceInput, setShowReplaceInput] = useState(false);

  // ── Section A: MyGate link ────────────────────────────────────────────────
  const [myGateLink, setMyGateLink] = useState(event.myGateLink || '');
  const [myGateSaving, setMyGateSaving] = useState(false);
  const [myGateSaved, setMyGateSaved] = useState(false);
  const [myGateError, setMyGateError] = useState('');
  const [myGateLinkValidErr, setMyGateLinkValidErr] = useState('');

  // ── Section B: Message template ───────────────────────────────────────────
  const [template, setTemplate] = useState(event.messageTemplate || '');
  const [templateLoaded, setTemplateLoaded] = useState(!!event.messageTemplate);
  const [previewMsg, setPreviewMsg] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);
  const [templateSaveError, setTemplateSaveError] = useState('');

  // ── Section C: Send queue ─────────────────────────────────────────────────
  const [onlyUnsent, setOnlyUnsent] = useState(true);
  const [includeResend, setIncludeResend] = useState(false);
  const [selected, setSelected] = useState({});
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState('');
  const [showCardNote, setShowCardNote] = useState(false);
  const [sendError, setSendError] = useState('');

  // Fetch guests on mount
  useEffect(() => {
    dispatch(fetchGuests(eventId));
  }, [eventId, dispatch]);

  // Fetch default template if event has none
  useEffect(() => {
    if (!event.messageTemplate && !templateLoaded) {
      apiClient.get('/whatsapp/default-template')
        .then((res) => {
          const t = res.data?.data?.template;
          if (t) {
            setTemplate(t);
            setTemplateLoaded(true);
          }
        })
        .catch(() => {});
    }
  }, [event.messageTemplate, templateLoaded]);

  // Sync myGateLink when event prop updates
  useEffect(() => {
    setMyGateLink(event.myGateLink || '');
  }, [event.myGateLink]);

  // ── Section A: Card upload ────────────────────────────────────────────────

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large (max 10MB).');
      return;
    }
    setUploadError('');
    setUploadStatus('uploading');
    try {
      const formData = new FormData();
      formData.append('card', file);
      await apiClient.post(`/events/${eventId}/invite-card`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus('done');
      setShowReplaceInput(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      setUploadStatus('error');
      setUploadError(err.response?.data?.error || 'Upload failed.');
    }
  }

  // ── Section A: MyGate link save ───────────────────────────────────────────

  function validateMyGateLink(val) {
    if (!val) return '';
    if (!val.startsWith('http://') && !val.startsWith('https://')) {
      return 'URL must start with http:// or https://';
    }
    return '';
  }

  async function handleMyGateSave() {
    const err = validateMyGateLink(myGateLink);
    if (err) { setMyGateLinkValidErr(err); return; }
    setMyGateLinkValidErr('');
    setMyGateSaving(true);
    setMyGateSaved(false);
    setMyGateError('');
    try {
      await dispatch(updateEvent({ id: eventId, data: { myGateLink } })).unwrap();
      setMyGateSaved(true);
      setTimeout(() => setMyGateSaved(false), 3000);
    } catch (err) {
      setMyGateError(err || 'Failed to save MyGate link.');
    } finally {
      setMyGateSaving(false);
    }
  }

  // 14-day warning: Active event, no myGateLink, date within 14 days
  const daysUntilEvent = event.date ? dayjs(event.date).diff(dayjs(), 'day') : null;
  const showMyGateWarning =
    event.status === 'Active' &&
    !event.myGateLink &&
    daysUntilEvent !== null &&
    daysUntilEvent >= 0 &&
    daysUntilEvent <= 14;

  // ── Section B: Preview ────────────────────────────────────────────────────

  async function handlePreview() {
    setPreviewLoading(true);
    setPreviewError('');
    setPreviewMsg('');
    try {
      const res = await apiClient.post('/whatsapp/preview', { eventId, template });
      setPreviewMsg(res.data?.data?.message || '');
    } catch (err) {
      setPreviewError(err.response?.data?.error || 'Preview failed.');
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleSaveTemplate() {
    setTemplateSaving(true);
    setTemplateSaved(false);
    setTemplateSaveError('');
    try {
      await dispatch(updateEvent({ id: eventId, data: { messageTemplate: template } })).unwrap();
      setTemplateSaved(true);
      setTimeout(() => setTemplateSaved(false), 3000);
    } catch (err) {
      setTemplateSaveError(err || 'Failed to save template.');
    } finally {
      setTemplateSaving(false);
    }
  }

  // ── Section C: Send queue ─────────────────────────────────────────────────

  // Determine which guests show in the table
  const visibleGuests = guests.filter((g) => {
    if (onlyUnsent && !includeResend && g.inviteSent) return false;
    return true;
  });

  function toggleSelect(guestId) {
    setSelected((prev) => ({ ...prev, [guestId]: !prev[guestId] }));
  }

  function toggleSelectAll() {
    const eligible = visibleGuests.filter((g) => g.phone);
    const allSelected = eligible.every((g) => selected[g.id]);
    if (allSelected) {
      const next = { ...selected };
      eligible.forEach((g) => { next[g.id] = false; });
      setSelected(next);
    } else {
      const next = { ...selected };
      eligible.forEach((g) => { next[g.id] = true; });
      setSelected(next);
    }
  }

  const selectedGuests = visibleGuests.filter((g) => g.phone && selected[g.id]);

  async function handleSend() {
    if (!selectedGuests.length) return;
    setSending(true);
    setSendError('');
    setShowCardNote(true);

    for (let i = 0; i < selectedGuests.length; i++) {
      const guest = selectedGuests[i];
      setSendProgress(`Sending ${i + 1} of ${selectedGuests.length}...`);
      try {
        const res = await apiClient.post('/whatsapp/link', { eventId, guestId: guest.id });
        const link = res.data?.data?.link;
        if (link) {
          window.open(link, '_blank', 'noopener,noreferrer');
        }
        // Re-fetch guests after each send so inviteSent badge updates
        await dispatch(fetchGuests(eventId));
      } catch (err) {
        setSendError(`Failed to send to ${guest.name}: ${err.response?.data?.error || err.message}`);
      }
    }

    setSendProgress('');
    setSending(false);
    // Clear selection after sending
    setSelected({});
  }

  // ── Card image URL ─────────────────────────────────────────────────────────
  const cardImageUrl = event.cardPath
    ? `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001${event.cardPath}`
    : null;

  return (
    <FlowWrapper>
      {/* ── Section A: Card & MyGate ─────────────────────────────────────── */}
      <SectionCard>
        <SectionTitle>A. Invite Card & MyGate Link</SectionTitle>

        {/* Invite card */}
        <SubTitle>Invite Card</SubTitle>
        {cardImageUrl && !showReplaceInput ? (
          <>
            <CardPreviewImg src={cardImageUrl} alt="Invite card preview" />
            <SecondaryBtn onClick={() => setShowReplaceInput(true)}>
              Replace Card
            </SecondaryBtn>
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
            {uploadError && <ErrorMsg>{uploadError}</ErrorMsg>}
          </>
        )}

        {/* MyGate link */}
        <SubTitle style={{ marginTop: '1.25rem' }}>MyGate Link</SubTitle>
        {showMyGateWarning && (
          <WarningBanner>
            Event is in {daysUntilEvent} day{daysUntilEvent !== 1 ? 's' : ''} — add your MyGate link so guests can pre-approve
          </WarningBanner>
        )}
        <Row>
          <TextInput
            type="url"
            placeholder="https://mygate.com/society/..."
            value={myGateLink}
            onChange={(e) => {
              setMyGateLink(e.target.value);
              setMyGateLinkValidErr('');
            }}
          />
          <PrimaryBtn onClick={handleMyGateSave} disabled={myGateSaving}>
            {myGateSaving ? 'Saving...' : 'Save'}
          </PrimaryBtn>
        </Row>
        {myGateLinkValidErr && <ValidationError>{myGateLinkValidErr}</ValidationError>}
        {myGateSaved && <SuccessMsg>MyGate link saved.</SuccessMsg>}
        {myGateError && <ErrorMsg>{myGateError}</ErrorMsg>}
      </SectionCard>

      {/* ── Section B: Message Template ──────────────────────────────────── */}
      <SectionCard>
        <SectionTitle>B. Message Template</SectionTitle>
        <Textarea
          value={template}
          onChange={(e) => {
            setTemplate(e.target.value);
            setTemplateSaved(false);
          }}
          placeholder="Type your WhatsApp message template here..."
        />
        <PlaceholderHints>
          <PlaceholderChip>{'{guestName}'}</PlaceholderChip>
          <PlaceholderChip>{'{childName}'}</PlaceholderChip>
          <PlaceholderChip>{'{date}'}</PlaceholderChip>
          <PlaceholderChip>{'{venue}'}</PlaceholderChip>
          <PlaceholderChip>{'{myGateLink}'}</PlaceholderChip>
        </PlaceholderHints>
        <Row>
          <SecondaryBtn onClick={handlePreview} disabled={previewLoading || !template.trim()}>
            {previewLoading ? 'Previewing...' : 'Preview'}
          </SecondaryBtn>
          <PrimaryBtn onClick={handleSaveTemplate} disabled={templateSaving || !template.trim()}>
            {templateSaving ? 'Saving...' : 'Save Template'}
          </PrimaryBtn>
        </Row>
        {templateSaved && <SuccessMsg>Template saved.</SuccessMsg>}
        {templateSaveError && <ErrorMsg>{templateSaveError}</ErrorMsg>}
        {previewError && <ErrorMsg>{previewError}</ErrorMsg>}
        {previewMsg && (
          <>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.75rem', marginBottom: '0.25rem' }}>
              Preview (sample):
            </p>
            <ReadOnlyBox>{previewMsg}</ReadOnlyBox>
          </>
        )}
      </SectionCard>

      {/* ── Section C: Send Queue ─────────────────────────────────────────── */}
      <SectionCard>
        <SectionTitle>C. Send Queue</SectionTitle>

        {showCardNote && (
          <CardNote>
            Save the card image to your phone before opening WhatsApp — wa.me cannot attach images automatically.
          </CardNote>
        )}

        <FilterRow>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={onlyUnsent}
              onChange={(e) => setOnlyUnsent(e.target.checked)}
            />
            Only unsent
          </CheckboxLabel>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={includeResend}
              onChange={(e) => setIncludeResend(e.target.checked)}
            />
            Include Re-send
          </CheckboxLabel>
        </FilterRow>

        {visibleGuests.length === 0 ? (
          <EmptyMsg>
            {guests.length === 0
              ? 'No guests found for this event.'
              : 'All guests have already been sent an invite. Enable "Include Re-send" to show them.'}
          </EmptyMsg>
        ) : (
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>
                    <input
                      type="checkbox"
                      title="Select all eligible"
                      onChange={toggleSelectAll}
                      checked={
                        visibleGuests.filter((g) => g.phone).length > 0 &&
                        visibleGuests.filter((g) => g.phone).every((g) => selected[g.id])
                      }
                    />
                  </Th>
                  <Th>Name</Th>
                  <Th>Phone</Th>
                  <Th>RSVP</Th>
                  <Th>Invite</Th>
                </tr>
              </thead>
              <tbody>
                {visibleGuests.map((guest) => {
                  const hasPhone = !!guest.phone;
                  return (
                    <tr key={guest.id} style={{ opacity: hasPhone ? 1 : 0.5 }}>
                      <Td>
                        <input
                          type="checkbox"
                          disabled={!hasPhone}
                          checked={!!selected[guest.id]}
                          onChange={() => toggleSelect(guest.id)}
                        />
                      </Td>
                      <Td>{guest.name}</Td>
                      <Td>
                        {hasPhone
                          ? guest.phone
                          : <NoPhoneWarning>No phone</NoPhoneWarning>}
                      </Td>
                      <Td>
                        <RsvpBadge rsvp={guest.rsvp || 'Pending'}>
                          {guest.rsvp || 'Pending'}
                        </RsvpBadge>
                      </Td>
                      <Td>
                        <SentBadge $sent={guest.inviteSent}>
                          {guest.inviteSent ? 'Sent' : 'Not sent'}
                        </SentBadge>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrapper>
        )}

        {sendProgress && <ProgressNote>{sendProgress}</ProgressNote>}
        {sendError && <ErrorMsg>{sendError}</ErrorMsg>}

        <Row>
          <PrimaryBtn
            onClick={handleSend}
            disabled={sending || selectedGuests.length === 0}
          >
            {sending ? sendProgress || 'Sending...' : `Send Selected (${selectedGuests.length})`}
          </PrimaryBtn>
        </Row>
      </SectionCard>
    </FlowWrapper>
  );
}
