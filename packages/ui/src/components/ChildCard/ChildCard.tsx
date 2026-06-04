import styled from 'styled-components';
import { Button, Chip } from '../ui';
import { mediaUrl } from '../../lib/media';
import { colors, spacing, radius, fontSize } from '../../design/tokens';
import type { Child } from '../../types';

interface Props {
  child: Child;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const CardEl = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.borderLight};
  border-radius: ${radius.lg};
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.lg};
  margin-bottom: ${spacing.md};
`;

const Avatar = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: ${colors.primary};
  color: ${colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ChildName = styled.h3`
  font-weight: 600;
  color: ${colors.text};
  font-size: 1rem;
  margin: 0;
`;
const ChildMeta = styled.p`
  font-size: 0.8rem;
  color: ${colors.textSubtle};
  margin: 0;
`;
const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: ${spacing.md};
`;
const Actions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-top: ${spacing.sm};
`;

function getAge(dobStr: string | null) {
  if (!dobStr) return null;
  const dob = new Date(dobStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() - dob.getMonth() < 0 ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  )
    age--;
  return age;
}

export default function ChildCard({ child, onEdit, onDelete }: Props) {
  const age = getAge(child.dob);
  const interests = Array.isArray(child.interests)
    ? child.interests
    : (child.interests || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
  const initial = (child.name || '?')[0].toUpperCase();

  return (
    <CardEl>
      <CardTop>
        <Avatar>
          {child.photo ? <img src={mediaUrl(child.photo)} alt={child.name} /> : initial}
        </Avatar>
        <div>
          <ChildName>{child.name}</ChildName>
          <ChildMeta>
            {age !== null ? `Age ${age}` : ''}
            {child.school ? ` · ${child.school}` : ''}
          </ChildMeta>
          {child.allergies && (
            <ChildMeta style={{ fontSize: fontSize.xs }}>Allergies: {child.allergies}</ChildMeta>
          )}
        </div>
      </CardTop>
      {interests.length > 0 && (
        <ChipRow>
          {interests.map((i) => (
            <Chip key={i}>{i}</Chip>
          ))}
        </ChipRow>
      )}
      <Actions>
        <Button variant="secondary" size="sm" onClick={() => onEdit(child.id)}>
          Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(child.id)}>
          Delete
        </Button>
      </Actions>
    </CardEl>
  );
}
