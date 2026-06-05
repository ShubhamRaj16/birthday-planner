import styled from 'styled-components';
import dayjs from 'dayjs';
import { mediaUrl } from '../../lib/media';
import { colors, spacing, radius, shadow } from '../../design/tokens';
import type { Child } from '../../types';

interface Props {
  child: Child;
}

const Card = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.borderLight};
  border-radius: ${radius.lg};
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: ${spacing.lg};
  box-shadow: ${shadow.card};
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

const CardInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const Name = styled.p`
  font-weight: 600;
  color: ${colors.text};
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DaysUntil = styled.p<{ $soon: boolean }>`
  font-size: 0.8rem;
  color: ${({ $soon }) => ($soon ? '#f59e0b' : colors.textSubtle)};
  margin-top: 2px;
`;

function getDaysUntil(dobStr: string | null) {
  if (!dobStr) return null;
  const today = dayjs();
  let next = dayjs(dobStr).year(today.year());
  if (next.isBefore(today, 'day')) next = next.add(1, 'year');
  return next.diff(today, 'day');
}

function birthdayLabel(days: number | null) {
  if (days === 0) return 'Birthday today!';
  if (days === 1) return 'Birthday tomorrow!';
  if (days !== null) return `Birthday in ${days} day${days !== 1 ? 's' : ''}`;
  return 'No birthday set';
}

export default function ChildBirthdayCard({ child }: Props) {
  const days = getDaysUntil(child.dob);
  const initial = (child.name || '?')[0].toUpperCase();

  return (
    <Card>
      <Avatar>
        {child.photo ? <img src={mediaUrl(child.photo)} alt={child.name} /> : initial}
      </Avatar>
      <CardInfo>
        <Name>{child.name}</Name>
        <DaysUntil $soon={days !== null && days <= 30}>{birthdayLabel(days)}</DaysUntil>
      </CardInfo>
    </Card>
  );
}
