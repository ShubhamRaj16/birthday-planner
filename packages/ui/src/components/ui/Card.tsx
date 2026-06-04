import styled from 'styled-components';
import { colors, spacing, radius, shadow } from '../../design/tokens';

export const Card = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.borderLight};
  border-radius: ${radius.lg};
  box-shadow: ${shadow.card};
  padding: ${spacing.xl};
`;

export const FormSection = styled.div`
  background: ${colors.primaryLightest};
  border: 1px solid ${colors.primaryBorder};
  border-radius: ${radius.lg};
  padding: ${spacing.lg};
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${spacing.lg};
  gap: ${spacing.md};
  flex-wrap: wrap;
`;

export const PageWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: ${spacing.xl};
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing['2xl']};
  color: ${colors.textSubtle};
  font-size: 0.9rem;
`;
