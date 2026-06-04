import React from 'react';
import styled from 'styled-components';
import { colors, spacing, radius, fontSize, fontWeight } from '../../design/tokens';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  bg?: string;
}
interface ChipProps {
  children: React.ReactNode;
}

export const Badge = styled.span<BadgeProps>`
  display: inline-flex;
  align-items: center;
  padding: 2px ${spacing.sm};
  border-radius: ${radius.full};
  font-size: ${fontSize.xs};
  font-weight: ${fontWeight.medium};
  background: ${({ bg }) => bg ?? colors.badge};
  color: ${({ color }) => color ?? colors.white};
`;

export const Chip = styled.span<ChipProps>`
  display: inline-flex;
  align-items: center;
  padding: 2px ${spacing.sm};
  border-radius: ${radius.full};
  font-size: ${fontSize.xs};
  font-weight: ${fontWeight.medium};
  background: ${colors.primaryLighter};
  color: ${colors.primary};
`;

export const CategoryChip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px ${spacing.sm};
  border-radius: ${radius.full};
  font-size: ${fontSize.xs};
  font-weight: ${fontWeight.medium};
  background: ${colors.primaryLight};
  color: #4c1d95;
`;

export const NotificationBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  border-radius: ${radius.full};
  background: ${colors.badge};
  color: ${colors.white};
  font-size: 10px;
  font-weight: ${fontWeight.bold};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
`;
