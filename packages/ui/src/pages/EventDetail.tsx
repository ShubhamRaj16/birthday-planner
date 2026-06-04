import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { fetchEvent, activateEvent, updateEvent } from '../redux/slices/eventsSlice';
import GuestList from '../components/GuestList';
import BudgetTracker from '../components/BudgetTracker';
import GiftTracker from '../components/GiftTracker';
import TaskChecklist from '../components/TaskChecklist';
import InviteFlow from '../components/InviteFlow';
import PhotoGallery from '../components/PhotoGallery';
import AISuggestions from '../components/AISuggestions';
import EventHeader from '../components/EventDetail/EventHeader';
import EventDetailsCard from '../components/EventDetail/EventDetailsCard';
import { type EditFormState } from '../components/EventDetail/EventEditForm';
import { Card } from '../components/ui';
import { colors, spacing } from '../design/tokens';

const Section = styled(Card)`
  margin-bottom: 1.25rem;
  padding: 1.25rem 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${colors.textMuted};
  margin-bottom: ${spacing.md};
  padding-bottom: 0.4rem;
  border-bottom: 1px solid ${colors.bgLight};
`;

const TabBar = styled.div`
  display: flex;
  border-bottom: 2px solid ${colors.borderLight};
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
  color: ${({ $active }) => ($active ? colors.primary : colors.textSubtle)};
  border-bottom: 2.5px solid ${({ $active }) => ($active ? colors.primary : 'transparent')};
  margin-bottom: -2px;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;

  &:hover {
    color: ${colors.primary};
  }
`;

const Msg = styled.p<{ $error?: boolean }>`
  color: ${({ $error }) => ($error ? colors.error : colors.textSubtle)};
  padding: ${spacing.xl} 0;
`;

const TABS = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'guests', label: 'Guests' },
  { id: 'budget', label: 'Budget' },
  { id: 'gifts', label: 'Gifts' },
  { id: 'invites', label: 'Invites' },
  { id: 'photos', label: 'Photos' },
  { id: 'ai', label: '✨ AI' },
];

export default function EventDetail() {
  const { id } = useParams();
  const eventId = Number(id);
  const dispatch = useAppDispatch();
  const { current: event, loading, error } = useAppSelector((state) => state.events);

  const [activeTab, setActiveTab] = useState('tasks');
  const [pendingAiTemplate, setPendingAiTemplate] = useState<string | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({
    date: '', venue: '', address: '', theme: '', budget: '', notes: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (Number.isFinite(eventId)) dispatch(fetchEvent(eventId));
  }, [eventId, dispatch]);

  useEffect(() => {
    if (!Number.isFinite(eventId)) return;
    const timer = setInterval(() => dispatch(fetchEvent(eventId)), 30000);
    return () => clearInterval(timer);
  }, [eventId, dispatch]);

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
      await dispatch(
        updateEvent({
          id: eventId,
          data: {
            date: editForm.date || undefined,
            venue: editForm.venue,
            address: editForm.address,
            theme: editForm.theme,
            budget: editForm.budget === '' ? null : Number(editForm.budget),
            notes: editForm.notes,
          },
        })
      ).unwrap();
      setEditOpen(false);
    } finally {
      setSavingEdit(false);
    }
  }

  if (loading && !event) return <Msg>Loading event...</Msg>;
  if (!event) return <Msg $error>Event not found.</Msg>;

  return (
    <div>
      <EventHeader
        event={event}
        loading={loading}
        onActivate={() => dispatch(activateEvent(eventId))}
        onRefresh={() => dispatch(fetchEvent(eventId))}
        onEdit={openEdit}
      />
      {error && <Msg $error>{error}</Msg>}

      <EventDetailsCard
        event={event}
        eventId={eventId}
        dispatch={dispatch}
        editOpen={editOpen}
        editForm={editForm}
        saving={savingEdit}
        onEditFormChange={setEditForm}
        onSave={saveEdit}
        onCancelEdit={() => setEditOpen(false)}
      />

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

      <Section>
        {activeTab === 'tasks' && (
          <><SectionTitle>Tasks</SectionTitle>
          <TaskChecklist eventId={eventId} tasks={event.tasks || []} onRefresh={() => dispatch(fetchEvent(eventId))} /></>
        )}
        {activeTab === 'guests' && (
          <><SectionTitle>Guests</SectionTitle>
          <GuestList eventId={eventId} eventTheme={event.theme} /></>
        )}
        {activeTab === 'budget' && (
          <><SectionTitle>Budget</SectionTitle>
          <BudgetTracker eventId={eventId} eventBudget={event.budget} eventTheme={event.theme} /></>
        )}
        {activeTab === 'gifts' && (
          <><SectionTitle>Gifts</SectionTitle>
          <GiftTracker eventId={eventId} /></>
        )}
        {activeTab === 'invites' && (
          <InviteFlow eventId={eventId} event={event} onRefresh={() => dispatch(fetchEvent(eventId))} suggestedTemplate={pendingAiTemplate} />
        )}
        {activeTab === 'photos' && (
          <><SectionTitle>Photos</SectionTitle>
          <PhotoGallery eventId={eventId} /></>
        )}
        {activeTab === 'ai' && (
          <><SectionTitle>AI Suggestions</SectionTitle>
          <AISuggestions eventId={eventId} onUseTemplate={(t: string) => { setPendingAiTemplate(t); setActiveTab('invites'); }} /></>
        )}
      </Section>
    </div>
  );
}
