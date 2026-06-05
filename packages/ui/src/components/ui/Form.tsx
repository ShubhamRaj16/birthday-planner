import styled from 'styled-components';
import { colors, spacing, radius, fontSize } from '../../design/tokens';

const inputBase = `
  width: 100%;
  padding: ${spacing.sm} ${spacing.md};
  border: 1.5px solid ${colors.border};
  border-radius: ${radius.md};
  font-size: ${fontSize.sm};
  color: ${colors.text};
  background: ${colors.white};
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px ${colors.primaryLight};
  }
  &::placeholder { color: ${colors.textDisabled}; }
  &:disabled { background: ${colors.bgLight}; cursor: not-allowed; }
`;

export const FormInput = styled.input`
  ${inputBase}
`;

export const FormTextarea = styled.textarea`
  ${inputBase}
  resize: vertical;
  min-height: 80px;
`;

export const FormSelect = styled.select`
  ${inputBase}
`;

export const FormRow = styled.div`
  display: flex;
  gap: ${spacing.md};
  align-items: flex-end;
  flex-wrap: wrap;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  flex: 1;
  min-width: 160px;
`;

export const FormLabel = styled.label`
  font-size: ${fontSize.xs};
  font-weight: 500;
  color: ${colors.textMuted};
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  accent-color: ${colors.primary};
  cursor: pointer;
`;
