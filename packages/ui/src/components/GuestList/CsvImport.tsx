import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import { Button, FormSection } from '../ui';
import { colors, spacing, fontSize } from '../../design/tokens';
import { downloadCsv } from '../../lib/csv';

interface Props {
  onImport: (rows: { name: string; phone: string }[]) => Promise<void>;
  onCancel: () => void;
}

const Textarea = styled.textarea`
  width: 100%;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  padding: ${spacing.sm} ${spacing.md};
  font-size: 0.8rem;
  font-family: monospace;
  color: ${colors.text};
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.primaryLight};
  }
`;
const Hint = styled.p`
  font-size: 0.8rem;
  color: ${colors.textSubtle};
  margin-bottom: ${spacing.sm};
`;
const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
  margin-top: ${spacing.sm};
`;
const Msg = styled.p`
  color: ${colors.error};
  font-size: 0.82rem;
  margin-top: 0.4rem;
`;

export default function CsvImport({ onImport, onCancel }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const lines = text.trim().split('\n').filter(Boolean);
    if (!lines.length) {
      setError('Paste at least one row.');
      return;
    }
    const parsed = lines
      .map((line) => {
        const parts = line.split(',').map((s) => s.trim());
        return { name: parts[0] || '', phone: parts[1] || '' };
      })
      .filter((g) => g.name);
    if (!parsed.length) {
      setError('No valid rows found. Format: name,phone');
      return;
    }
    setImporting(true);
    try {
      await onImport(parsed);
    } catch (err) {
      setError(String(err || 'Import failed.'));
    } finally {
      setImporting(false);
    }
  }

  return (
    <FormSection style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
      <p
        style={{
          fontSize: fontSize.sm,
          fontWeight: 600,
          color: '#5b21b6',
          marginBottom: spacing.md,
        }}
      >
        CSV Bulk Import
      </p>
      <Hint>
        One guest per line: <code>name,phone</code> — Name required, phone optional.{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            downloadCsv('guest-import-sample.csv', 'Alice Sharma,9999000001\nBob Mehta,9999000002');
          }}
        >
          Download template
        </a>
      </Hint>
      <form onSubmit={handleSubmit}>
        <Textarea
          placeholder={'Alice,9999000001\nBob,9999000002'}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Row>
          <Button type="submit" size="sm" disabled={importing}>
            {importing ? 'Importing...' : 'Import'}
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </Row>
        {error && <Msg>{error}</Msg>}
      </form>
    </FormSection>
  );
}
