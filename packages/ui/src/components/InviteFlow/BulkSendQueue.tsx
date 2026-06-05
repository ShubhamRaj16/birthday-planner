import { useState } from 'react';
import styled from 'styled-components';
import type { AppDispatch } from '../../redux/store';
import { fetchGuests } from '../../redux/slices/guestsSlice';
import { whatsappApi } from '../../api/whatsapp.api';
import { getApiError } from '../../lib/apiError';
import { Button, Table, Th, Td, Tr } from '../ui';
import { colors, spacing, radius, fontSize } from '../../design/tokens';
import type { Guest, RsvpStatus } from '../../types';

interface Props {
  eventId: number;
  guests: Guest[];
  dispatch: AppDispatch;
}

const FilterRow = styled.div`
  display: flex;
  gap: ${spacing.md};
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: ${spacing.md};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: ${fontSize.sm};
  color: ${colors.textMuted};
  cursor: pointer;
  user-select: none;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  margin-bottom: ${spacing.lg};
`;

const RsvpBadge = styled.span<{ rsvp: RsvpStatus }>`
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: ${radius.full};
  background: ${({ rsvp }) =>
    rsvp === 'Confirmed'
      ? colors.successBg
      : rsvp === 'Declined'
        ? colors.errorBg
        : colors.warningBg};
  color: ${({ rsvp }) =>
    rsvp === 'Confirmed' ? colors.success : rsvp === 'Declined' ? '#991b1b' : colors.warning};
`;

const SentBadge = styled.span<{ $sent: boolean }>`
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: ${radius.full};
  background: ${({ $sent }) => ($sent ? colors.successBg : colors.bgLight)};
  color: ${({ $sent }) => ($sent ? colors.success : colors.textSubtle)};
`;

const NoPhoneWarning = styled.span`
  font-size: 0.72rem;
  color: ${colors.error};
  font-style: italic;
`;
const ProgressNote = styled.p`
  font-size: ${fontSize.sm};
  color: #5b21b6;
  font-weight: 500;
  margin-bottom: ${spacing.sm};
`;
const CardNote = styled.div`
  background: #fef9c3;
  border: 1px solid #fbbf24;
  border-radius: ${radius.sm};
  padding: ${spacing.sm} ${spacing.md};
  font-size: 0.8rem;
  color: #78350f;
  margin-bottom: ${spacing.md};
`;
const EmptyMsg = styled.p`
  color: ${colors.textDisabled};
  font-size: ${fontSize.sm};
  padding: ${spacing.sm} 0;
`;
const Msg = styled.p<{ $error?: boolean }>`
  color: ${({ $error }) => ($error ? colors.error : colors.success)};
  font-size: 0.82rem;
  margin-top: 0.25rem;
`;

export default function BulkSendQueue({ eventId, guests, dispatch }: Props) {
  const [onlyUnsent, setOnlyUnsent] = useState(true);
  const [includeResend, setIncludeResend] = useState(false);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState('');
  const [showCardNote, setShowCardNote] = useState(false);
  const [sendError, setSendError] = useState('');

  const visibleGuests = guests.filter((g) => !(onlyUnsent && !includeResend && g.inviteSent));
  const selectedGuests = visibleGuests.filter((g) => g.phone && selected[g.id]);

  function toggleSelect(id: number) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleSelectAll() {
    const eligible = visibleGuests.filter((g) => g.phone);
    const allSelected = eligible.every((g) => selected[g.id]);
    const next = { ...selected };
    eligible.forEach((g) => {
      next[g.id] = !allSelected;
    });
    setSelected(next);
  }

  async function handleSend() {
    if (!selectedGuests.length) return;
    setSending(true);
    setSendError('');
    setShowCardNote(true);
    for (let i = 0; i < selectedGuests.length; i++) {
      const guest = selectedGuests[i];
      setSendProgress(`Sending ${i + 1} of ${selectedGuests.length}...`);
      try {
        const link = await whatsappApi.buildLink(eventId, guest.id);
        if (link) window.open(link, '_blank', 'noopener,noreferrer');
        await dispatch(fetchGuests(eventId));
      } catch (err) {
        setSendError(`Failed to send to ${guest.name}: ${getApiError(err)}`);
      }
    }
    setSendProgress('');
    setSending(false);
    setSelected({});
  }

  return (
    <>
      {showCardNote && (
        <CardNote>
          Save the card image to your phone before opening WhatsApp — wa.me cannot attach images
          automatically.
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
            : 'All guests sent. Enable "Include Re-send" to show them.'}
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
              {visibleGuests.map((guest) => (
                <Tr key={guest.id} style={{ opacity: guest.phone ? 1 : 0.5 }}>
                  <Td>
                    <input
                      type="checkbox"
                      disabled={!guest.phone}
                      checked={!!selected[guest.id]}
                      onChange={() => toggleSelect(guest.id)}
                    />
                  </Td>
                  <Td>{guest.name}</Td>
                  <Td>{guest.phone ? guest.phone : <NoPhoneWarning>No phone</NoPhoneWarning>}</Td>
                  <Td>
                    <RsvpBadge rsvp={guest.rsvp || 'Pending'}>{guest.rsvp || 'Pending'}</RsvpBadge>
                  </Td>
                  <Td>
                    <SentBadge $sent={guest.inviteSent}>
                      {guest.inviteSent ? 'Sent' : 'Not sent'}
                    </SentBadge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {sendProgress && <ProgressNote>{sendProgress}</ProgressNote>}
      {sendError && <Msg $error>{sendError}</Msg>}
      <Button
        onClick={handleSend}
        disabled={sending || selectedGuests.length === 0}
        style={{ marginTop: spacing.sm }}
      >
        {sending ? sendProgress || 'Sending...' : `Send Selected (${selectedGuests.length})`}
      </Button>
    </>
  );
}
