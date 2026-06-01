import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import styled from 'styled-components';
import dayjs from 'dayjs';
import type { Event as PlannerEvent, EventStatus } from '../types';
import { fetchEvent, activateEvent, updateEvent } from '../redux/slices/eventsSlice';
import GuestList from '../components/GuestList';
import BudgetTracker from '../components/BudgetTracker';
import GiftTracker from '../components/GiftTracker';
import TaskChecklist from '../components/TaskChecklist';
import InviteFlow from '../components/InviteFlow';
import PhotoGallery from '../components/PhotoGallery';
import AISuggestions from '../components/AISuggestions';

// ─── Styled components ────────────────────────────────────────────────────────

const BackLink = styled(Link)`
  color: #7c3aed;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 1.25rem;

  &:hover {
    text-decoration: underline;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.4rem;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: center;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  align-items: center;
`;

const MetaItem = styled.span`
  font-size: 0.85rem;
  color: #6b7280;
`;

const StatusBadge = styled.span<{ status: EventStatus }>`
  font-size: 0.78rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  background: ${({ status }) =>
    status === 'Active' ? '#d1fae5' : status === 'Completed' ? '#e5e7eb' : '#fef3c7'};
  color: ${({ status }) =>
    status === 'Active' ? '#065f46' : status === 'Completed' ? '#374151' : '#92400e'};
`;

const Section = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #f3f4f6;
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
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InfoValue = styled.span`
  font-size: 0.9rem;
  color: #111827;
`;

// ─── Tab bar ─────────────────────────────────────────────────────────────────

const TabBar = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 1.25rem;
  overflow-x: auto;
`;

const TabButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  padding: 0.6rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  color: ${({ $active }) => ($active ? '#7c3aed' : '#6b7280')};
  border-bottom: 2.5px solid ${({ $active }) => ($active ? '#7c3aed' : 'transparent')};
  margin-bottom: -2px;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;

  &:hover {
    color: #7c3aed;
  }
`;

// ─── Buttons ─────────────────────────────────────────────────────────────────

const Button = styled.button`
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #6d28d9;
  }

  &:disabled {
    background: #c4b5fd;
    cursor: not-allowed;
  }
`;

const RefreshBtn = styled.button`
  background: #fff;
  color: #7c3aed;
  border: 1.5px solid #7c3aed;
  border-radius: 8px;
  padding: 0.45rem 0.9rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;

  &:hover { background: #f3f0ff; }
`;

const ErrorMsg = styled.p`
  color: #b91c1c;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
`;

const LoadingMsg = styled.p`
  color: #6b7280;
  padding: 2rem 0;
`;

// ─── Google Photos field ──────────────────────────────────────────────────────

const GPRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
`;

const GPInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 0.4rem 0.7rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  &:focus { outline: none; border-color: #7c3aed; }
`;

const GPSaveBtn = styled.button`
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:hover { background: #6d28d9; }
`;

const GPLink = styled.a`
  color: #7c3aed;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

function GooglePhotosField({ eventId, event }: { eventId: number; event: PlannerEvent }) {
  const dispatch = useAppDispatch();
  const [url, setUrl] = useState(event.googlePhotosUrl || '');
  const [saved, setSaved] = useState(false);

  // SCRUM-50: derive from prop directly instead of mirroring via effect
  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => { setUrl(event.googlePhotosUrl || ''); }, [event.googlePhotosUrl]);

  async function handleSave() {
    await dispatch(updateEvent({ id: eventId, data: { googlePhotosUrl: url.trim() || null } }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <InfoLabel>Google Photos Album</InfoLabel>
      <GPRow>
        <GPInput
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste Google Photos shared album URL"
        />
        <GPSaveBtn onClick={handleSave}>{saved ? 'Saved' : 'Save'}</GPSaveBtn>
        {event.googlePhotosUrl && (
          <GPLink href={event.googlePhotosUrl} target="_blank" rel="noopener noreferrer">
            Open Album ↗
          </GPLink>
        )}
      </GPRow>
    </div>
  );
}

// ─── Tabs config ─────────────────────────────────────────────────────────────

const WarningBanner = styled.div`
  background: #fff7ed;
  border: 1px solid #fb923c;
  border-radius: 8px;
  padding: 0.65rem 1rem;
  font-size: 0.875rem;
  color: #9a3412;
  font-weight: 500;
  margin-top: 0.5rem;
  width: 100%;
`;

const TABS = [
  { id: 'tasks',   label: 'Tasks'   },
  { id: 'guests',  label: 'Guests'  },
  { id: 'budget',  label: 'Budget'  },
  { id: 'gifts',   label: 'Gifts'   },
  { id: 'invites', label: 'Invites' },
  { id: 'photos',  label: 'Photos'  },
  { id: 'ai',      label: '✨ AI'   },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventDetail() {
  const { id } = useParams();
  const eventId = Number(id);
  const dispatch = useAppDispatch();
  const { current: event, loading, error } = useAppSelector((state) => state.events);

  const [activeTab, setActiveTab] = useState('tasks');
  const [pendingAiTemplate, setPendingAiTemplate] = useState<string | undefined>();
  // SCRUM-39: event edit form
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ date: '', venue: '', address: '', theme: '', budget: '', notes: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  // Initial fetch
  useEffect(() => {
    if (Number.isFinite(eventId)) dispatch(fetchEvent(eventId));
  }, [eventId, dispatch]);

  // 30s polling (SCRUM-19)
  useEffect(() => {
    if (!Number.isFinite(eventId)) return;
    const timer = setInterval(() => dispatch(fetchEvent(eventId)), 30000);
    return () => clearInterval(timer);
  }, [eventId, dispatch]);

  function handleActivate() {
    dispatch(activateEvent(eventId));
  }

  function handleRefresh() {
    dispatch(fetchEvent(eventId));
  }

  // SCRUM-39: open edit form pre-filled from current event
  function openEdit() {
    if (!event) return;
    setEditForm({
      date: event.date ? dayjs(event.date).format('YYYY-MM-DD') : '',
      venue: event.venue || '',
      address: event.address || '',
      theme: event.theme || '',
      budget: event.budget != null ? String(event.budget) : '',
      notes: event.notes || '',
    });
    setEditOpen(true);
  }

  async function saveEdit() {
    setSavingEdit(true);
    try {
      await dispatch(updateEvent({
        id: eventId,
        data: {
          date: editForm.date || undefined,
          venue: editForm.venue,
          address: editForm.address,
          theme: editForm.theme,
          budget: editForm.budget === '' ? null : Number(editForm.budget),
          notes: editForm.notes,
        },
      })).unwrap();
      setEditOpen(false);
    } finally {
      setSavingEdit(false);
    }
  }

  if (loading && !event) return <LoadingMsg>Loading event...</LoadingMsg>;
  if (!event) return <LoadingMsg>Event not found.</LoadingMsg>;

  const tasks = event.tasks || [];

  return (
    <div>
      <BackLink to="/events">&larr; Back to Events</BackLink>

      <HeaderRow>
        <PageTitle>{event.theme || 'Birthday Party'}</PageTitle>
        <HeaderActions>
          <RefreshBtn onClick={handleRefresh} title="Refresh event data">
            &#x21bb; Refresh
          </RefreshBtn>
          <RefreshBtn onClick={openEdit} title="Edit event details">
            Edit
          </RefreshBtn>
          {event.status === 'Draft' && (
            <Button onClick={handleActivate} disabled={loading}>
              Activate Event
            </Button>
          )}
        </HeaderActions>
      </HeaderRow>

      <MetaRow>
        <StatusBadge status={event.status}>{event.status}</StatusBadge>
        {event.child && <MetaItem>For {event.child.name}</MetaItem>}
        {event.date && (
          <MetaItem>{dayjs(event.date).format('dddd, MMMM D, YYYY')}</MetaItem>
        )}
        {event.status === 'Active' &&
          !event.myGateLink &&
          dayjs(event.date).diff(dayjs(), 'day') <= 14 &&
          dayjs(event.date).diff(dayjs(), 'day') >= 0 && (
          <WarningBanner>
            &#9888;&#65039; Event is in {dayjs(event.date).diff(dayjs(), 'day')} days — add your MyGate link in the Invites tab
          </WarningBanner>
        )}
      </MetaRow>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      {/* Event details summary / edit (SCRUM-39) */}
      <Section>
        <SectionTitle>Event Details</SectionTitle>
        {editOpen ? (
          <div>
            <InfoGrid>
              <InfoRow>
                <InfoLabel>Date</InfoLabel>
                <GPInput type="date" value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
              </InfoRow>
              <InfoRow>
                <InfoLabel>Theme</InfoLabel>
                <GPInput value={editForm.theme}
                  onChange={(e) => setEditForm({ ...editForm, theme: e.target.value })} />
              </InfoRow>
              <InfoRow>
                <InfoLabel>Venue</InfoLabel>
                <GPInput value={editForm.venue}
                  onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })} />
              </InfoRow>
              <InfoRow>
                <InfoLabel>Address</InfoLabel>
                <GPInput value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
              </InfoRow>
              <InfoRow>
                <InfoLabel>Budget (₹)</InfoLabel>
                <GPInput type="number" min="0" value={editForm.budget}
                  onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })} />
              </InfoRow>
              <InfoRow>
                <InfoLabel>Notes</InfoLabel>
                <GPInput value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
              </InfoRow>
            </InfoGrid>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <Button onClick={saveEdit} disabled={savingEdit}>
                {savingEdit ? 'Saving…' : 'Save Changes'}
              </Button>
              <RefreshBtn onClick={() => setEditOpen(false)}>Cancel</RefreshBtn>
            </div>
          </div>
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
              <InfoValue>{dayjs(event.date).format('MMM D, YYYY')}</InfoValue>
            </InfoRow>
          )}
        </InfoGrid>
        )}
        <GooglePhotosField eventId={eventId} event={event} />
      </Section>

      {/* Tab bar */}
      <TabBar role="tablist">
        {TABS.map((tab) => (
          <TabButton
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            $active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabBar>

      {/* Tab panels */}
      <Section>
        {activeTab === 'tasks' && (
          <>
            <SectionTitle>Tasks</SectionTitle>
            <TaskChecklist eventId={eventId} tasks={tasks} onRefresh={handleRefresh} />
          </>
        )}
        {activeTab === 'guests' && (
          <>
            <SectionTitle>Guests</SectionTitle>
            <GuestList eventId={eventId} eventTheme={event.theme} />
          </>
        )}
        {activeTab === 'budget' && (
          <>
            <SectionTitle>Budget</SectionTitle>
            <BudgetTracker eventId={eventId} eventBudget={event.budget} eventTheme={event.theme} />
          </>
        )}
        {activeTab === 'gifts' && (
          <>
            <SectionTitle>Gifts</SectionTitle>
            <GiftTracker eventId={eventId} />
          </>
        )}
        {activeTab === 'invites' && (
          <InviteFlow
            eventId={eventId}
            event={event}
            onRefresh={handleRefresh}
            suggestedTemplate={pendingAiTemplate}
          />
        )}
        {activeTab === 'photos' && (
          <>
            <SectionTitle>Photos</SectionTitle>
            <PhotoGallery eventId={eventId} />
          </>
        )}
        {activeTab === 'ai' && (
          <>
            <SectionTitle>AI Suggestions</SectionTitle>
            <AISuggestions
              eventId={eventId}
              onUseTemplate={(template: string) => {
                setPendingAiTemplate(template);
                setActiveTab('invites');
              }}
            />
          </>
        )}
      </Section>
    </div>
  );
}
