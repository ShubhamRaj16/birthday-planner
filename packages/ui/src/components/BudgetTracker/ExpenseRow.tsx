import React, { useRef } from 'react';
import styled from 'styled-components';
import { CategoryChip, Td, Tr } from '../ui';
import { mediaUrl } from '../../lib/media';
import { colors } from '../../design/tokens';
import type { Expense } from '../../types';

interface Props {
  expense: Expense;
  uploadingId: number | null;
  onPaidToggle: (expense: Expense) => void;
  onDelete: (id: number) => void;
  onReceiptUpload: (id: number, file: File) => void;
}

const PaidCheckbox = styled.input`
  accent-color: ${colors.primary};
  width: 16px;
  height: 16px;
  cursor: pointer;
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
const AttachBtn = styled.button`
  background: none;
  border: none;
  color: ${colors.primary};
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0;
`;

export default function ExpenseRow({
  expense: exp,
  uploadingId,
  onPaidToggle,
  onDelete,
  onReceiptUpload,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <Tr>
      <Td>{exp.label}</Td>
      <Td>
        <CategoryChip>{exp.category}</CategoryChip>
      </Td>
      <Td>&#x20B9;{Number(exp.amount).toLocaleString()}</Td>
      <Td>
        <PaidCheckbox
          type="checkbox"
          checked={!!exp.paid}
          onChange={() => onPaidToggle(exp)}
          title="Toggle paid"
        />
      </Td>
      <Td>
        {exp.receiptPath ? (
          <a
            href={mediaUrl(exp.receiptPath)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.78rem', color: colors.primary, fontWeight: 600 }}
          >
            View
          </a>
        ) : (
          <>
            <AttachBtn
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingId === exp.id}
            >
              {uploadingId === exp.id ? 'Uploading…' : '📎 Attach'}
            </AttachBtn>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onReceiptUpload(exp.id, f);
              }}
            />
          </>
        )}
      </Td>
      <Td>
        <DeleteBtn onClick={() => onDelete(exp.id)} title="Delete">
          &#10005;
        </DeleteBtn>
      </Td>
    </Tr>
  );
}
