import React from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { colors, spacing, fontWeight } from '../../design/tokens';

interface ChartEntry {
  name: string;
  amount: number;
}
interface Props {
  data: ChartEntry[];
}

const Section = styled.div`
  margin-top: 1.5rem;
`;
const Title = styled.h3`
  font-size: 0.9rem;
  font-weight: ${fontWeight.semibold};
  color: ${colors.textMuted};
  margin-bottom: ${spacing.md};
`;

export default function BudgetChart({ data }: Props) {
  if (data.length === 0) return null;
  return (
    <Section>
      <Title>Spending by Category</Title>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: colors.textSubtle }}
            angle={-30}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fontSize: 11, fill: colors.textSubtle }} />
          <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Spent']} />
          <Bar dataKey="amount" fill={colors.primary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Section>
  );
}
