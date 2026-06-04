import { useEffect, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import styled from 'styled-components';
import type { Gift, GiftStatus } from '../types';
import {
  fetchGifts,
  createGift,
  updateGift,
  deleteGift,
} from '../redux/slices/giftsSlice';

interface GiftTrackerProps {
  eventId: number;
}

// ─── Styled components ────────────────────────────────────────────────────────

const Wrapper = styled.div`
  padding: 0.25rem 0;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
`;

const TabBtn = styled.button<{ $active: boolean }>`
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  border: 1.5px solid ${({ $active }) => ($active ? '#7c3aed' : '#e5e7eb')};
  background: ${({ $active }) => ($active ? '#7c3aed' : '#fff')};
  color: ${({ $active }) => ($active ? '#fff' : '#6b7280')};

  &:hover {
    border-color: #7c3aed;
    color: ${({ $active }) => ($active ? '#fff' : '#7c3aed')};
  }
`;

const GiftGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const GiftCard = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const GiftName = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const GiftDesc = styled.p`
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
`;

const GiftMeta = styled.span`
  font-size: 0.78rem;
  color: #9ca3af;
`;

const StatusBadge = styled.span<{ status: GiftStatus }>`
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 999px;
  text-transform: capitalize;

  background: ${({ status }) =>
    status === 'received' ? '#d1fae5' :
    status === 'bought'   ? '#dbeafe' : '#fef3c7'};

  color: ${({ status }) =>
    status === 'received' ? '#065f46' :
    status === 'bought'   ? '#1e40af' : '#92400e'};
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.4rem;
  flex-wrap: wrap;
`;

const ActionBtn = styled.button`
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;

  &:hover { background: #6d28d9; }
`;

const DeleteBtn = styled.button`
  background: none;
  border: 1px solid #fca5a5;
  color: #ef4444;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 0.75rem;
  cursor: pointer;
  margin-left: auto;

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

// ─── Status transitions ───────────────────────────────────────────────────────

const STATUS_NEXT: Partial<Record<GiftStatus, GiftStatus>> = { idea: 'bought', bought: 'received' };
const STATUS_LABEL: Partial<Record<GiftStatus, string>> = { idea: 'Mark Bought', bought: 'Mark Received' };

// ─── Component ────────────────────────────────────────────────────────────────

type GiftFilter = 'all' | GiftStatus;
const FILTER_TABS: GiftFilter[] = ['all', 'idea', 'bought', 'received'];

export default function GiftTracker({ eventId }: GiftTrackerProps) {
  const dispatch = useAppDispatch();
  const gifts = useAppSelector((state) => state.gifts.byEventId[eventId] || []);
  const giftError = useAppSelector((state) => state.gifts.error);

  const [filter, setFilter] = useState<GiftFilter>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', notes: '' });
  const [formError, setFormError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (eventId) dispatch(fetchGifts(eventId));
  }, [eventId, dispatch]);

  const visible = filter === 'all' ? gifts : gifts.filter((g) => g.status === filter);

  async function handleStatusAdvance(gift: Gift) {
    const next = STATUS_NEXT[gift.status];
    if (!next) return;
    dispatch(updateGift({ eventId, id: gift.id, data: { status: next } }));
  }

  async function handleDelete(giftId: number) {
    if (!window.confirm('Delete this gift?')) return;
    dispatch(deleteGift({ eventId, id: giftId }));
  }

  async function handleAddGift(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Name is required.'); return; }
    setFormError('');
    setAdding(true);
    try {
      await dispatch(createGift({
        eventId,
        data: {
          ...form,
          price: form.price ? Number(form.price) : undefined,
          status: 'idea',
        },
      })).unwrap();
      setForm({ name: '', description: '', price: '', notes: '' });
      setAddOpen(false);
    } catch (err) {
      setFormError(String(err || 'Failed to add gift.'));
    } finally {
      setAdding(false);
    }
  }

  return (
    <Wrapper>
      {/* Filter tabs */}
      <FilterTabs>
        {FILTER_TABS.map((tab) => (
          <TabBtn
            key={tab}
            $active={filter === tab}
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab !== 'all' && ` (${gifts.filter((g) => g.status === tab).length})`}
            {tab === 'all' && ` (${gifts.length})`}
          </TabBtn>
        ))}
      </FilterTabs>

      {/* Add button */}
      <FormRow style={{ marginBottom: '1rem' }}>
        <PrimaryBtn onClick={() => setAddOpen((v) => !v)}>
          {addOpen ? 'Cancel' : '+ Add Gift'}
        </PrimaryBtn>
      </FormRow>

      {/* Add gift form */}
      {addOpen && (
        <FormSection>
          <FormTitle>Add Gift Idea</FormTitle>
          <form onSubmit={handleAddGift}>
            <FormRow>
              <FormInput
                placeholder="Gift name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <FormInput
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <FormInput
                type="number"
                placeholder="Price &#x20B9;"
                value={form.price}
                min="0"
                step="1"
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <FormInput
                placeholder="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
              <PrimaryBtn type="submit" disabled={adding}>
                {adding ? 'Adding...' : 'Add'}
              </PrimaryBtn>
            </FormRow>
            {formError && <ErrorMsg>{formError}</ErrorMsg>}
          </form>
        </FormSection>
      )}

      {/* Gift cards */}
      {visible.length === 0 ? (
        <EmptyMsg>
          {filter === 'all'
            ? 'No gifts tracked yet. Add your first gift idea above.'
            : `No gifts with status "${filter}".`}
        </EmptyMsg>
      ) : (
        <GiftGrid>
          {visible.map((gift) => (
            <GiftCard key={gift.id}>
              <GiftName>{gift.name}</GiftName>
              {gift.description && <GiftDesc>{gift.description}</GiftDesc>}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <StatusBadge status={gift.status || 'idea'}>{gift.status || 'idea'}</StatusBadge>
                {gift.price && (
                  <GiftMeta>&#x20B9;{Number(gift.price).toLocaleString()}</GiftMeta>
                )}
              </div>
              {gift.givenBy && (
                <GiftMeta>Given by: {gift.givenBy}</GiftMeta>
              )}
              {gift.notes && <GiftMeta>{gift.notes}</GiftMeta>}
              <CardActions>
                {STATUS_NEXT[gift.status || 'idea'] && (
                  <ActionBtn onClick={() => handleStatusAdvance(gift)}>
                    {STATUS_LABEL[gift.status || 'idea']}
                  </ActionBtn>
                )}
                <DeleteBtn onClick={() => handleDelete(gift.id)}>Remove</DeleteBtn>
              </CardActions>
            </GiftCard>
          ))}
        </GiftGrid>
      )}

      {giftError && <ErrorMsg>{giftError}</ErrorMsg>}
    </Wrapper>
  );
}
