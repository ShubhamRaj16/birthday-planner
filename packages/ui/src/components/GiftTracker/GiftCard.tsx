import styled from 'styled-components';
import { colors, spacing, radius, shadow, fontSize, fontWeight } from '../../design/tokens';
import type { Gift, GiftStatus } from '../../types';

interface Props {
  gift: Gift;
  onStatusAdvance: (gift: Gift) => void;
  onDelete: (id: number) => void;
}

const Card = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.borderLight};
  border-radius: ${radius.lg};
  padding: ${spacing.lg};
  box-shadow: ${shadow.card};
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Name = styled.h4`
  font-size: 0.95rem;
  font-weight: ${fontWeight.semibold};
  color: ${colors.text};
  margin: 0;
`;
const Desc = styled.p`
  font-size: 0.8rem;
  color: ${colors.textSubtle};
  margin: 0;
`;
const Meta = styled.span`
  font-size: 0.78rem;
  color: ${colors.textDisabled};
`;

const StatusBadge = styled.span<{ status: GiftStatus }>`
  display: inline-block;
  font-size: 0.72rem;
  font-weight: ${fontWeight.semibold};
  padding: 2px 9px;
  border-radius: ${radius.full};
  text-transform: capitalize;
  background: ${({ status }) =>
    status === 'received' ? colors.successBg : status === 'bought' ? '#dbeafe' : colors.warningBg};
  color: ${({ status }) =>
    status === 'received' ? colors.success : status === 'bought' ? '#1e40af' : colors.warning};
`;

const CardActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-top: 0.4rem;
  flex-wrap: wrap;
`;

const AdvanceBtn = styled.button`
  background: ${colors.primary};
  color: ${colors.white};
  border: none;
  border-radius: ${radius.sm};
  padding: 3px 10px;
  font-size: ${fontSize.xs};
  font-weight: ${fontWeight.semibold};
  cursor: pointer;
  &:hover {
    background: ${colors.primaryHover};
  }
`;

const DeleteBtn = styled.button`
  background: none;
  border: 1px solid #fca5a5;
  color: #ef4444;
  border-radius: ${radius.sm};
  padding: 3px 10px;
  font-size: ${fontSize.xs};
  cursor: pointer;
  margin-left: auto;
  &:hover {
    background: ${colors.errorBg};
  }
`;

const STATUS_NEXT: Partial<Record<GiftStatus, GiftStatus>> = { idea: 'bought', bought: 'received' };
const STATUS_LABEL: Partial<Record<GiftStatus, string>> = {
  idea: 'Mark Bought',
  bought: 'Mark Received',
};

export default function GiftCard({ gift, onStatusAdvance, onDelete }: Props) {
  const status = gift.status || 'idea';
  return (
    <Card>
      <Name>{gift.name}</Name>
      {gift.description && <Desc>{gift.description}</Desc>}
      <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap', alignItems: 'center' }}>
        <StatusBadge status={status}>{status}</StatusBadge>
        {gift.price && <Meta>&#x20B9;{Number(gift.price).toLocaleString()}</Meta>}
      </div>
      {gift.givenBy && <Meta>Given by: {gift.givenBy}</Meta>}
      {gift.notes && <Meta>{gift.notes}</Meta>}
      <CardActions>
        {STATUS_NEXT[status] && (
          <AdvanceBtn onClick={() => onStatusAdvance(gift)}>{STATUS_LABEL[status]}</AdvanceBtn>
        )}
        <DeleteBtn onClick={() => onDelete(gift.id)}>Remove</DeleteBtn>
      </CardActions>
    </Card>
  );
}
