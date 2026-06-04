import React from 'react';
import styled from 'styled-components';
import { colors, spacing, radius, fontSize, fontWeight } from '../../design/tokens';

interface Props {
  budget: number;
  spent: number;
  unpaid: number;
}

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.lg};
  background: ${colors.primaryLightest};
  border: 1px solid ${colors.primaryBorder};
  border-radius: ${radius.lg};
  padding: 0.85rem 1.25rem;
  margin-bottom: ${spacing.lg};
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;
const Label = styled.span`
  font-size: ${fontSize.xs};
  font-weight: ${fontWeight.semibold};
  color: ${colors.primary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;
const Value = styled.span`
  font-size: 1.05rem;
  font-weight: ${fontWeight.bold};
  color: ${colors.text};
`;

const Alert = styled.div<{ $level: 'over' | 'warn' }>`
  padding: 0.65rem ${spacing.lg};
  border-radius: ${radius.md};
  font-size: 0.85rem;
  font-weight: ${fontWeight.semibold};
  margin-bottom: ${spacing.lg};
  background: ${({ $level }) => ($level === 'over' ? colors.errorBg : colors.warningBg)};
  color: ${({ $level }) => ($level === 'over' ? '#991b1b' : colors.warning)};
  border: 1px solid ${({ $level }) => ($level === 'over' ? '#fca5a5' : '#fde68a')};
`;

export default function BudgetSummary({ budget, spent, unpaid }: Props) {
  const remaining = budget - spent;
  const pct = budget > 0 ? (spent / budget) * 100 : 0;

  return (
    <>
      <Bar>
        <Item>
          <Label>Budget</Label>
          <Value>&#x20B9;{budget.toLocaleString()}</Value>
        </Item>
        <Item>
          <Label>Spent</Label>
          <Value>&#x20B9;{spent.toLocaleString()}</Value>
        </Item>
        <Item>
          <Label>Remaining</Label>
          <Value style={{ color: remaining < 0 ? '#dc2626' : '#059669' }}>
            &#x20B9;{remaining.toLocaleString()}
          </Value>
        </Item>
        <Item>
          <Label>Unpaid</Label>
          <Value style={{ color: unpaid > 0 ? '#d97706' : colors.textMuted }}>
            &#x20B9;{unpaid.toLocaleString()}
          </Value>
        </Item>
      </Bar>
      {budget > 0 && pct >= 100 && (
        <Alert $level="over">
          Budget exceeded! Spent &#x20B9;{spent.toLocaleString()} of &#x20B9;
          {budget.toLocaleString()} ({Math.round(pct)}%).
        </Alert>
      )}
      {budget > 0 && pct >= 80 && pct < 100 && (
        <Alert $level="warn">
          Used {Math.round(pct)}% of budget. Only &#x20B9;{remaining.toLocaleString()} remaining.
        </Alert>
      )}
    </>
  );
}
