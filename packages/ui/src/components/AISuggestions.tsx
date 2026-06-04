import { useState } from 'react';
import styled from 'styled-components';
import { aiApi } from '../api/ai.api';
import { giftsApi } from '../api/gifts.api';
import { getApiError } from '../lib/apiError';

// Save an AI gift suggestion via the gifts repository.
async function saveGiftSuggestion(eventId: number, name: string): Promise<void> {
  await giftsApi.createGift(eventId, { name, source: 'ai' });
}

interface AISuggestionsProps {
  eventId: number;
  onUseTemplate?: (template: string) => void;
}

// ─── Styled components ────────────────────────────────────────────────────────

const TypeGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
`;

const TypeBtn = styled.button<{ $active: boolean }>`
  padding: 0.45rem 1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid ${({ $active }) => ($active ? '#7c3aed' : '#e5e7eb')};
  background: ${({ $active }) => ($active ? '#f3f0ff' : '#fff')};
  color: ${({ $active }) => ($active ? '#7c3aed' : '#374151')};
  transition: all 0.15s;
  &:hover { border-color: #7c3aed; }
`;

const GenerateBtn = styled.button`
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1.25rem;
  &:hover { background: #6d28d9; }
  &:disabled { background: #c4b5fd; cursor: not-allowed; }
`;

const SuggestionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SuggestionItem = styled.li`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.9rem;
  color: #1f2937;

  &:last-child { border-bottom: none; }
`;

const SuggestionText = styled.span`
  flex: 1;
  line-height: 1.4;
`;

const SaveBtn = styled.button`
  flex-shrink: 0;
  font-size: 0.78rem;
  padding: 3px 10px;
  border-radius: 5px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  color: #374151;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
  &:hover { background: #f3f4f6; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const MessageBox = styled.pre`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
  color: #374151;
  margin: 0 0 0.75rem;
`;

const UseTemplateBtn = styled.button`
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.45rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #6d28d9; }
`;

const ErrMsg = styled.p`
  color: #b91c1c;
  font-size: 0.875rem;
`;

const EmptyMsg = styled.p`
  color: #9ca3af;
  font-size: 0.875rem;
`;

const TYPES = [
  { id: 'themes',     label: 'Theme Ideas'   },
  { id: 'activities', label: 'Activities'    },
  { id: 'gifts',      label: 'Gift Ideas'    },
  { id: 'venue',      label: 'Venue Ideas'   },
  { id: 'catering',   label: 'Food & Catering' },
  { id: 'message',    label: 'Invite Message' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AISuggestions({ eventId, onUseTemplate }: AISuggestionsProps) {
  const [activeType, setActiveType] = useState('themes');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [savedGifts, setSavedGifts] = useState<Record<string, boolean>>({});

  async function handleGenerate() {
    setLoading(true);
    setErr(null);
    setSuggestions([]);
    try {
      const result = await aiApi.getSuggestions(eventId, activeType);
      setSuggestions(result);
    } catch (e) {
      setErr(getApiError(e) || 'AI request failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveGift(suggestion: string) {
    setSavedGifts((prev) => ({ ...prev, [suggestion]: true }));
    try {
      await saveGiftSuggestion(eventId, suggestion);
    } catch {
      setSavedGifts((prev) => { const n = { ...prev }; delete n[suggestion]; return n; });
    }
  }

  return (
    <div>
      <TypeGrid>
        {TYPES.map((t) => (
          <TypeBtn
            key={t.id}
            $active={activeType === t.id}
            onClick={() => { setActiveType(t.id); setSuggestions([]); setErr(null); }}
          >
            {t.label}
          </TypeBtn>
        ))}
      </TypeGrid>

      <GenerateBtn onClick={handleGenerate} disabled={loading}>
        {loading ? 'Asking Claude…' : `Generate ${TYPES.find((t) => t.id === activeType)?.label}`}
      </GenerateBtn>

      {err && <ErrMsg>{err}</ErrMsg>}

      {!loading && suggestions.length === 0 && !err && (
        <EmptyMsg>Select a type above and click Generate.</EmptyMsg>
      )}

      {suggestions.length > 0 && activeType === 'message' && (
        <>
          <MessageBox>{suggestions[0]}</MessageBox>
          {onUseTemplate && (
            <UseTemplateBtn onClick={() => onUseTemplate(suggestions[0])}>
              Use as Invite Template
            </UseTemplateBtn>
          )}
        </>
      )}

      {suggestions.length > 0 && activeType !== 'message' && (
        <SuggestionList>
          {suggestions.map((s, i) => (
            <SuggestionItem key={i}>
              <SuggestionText>{s}</SuggestionText>
              {activeType === 'gifts' && (
                <SaveBtn
                  disabled={!!savedGifts[s]}
                  onClick={() => handleSaveGift(s)}
                >
                  {savedGifts[s] ? 'Saved' : 'Save to Gifts'}
                </SaveBtn>
              )}
            </SuggestionItem>
          ))}
        </SuggestionList>
      )}
    </div>
  );
}
