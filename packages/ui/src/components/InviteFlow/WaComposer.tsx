import { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { AppDispatch } from '../../redux/store';
import { updateEvent } from '../../redux/slices/eventsSlice';
import { whatsappApi } from '../../api/whatsapp.api';
import { getApiError } from '../../lib/apiError';
import { Button } from '../ui';
import { colors, spacing, radius, fontSize } from '../../design/tokens';
import type { Event } from '../../types';

interface Props {
  eventId: number;
  event: Event;
  dispatch: AppDispatch;
  suggestedTemplate?: string;
}

const Textarea = styled.textarea`
  width: 100%;
  border: 1px solid ${colors.border};
  border-radius: ${radius.sm};
  padding: ${spacing.sm} ${spacing.md};
  font-size: ${fontSize.sm};
  color: ${colors.text};
  resize: vertical;
  min-height: 120px;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.5;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.primaryLight};
  }
`;

const PlaceholderHints = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: ${spacing.sm};
  margin-bottom: ${spacing.md};
`;

const PlaceholderChip = styled.code`
  background: ${colors.primaryLighter};
  color: #5b21b6;
  font-size: ${fontSize.xs};
  padding: 2px 8px;
  border-radius: 4px;
`;

const ReadOnlyBox = styled.div`
  background: ${colors.bgLightest};
  border: 1px solid ${colors.borderLight};
  border-radius: ${radius.sm};
  padding: ${spacing.md} ${spacing.lg};
  font-size: ${fontSize.sm};
  color: ${colors.textMuted};
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  margin-top: ${spacing.sm};
`;

const Row = styled.div`
  display: flex;
  gap: ${spacing.sm};
  flex-wrap: wrap;
  margin-top: ${spacing.sm};
`;

const Msg = styled.p<{ $error?: boolean }>`
  color: ${({ $error }) => ($error ? colors.error : colors.success)};
  font-size: 0.82rem;
  margin-top: 0.25rem;
`;

export default function WaComposer({ eventId, event, dispatch, suggestedTemplate }: Props) {
  const [template, setTemplate] = useState(event.messageTemplate || '');
  const [templateLoaded, setTemplateLoaded] = useState(!!event.messageTemplate);
  const [previewMsg, setPreviewMsg] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!event.messageTemplate && !templateLoaded) {
      whatsappApi
        .fetchDefaultTemplate()
        .then((t) => {
          if (t) {
            setTemplate(t);
            setTemplateLoaded(true);
          }
        })
        .catch(() => {});
    }
  }, [event.messageTemplate, templateLoaded]);

  // Apply AI-suggested template when parent passes a new value
  useEffect(() => {
    if (suggestedTemplate) setTemplate(suggestedTemplate); // eslint-disable-line react-hooks/set-state-in-effect
  }, [suggestedTemplate]);

  async function handlePreview() {
    setPreviewLoading(true);
    setPreviewError('');
    setPreviewMsg('');
    try {
      setPreviewMsg(await whatsappApi.previewMessage(eventId, template));
    } catch (err) {
      setPreviewError(getApiError(err) || 'Preview failed.');
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setSaveError('');
    try {
      await dispatch(updateEvent({ id: eventId, data: { messageTemplate: template } })).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(String(err || 'Failed to save template.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Textarea
        value={template}
        onChange={(e) => {
          setTemplate(e.target.value);
          setSaved(false);
        }}
        placeholder="Type your WhatsApp message template here..."
      />
      <PlaceholderHints>
        {['{guestName}', '{childName}', '{date}', '{venue}', '{myGateLink}'].map((p) => (
          <PlaceholderChip key={p}>{p}</PlaceholderChip>
        ))}
      </PlaceholderHints>
      <Row>
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePreview}
          disabled={previewLoading || !template.trim()}
        >
          {previewLoading ? 'Previewing...' : 'Preview'}
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving || !template.trim()}>
          {saving ? 'Saving...' : 'Save Template'}
        </Button>
      </Row>
      {saved && <Msg>Template saved.</Msg>}
      {saveError && <Msg $error>{saveError}</Msg>}
      {previewError && <Msg $error>{previewError}</Msg>}
      {previewMsg && (
        <>
          <p
            style={{
              fontSize: '0.8rem',
              color: colors.textSubtle,
              marginTop: spacing.md,
              marginBottom: '0.25rem',
            }}
          >
            Preview (sample):
          </p>
          <ReadOnlyBox>{previewMsg}</ReadOnlyBox>
        </>
      )}
    </>
  );
}
