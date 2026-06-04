import styled from 'styled-components';
import { Td, Tr } from '../ui';
import { colors, radius } from '../../design/tokens';
import type { Guest, RsvpStatus } from '../../types';

interface Props {
  guest: Guest;
  onRsvpToggle: (guest: Guest) => void;
  onInviteToggle: (guest: Guest) => void;
  onDelete: (id: number) => void;
}

const RsvpBtn = styled.button<{ rsvp: RsvpStatus }>`
  border: none;
  border-radius: ${radius.full};
  padding: 3px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  background: ${({ rsvp }) =>
    rsvp === 'Confirmed'
      ? colors.successBg
      : rsvp === 'Declined'
        ? colors.errorBg
        : colors.warningBg};
  color: ${({ rsvp }) =>
    rsvp === 'Confirmed' ? colors.success : rsvp === 'Declined' ? '#991b1b' : colors.warning};
  &:hover {
    opacity: 0.8;
  }
`;

const ToggleBtn = styled.button<{ $active: boolean }>`
  background: none;
  border: 1px solid ${({ $active }) => ($active ? colors.primary : colors.border)};
  color: ${({ $active }) => ($active ? colors.primary : colors.textDisabled)};
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: ${({ $active }) => ($active ? colors.primaryLighter : colors.bgLightest)};
  }
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 2px 6px;
  border-radius: 4px;
  &:hover {
    background: ${colors.errorBg};
  }
`;

export default function GuestRow({ guest, onRsvpToggle, onInviteToggle, onDelete }: Props) {
  return (
    <Tr>
      <Td>{guest.name}</Td>
      <Td>{guest.phone || '—'}</Td>
      <Td style={{ textTransform: 'capitalize' }}>{guest.ageGroup || 'adult'}</Td>
      <Td>
        <RsvpBtn
          rsvp={guest.rsvp || 'Pending'}
          onClick={() => onRsvpToggle(guest)}
          title="Click to cycle RSVP"
        >
          {guest.rsvp || 'Pending'}
        </RsvpBtn>
      </Td>
      <Td>
        <ToggleBtn $active={!!guest.inviteSent} onClick={() => onInviteToggle(guest)}>
          {guest.inviteSent ? 'Sent' : 'Not sent'}
        </ToggleBtn>
      </Td>
      <Td>
        <DeleteBtn onClick={() => onDelete(guest.id)} title="Remove guest">
          &#10005;
        </DeleteBtn>
      </Td>
    </Tr>
  );
}
