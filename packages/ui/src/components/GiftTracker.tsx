import { useEffect, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import styled from 'styled-components';
import type { GiftStatus } from '../types';
import { fetchGifts, createGift, updateGift, deleteGift } from '../redux/slices/giftsSlice';
import { Button, FormSection } from './ui';
import { colors, spacing, radius } from '../design/tokens';
import GiftCard from './GiftTracker/GiftCard';

interface Props {
  eventId: number;
}

type GiftFilter = 'all' | GiftStatus;
const FILTER_TABS: GiftFilter[] = ['all', 'idea', 'bought', 'received'];
const STATUS_NEXT: Partial<Record<GiftStatus, GiftStatus>> = { idea: 'bought', bought: 'received' };

const FilterTabs = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
`;
const TabBtn = styled.button<{ $active: boolean }>`
  padding: 0.35rem 0.9rem;
  border-radius: ${radius.full};
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  border: 1.5px solid ${({ $active }) => ($active ? colors.primary : colors.borderLight)};
  background: ${({ $active }) => ($active ? colors.primary : colors.white)};
  color: ${({ $active }) => ($active ? colors.white : colors.textSubtle)};
  &:hover {
    border-color: ${colors.primary};
    color: ${({ $active }) => ($active ? colors.white : colors.primary)};
  }
`;
const GiftGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: ${spacing.lg};
  margin-bottom: 1.5rem;
`;
const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
  align-items: flex-end;
  margin-bottom: ${spacing.sm};
`;
const FlexInput = styled.input`
  border: 1px solid ${colors.border};
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font-size: 0.875rem;
  flex: 1 1 140px;
  min-width: 100px;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.primaryLight};
  }
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

export default function GiftTracker({ eventId }: Props) {
  const dispatch = useAppDispatch();
  const gifts = useAppSelector((s) => s.gifts.byEventId[eventId] || []);
  const giftError = useAppSelector((s) => s.gifts.error);
  const [filter, setFilter] = useState<GiftFilter>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', notes: '' });
  const [formError, setFormError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (eventId) dispatch(fetchGifts(eventId));
  }, [eventId, dispatch]);

  const visible = filter === 'all' ? gifts : gifts.filter((g) => g.status === filter);

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Name is required.');
      return;
    }
    setFormError('');
    setAdding(true);
    try {
      await dispatch(
        createGift({
          eventId,
          data: { ...form, price: form.price ? Number(form.price) : undefined, status: 'idea' },
        })
      ).unwrap();
      setForm({ name: '', description: '', price: '', notes: '' });
      setAddOpen(false);
    } catch (err) {
      setFormError(String(err || 'Failed.'));
    } finally {
      setAdding(false);
    }
  }

  return (
    <div style={{ padding: '0.25rem 0' }}>
      <FilterTabs>
        {FILTER_TABS.map((tab) => (
          <TabBtn key={tab} $active={filter === tab} onClick={() => setFilter(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)} (
            {tab === 'all' ? gifts.length : gifts.filter((g) => g.status === tab).length})
          </TabBtn>
        ))}
      </FilterTabs>
      <FormRow style={{ marginBottom: spacing.lg }}>
        <Button
          size="sm"
          variant={addOpen ? 'secondary' : 'primary'}
          onClick={() => setAddOpen((v) => !v)}
        >
          {addOpen ? 'Cancel' : '+ Add Gift'}
        </Button>
      </FormRow>
      {addOpen && (
        <FormSection style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
          <p
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#5b21b6',
              marginBottom: spacing.md,
            }}
          >
            Add Gift Idea
          </p>
          <form onSubmit={handleAdd}>
            <FormRow>
              <FlexInput
                placeholder="Gift name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <FlexInput
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <FlexInput
                type="number"
                placeholder="Price ₹"
                value={form.price}
                min="0"
                step="1"
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <FlexInput
                placeholder="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
              <Button type="submit" size="sm" disabled={adding}>
                {adding ? 'Adding...' : 'Add'}
              </Button>
            </FormRow>
            {formError && <Msg $error>{formError}</Msg>}
          </form>
        </FormSection>
      )}
      {visible.length === 0 ? (
        <EmptyMsg>
          {filter === 'all'
            ? 'No gifts tracked yet. Add your first gift idea above.'
            : `No gifts with status "${filter}".`}
        </EmptyMsg>
      ) : (
        <GiftGrid>
          {visible.map((gift) => (
            <GiftCard
              key={gift.id}
              gift={gift}
              onStatusAdvance={(g) => {
                const next = STATUS_NEXT[g.status || 'idea'];
                if (next) dispatch(updateGift({ eventId, id: g.id, data: { status: next } }));
              }}
              onDelete={(id) => {
                if (window.confirm('Delete this gift?')) dispatch(deleteGift({ eventId, id }));
              }}
            />
          ))}
        </GiftGrid>
      )}
      {giftError && <Msg $error>{giftError}</Msg>}
    </div>
  );
}
