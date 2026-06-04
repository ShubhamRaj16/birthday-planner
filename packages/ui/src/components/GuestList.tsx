import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import styled from 'styled-components';
import type { Guest, RsvpStatus } from '../types';
import { toCsv, downloadCsv, fileSlug } from '../lib/csv';
import {
  fetchGuests,
  createGuest,
  updateGuest,
  deleteGuest,
  bulkImportGuests,
} from '../redux/slices/guestsSlice';
import { Button, Chip, Table, Th } from './ui';
import { colors, spacing } from '../design/tokens';
import GuestRow from './GuestList/GuestRow';
import GuestForm from './GuestList/GuestForm';
import CsvImport from './GuestList/CsvImport';

interface GuestListProps {
  eventId: number;
  eventTheme?: string | null;
}

const RSVP_CYCLE: Record<RsvpStatus, RsvpStatus> = {
  Pending: 'Confirmed',
  Confirmed: 'Declined',
  Declined: 'Pending',
};

const SummaryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.md};
  margin-bottom: 1.25rem;
`;
const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.lg};
`;
const TableWrapper = styled.div`
  overflow-x: auto;
  margin-bottom: 1.5rem;
`;
const Msg = styled.p<{ $error?: boolean }>`
  color: ${({ $error }) => ($error ? colors.error : colors.success)};
  font-size: 0.82rem;
  margin-top: 0.4rem;
`;
const EmptyMsg = styled.p`
  color: ${colors.textDisabled};
  font-size: 0.875rem;
  padding: ${spacing.md} 0;
`;

export default function GuestList({ eventId, eventTheme }: GuestListProps) {
  const dispatch = useAppDispatch();
  const guests = useAppSelector((s) => s.guests.byEventId[eventId] || []);
  const guestError = useAppSelector((s) => s.guests.error);

  const [addOpen, setAddOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);

  useEffect(() => {
    if (eventId) dispatch(fetchGuests(eventId));
  }, [eventId, dispatch]);

  const total = guests.length;
  const confirmed = guests.filter((g) => g.rsvp === 'Confirmed').length;
  const pending = guests.filter((g) => g.rsvp === 'Pending' || !g.rsvp).length;
  const declined = guests.filter((g) => g.rsvp === 'Declined').length;

  async function handleAddGuest(data: { name: string; phone: string; ageGroup: string; dietary: string }) {
    await dispatch(createGuest({ eventId, data })).unwrap();
    setAddOpen(false);
  }

  async function handleImport(rows: { name: string; phone: string }[]) {
    await dispatch(bulkImportGuests({ eventId, guests: rows })).unwrap();
    dispatch(fetchGuests(eventId));
    setCsvOpen(false);
  }

  function exportGuests() {
    const csv = toCsv<Guest>(
      [
        { key: 'name', label: 'Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'ageGroup', label: 'Age Group' },
        { key: 'dietary', label: 'Dietary' },
        { key: 'rsvp', label: 'RSVP' },
        { key: 'inviteSent', label: 'Invite Sent' },
      ],
      guests
    );
    downloadCsv(`guests-${fileSlug(eventTheme)}-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <div style={{ padding: '0.25rem 0' }}>
      <SummaryRow>
        <Chip>Total {total}</Chip>
        <Chip style={{ background: colors.successBg, color: colors.success }}>
          Confirmed {confirmed}
        </Chip>
        <Chip style={{ background: colors.warningBg, color: colors.warning }}>
          Pending {pending}
        </Chip>
        <Chip style={{ background: colors.errorBg, color: '#991b1b' }}>Declined {declined}</Chip>
      </SummaryRow>
      <ActionRow>
        <Button
          size="sm"
          variant={addOpen ? 'secondary' : 'primary'}
          onClick={() => {
            setAddOpen((v) => !v);
            setCsvOpen(false);
          }}
        >
          {addOpen ? 'Cancel' : '+ Add Guest'}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setCsvOpen((v) => !v);
            setAddOpen(false);
          }}
        >
          {csvOpen ? 'Cancel' : 'CSV Import'}
        </Button>
        <Button size="sm" variant="secondary" onClick={exportGuests} disabled={guests.length === 0}>
          Export CSV
        </Button>
      </ActionRow>

      {addOpen && (
        <GuestForm
          onSubmit={handleAddGuest}
          onCancel={() => setAddOpen(false)}
        />
      )}

      {csvOpen && <CsvImport onImport={handleImport} onCancel={() => setCsvOpen(false)} />}

      {guests.length === 0 ? (
        <EmptyMsg>No guests yet. Add your first guest above.</EmptyMsg>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Phone</Th>
                <Th>Age Group</Th>
                <Th>RSVP</Th>
                <Th>Invite Sent</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <GuestRow
                  key={guest.id}
                  guest={guest}
                  onRsvpToggle={(g) =>
                    dispatch(
                      updateGuest({
                        eventId,
                        id: g.id,
                        data: { rsvp: RSVP_CYCLE[g.rsvp || 'Pending'] },
                      })
                    )
                  }
                  onInviteToggle={(g) =>
                    dispatch(
                      updateGuest({ eventId, id: g.id, data: { inviteSent: !g.inviteSent } })
                    )
                  }
                  onDelete={(id) => {
                    if (window.confirm('Remove this guest?'))
                      dispatch(deleteGuest({ eventId, id }));
                  }}
                />
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
      {guestError && <Msg $error>{guestError}</Msg>}
    </div>
  );
}
