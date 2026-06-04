import React from 'react';
import styled from 'styled-components';
import { colors, radius } from '../../design/tokens';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: string;
}

const Track = styled.div<{ $height: string }>`
  width: 100%;
  background: ${colors.bgLight};
  border-radius: ${radius.full};
  height: ${({ $height }) => $height};
  overflow: hidden;
`;

const Fill = styled.div<{ $pct: number; $color: string }>`
  height: 100%;
  width: ${({ $pct }) => Math.min($pct, 100)}%;
  background: ${({ $color }) => $color};
  border-radius: ${radius.full};
  transition: width 0.3s ease;
`;

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color = colors.primary,
  height = '8px',
}) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <Track $height={height}>
      <Fill $pct={pct} $color={color} />
    </Track>
  );
};
