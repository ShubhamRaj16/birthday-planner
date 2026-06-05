import React from 'react';
import styled, { css } from 'styled-components';
import { colors, spacing, radius, fontSize, fontWeight } from '../../design/tokens';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, ReturnType<typeof css>> = {
  primary: css`
    background: ${colors.primary};
    color: ${colors.white};
    border: 1.5px solid ${colors.primary};
    &:hover:not(:disabled) {
      background: ${colors.primaryHover};
      border-color: ${colors.primaryHover};
    }
  `,
  secondary: css`
    background: ${colors.white};
    color: ${colors.primary};
    border: 1.5px solid ${colors.primary};
    &:hover:not(:disabled) {
      background: ${colors.primaryLighter};
    }
  `,
  danger: css`
    background: ${colors.errorBg};
    color: ${colors.error};
    border: 1.5px solid ${colors.errorBg};
    &:hover:not(:disabled) {
      background: #fecaca;
    }
  `,
  ghost: css`
    background: transparent;
    color: ${colors.textMuted};
    border: 1.5px solid transparent;
    &:hover:not(:disabled) {
      background: ${colors.bgLight};
    }
  `,
};

const sizeStyles: Record<Size, ReturnType<typeof css>> = {
  sm: css`
    padding: ${spacing.xs} ${spacing.md};
    font-size: ${fontSize.xs};
  `,
  md: css`
    padding: ${spacing.sm} ${spacing.lg};
    font-size: ${fontSize.sm};
  `,
};

const StyledButton = styled.button<{ $variant: Variant; $size: Size }>`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs};
  border-radius: ${radius.md};
  font-weight: ${fontWeight.medium};
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
  white-space: nowrap;
  ${({ $variant }) => variantStyles[$variant]}
  ${({ $size }) => sizeStyles[$size]}
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  ...rest
}) => (
  <StyledButton $variant={variant} $size={size} {...rest}>
    {children}
  </StyledButton>
);
