import type { MouseEvent } from 'react';
import styled from 'styled-components';
import type { Dayjs } from 'dayjs';
import { colors } from '../../design/tokens';

interface CalendarDay {
  date: Dayjs;
  otherMonth: boolean;
}
interface CalendarItems {
  birthdays: Array<{ child: { id: number; name: string }; color: string }>;
  events: Array<{ event: { id: number; theme?: string | null }; color: string }>;
}

interface Props {
  days: CalendarDay[];
  today: Dayjs;
  dateMap: Record<string, CalendarItems>;
  onDayClick: (
    e: MouseEvent<HTMLDivElement>,
    day: CalendarDay,
    items?: CalendarItems
  ) => void;
}

export type { CalendarDay, CalendarItems };

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
`;

const Cell = styled.div<{ $hasItems: boolean; $today: boolean; $otherMonth: boolean }>`
  min-height: 80px;
  border-right: 1px solid ${colors.bgLight};
  border-bottom: 1px solid ${colors.bgLight};
  padding: 4px;
  cursor: ${({ $hasItems }) => ($hasItems ? 'pointer' : 'default')};
  background: ${({ $today, $otherMonth }) =>
    $today ? colors.primaryLightest : $otherMonth ? colors.bgLightest : colors.white};
  transition: background 0.1s;
  &:hover {
    background: ${({ $otherMonth }) => ($otherMonth ? colors.bgLight : colors.primaryLightest)};
  }
  &:nth-child(7n) {
    border-right: none;
  }
`;

const DayNum = styled.div<{ $today: boolean; $otherMonth: boolean }>`
  font-size: 0.8rem;
  font-weight: ${({ $today }) => ($today ? '700' : '400')};
  color: ${({ $today, $otherMonth }) =>
    $today ? colors.primary : $otherMonth ? '#c4b5fd' : colors.textMuted};
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${({ $today }) => ($today ? colors.primaryLight : 'transparent')};
  margin-bottom: 2px;
`;

const DotRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-bottom: 2px;
`;
const Dot = styled.span<{ color: string }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ color }) => color};
  display: inline-block;
  flex-shrink: 0;
`;

const Pill = styled.div<{ color: string }>`
  background: ${({ color }) => color}22;
  color: ${({ color }) => color};
  border-left: 2px solid ${({ color }) => color};
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 1px 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
`;

export default function MonthGrid({ days, today, dateMap, onDayClick }: Props) {
  return (
    <Grid>
      {days.map((dayObj, i) => {
        const key = dayObj.date.format('YYYY-MM-DD');
        const items = dateMap[key];
        const isToday = dayObj.date.isSame(today, 'day');
        const hasBirthdays = (items?.birthdays?.length ?? 0) > 0;
        const hasEvents = (items?.events?.length ?? 0) > 0;
        return (
          <Cell
            key={i}
            $today={isToday}
            $otherMonth={dayObj.otherMonth}
            $hasItems={hasBirthdays || hasEvents}
            onClick={(e) => onDayClick(e, dayObj, items)}
          >
            <DayNum $today={isToday} $otherMonth={dayObj.otherMonth}>
              {dayObj.date.date()}
            </DayNum>
            {hasBirthdays && (
              <DotRow>
                {items.birthdays.map(({ child, color }) => (
                  <Dot key={child.id} color={color} title={`${child.name}'s birthday`} />
                ))}
              </DotRow>
            )}
            {hasEvents &&
              items.events.slice(0, 2).map(({ event, color }) => (
                <Pill key={event.id} color={color}>
                  {event.theme || 'Party'}
                </Pill>
              ))}
          </Cell>
        );
      })}
    </Grid>
  );
}
