import { useEffect, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import styled from 'styled-components';
import type { Guest, RsvpStatus } from '../types';
import {
  fetchGuests,
  createGuest,
  updateGuest,
  deleteGuest,
  bulkImportGuests,
} from '../redux/slices/guestsSlice';

interface GuestListProps {
  eventId: number;
}

// ─── Styled components ────────────────────────────────────────────────────────

const Wrapper = styled.div`
  padding: 0.25rem 0;
`;

const SummaryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

const SummaryChip = styled.span`
  background: #f3f0ff;
  color: #5b21b6;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 999px;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  margin-bottom: 1.5rem;
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
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
  color: #111827;
`;

const RsvpBadge = styled.button<{ rsvp: RsvpStatus }>`
  border: none;
  border-radius: 999px;
  padding: 3px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;

  background: ${({ rsvp }) =>
    rsvp === 'Confirmed' ? '#d1fae5' :
    rsvp === 'Declined'  ? '#fee2e2' : '#fef3c7'};

  color: ${({ rsvp }) =>
    rsvp === 'Confirmed' ? '#065f46' :
    rsvp === 'Declined'  ? '#991b1b' : '#92400e'};

  &:hover { opacity: 0.8; }
`;

const ToggleBtn = styled.button<{ $active: boolean }>`
  background: none;
  border: 1px solid ${({ $active }) => ($active ? '#7c3aed' : '#d1d5db')};
  color: ${({ $active }) => ($active ? '#7c3aed' : '#9ca3af')};
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: ${({ $active }) => ($active ? '#f3f0ff' : '#f9fafb')};
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

  &:hover { background: #fee2e2; }
`;

const FormSection = styled.div`
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
`;

const FormTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #5b21b6;
  margin-bottom: 0.75rem;
`;

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: flex-end;
  margin-bottom: 0.5rem;
`;

const FormInput = styled.input`
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font-size: 0.875rem;
  color: #111827;
  flex: 1 1 140px;
  min-width: 100px;

  &:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 2px #ede9fe;
  }
`;

const FormSelect = styled.select`
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font-size: 0.875rem;
  color: #111827;
  flex: 1 1 120px;
  min-width: 90px;
  background: #fff;

  &:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 2px #ede9fe;
  }
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
`;

const CsvTextarea = styled.textarea`
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  font-family: monospace;
  color: #111827;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 2px #ede9fe;
  }
`;

const ErrorMsg = styled.p`
  color: #b91c1c;
  font-size: 0.82rem;
  margin-top: 0.4rem;
`;

const EmptyMsg = styled.p`
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 0.75rem 0;
`;

// ─── RSVP cycle ───────────────────────────────────────────────────────────────

const RSVP_CYCLE: Record<RsvpStatus, RsvpStatus> = { Pending: 'Confirmed', Confirmed: 'Declined', Declined: 'Pending' };

// ─── Component ────────────────────────────────────────────────────────────────

export default function GuestList({ eventId }: GuestListProps) {
  const dispatch = useAppDispatch();
  const guests = useAppSelector((state) => state.guests.byEventId[eventId] || []);
  const guestError = useAppSelector((state) => state.guests.error);

  // Add-guest form state
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', ageGroup: 'adult', dietary: '' });
  const [formError, setFormError] = useState('');
  const [adding, setAdding] = useState(false);

  // CSV import state
  const [csvOpen, setCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvError, setCsvError] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (eventId) dispatch(fetchGuests(eventId));
  }, [eventId, dispatch]);

  // Summary counts
  const total = guests.length;
  const confirmed = guests.filter((g) => g.rsvp === 'Confirmed').length;
  const pending = guests.filter((g) => g.rsvp === 'Pending' || !g.rsvp).length;
  const declined = guests.filter((g) => g.rsvp === 'Declined').length;

  async function handleRsvpToggle(guest: Guest) {
    const currentRsvp = guest.rsvp || 'Pending';
    const nextRsvp = RSVP_CYCLE[currentRsvp] || 'Confirmed';
    dispatch(updateGuest({ eventId, id: guest.id, data: { rsvp: nextRsvp } }));
  }

  async function handleInviteToggle(guest: Guest) {
    dispatch(updateGuest({ eventId, id: guest.id, data: { inviteSent: !guest.inviteSent } }));
  }

  async function handleDelete(guestId: number) {
    if (!window.confirm('Remove this guest?')) return;
    dispatch(deleteGuest({ eventId, id: guestId }));
  }

  async function handleAddGuest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Name is required.'); return; }
    setFormError('');
    setAdding(true);
    try {
      await dispatch(createGuest({ eventId, data: form })).unwrap();
      setForm({ name: '', phone: '', ageGroup: 'adult', dietary: '' });
      setAddOpen(false);
    } catch (err) {
      setFormError(String(err || 'Failed to add guest.'));
    } finally {
      setAdding(false);
    }
  }

  async function handleCsvImport(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCsvError('');
    const lines = csvText.trim().split('\n').filter(Boolean);
    if (!lines.length) { setCsvError('Paste at least one row.'); return; }
    const parsed = lines.map((line) => {
      const parts = line.split(',').map((s) => s.trim());
      return { name: parts[0] || '', phone: parts[1] || '' };
    }).filter((g) => g.name);
    if (!parsed.length) { setCsvError('No valid rows found. Format: name,phone'); return; }
    setImporting(true);
    try {
      await dispatch(bulkImportGuests({ eventId, guests: parsed })).unwrap();
      dispatch(fetchGuests(eventId));
      setCsvText('');
      setCsvOpen(false);
    } catch (err) {
      setCsvError(String(err || 'Bulk import failed.'));
    } finally {
      setImporting(false);
    }
  }

  return (
    <Wrapper>
      {/* Summary row */}
      <SummaryRow>
        <SummaryChip>Total {total}</SummaryChip>
        <SummaryChip style={{ background: '#d1fae5', color: '#065f46' }}>Confirmed {confirmed}</SummaryChip>
        <SummaryChip style={{ background: '#fef3c7', color: '#92400e' }}>Pending {pending}</SummaryChip>
        <SummaryChip style={{ background: '#fee2e2', color: '#991b1b' }}>Declined {declined}</SummaryChip>
      </SummaryRow>

      {/* Action buttons */}
      <FormRow style={{ marginBottom: '1rem' }}>
        <PrimaryBtn onClick={() => { setAddOpen((v) => !v); setCsvOpen(false); }}>
          {addOpen ? 'Cancel' : '+ Add Guest'}
        </PrimaryBtn>
        <SecondaryBtn onClick={() => { setCsvOpen((v) => !v); setAddOpen(false); }}>
          {csvOpen ? 'Cancel' : 'CSV Import'}
        </SecondaryBtn>
      </FormRow>

      {/* Add guest form */}
      {addOpen && (
        <FormSection>
          <FormTitle>Add Guest</FormTitle>
          <form onSubmit={handleAddGuest}>
            <FormRow>
              <FormInput
                placeholder="Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <FormInput
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <FormSelect
                value={form.ageGroup}
                onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
              >
                <option value="adult">Adult</option>
                <option value="child">Child</option>
              </FormSelect>
              <FormInput
                placeholder="Dietary"
                value={form.dietary}
                onChange={(e) => setForm({ ...form, dietary: e.target.value })}
              />
              <PrimaryBtn type="submit" disabled={adding}>
                {adding ? 'Adding...' : 'Add'}
              </PrimaryBtn>
            </FormRow>
            {formError && <ErrorMsg>{formError}</ErrorMsg>}
          </form>
        </FormSection>
      )}

      {/* CSV import */}
      {csvOpen && (
        <FormSection>
          <FormTitle>CSV Bulk Import</FormTitle>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            One guest per line: <code>name,phone</code>
          </p>
          <form onSubmit={handleCsvImport}>
            <CsvTextarea
              placeholder="Alice,9999000001&#10;Bob,9999000002"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
            />
            <FormRow style={{ marginTop: '0.5rem' }}>
              <PrimaryBtn type="submit" disabled={importing}>
                {importing ? 'Importing...' : 'Import'}
              </PrimaryBtn>
            </FormRow>
            {csvError && <ErrorMsg>{csvError}</ErrorMsg>}
          </form>
        </FormSection>
      )}

      {/* Guest table */}
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
                <tr key={guest.id}>
                  <Td>{guest.name}</Td>
                  <Td>{guest.phone || '—'}</Td>
                  <Td style={{ textTransform: 'capitalize' }}>{guest.ageGroup || 'adult'}</Td>
                  <Td>
                    <RsvpBadge
                      rsvp={guest.rsvp || 'Pending'}
                      onClick={() => handleRsvpToggle(guest)}
                      title="Click to cycle RSVP status"
                    >
                      {guest.rsvp || 'Pending'}
                    </RsvpBadge>
                  </Td>
                  <Td>
                    <ToggleBtn
                      $active={!!guest.inviteSent}
                      onClick={() => handleInviteToggle(guest)}
                    >
                      {guest.inviteSent ? 'Sent' : 'Not sent'}
                    </ToggleBtn>
                  </Td>
                  <Td>
                    <DeleteBtn onClick={() => handleDelete(guest.id)} title="Remove guest">
                      &#10005;
                    </DeleteBtn>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {guestError && <ErrorMsg>{guestError}</ErrorMsg>}
    </Wrapper>
  );
}
