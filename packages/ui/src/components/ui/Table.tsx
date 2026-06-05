import styled from 'styled-components';
import { colors, spacing, fontSize, fontWeight } from '../../design/tokens';

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${fontSize.sm};
`;

export const Th = styled.th`
  text-align: left;
  padding: ${spacing.sm} ${spacing.md};
  background: ${colors.bgLight};
  color: ${colors.textMuted};
  font-size: ${fontSize.xs};
  font-weight: ${fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid ${colors.borderLight};
`;

export const Td = styled.td`
  padding: ${spacing.sm} ${spacing.md};
  border-bottom: 1px solid ${colors.bgLight};
  color: ${colors.text};
  vertical-align: middle;
`;

export const Tr = styled.tr`
  &:hover {
    background: ${colors.bgLightest};
  }
  &:last-child td {
    border-bottom: none;
  }
`;
