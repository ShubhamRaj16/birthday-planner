import { useEffect, useState, type MouseEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import styled from 'styled-components';
import dayjs, { type Dayjs } from 'dayjs';
import { fetchEvents } from '../redux/slices/eventsSlice';
import { fetchChildren } from '../redux/slices/childrenSlice';
import { colors, radius, shadow } from '../design/tokens';
import MonthGrid, { type CalendarDay, type CalendarItems } from '../components/Calendar/MonthGrid';

const CHILD_COLORS = ['#7c3aed', '#0ea5e9', '#f59e0b', '#10b981', '#f43f5e'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PageTitle = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${colors.text};
  margin-bottom: 1.5rem;
`;
const Wrapper = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.borderLight};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${shadow.card};
`;
const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: ${colors.primary};
  color: ${colors.white};
`;
const MonthLabel = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
`;
const NavBtn = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: ${colors.white};
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  &:hover {
    background: rgba(255, 255, 255, 0.35);
  }
`;
const WeekRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: ${colors.primaryLighter};
  border-bottom: 1px solid ${colors.borderLight};
`;
const WeekDay = styled.div`
  text-align: center;
  padding: 0.5rem 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${colors.textSubtle};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;
const Popover = styled.div<{ $x: number; $y: number }>`
  position: fixed;
  background: ${colors.white};
  border: 1px solid ${colors.borderLight};
  border-radius: ${radius.lg};
  padding: 1rem 1.25rem;
  min-width: 220px;
  max-width: 300px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 100;
  top: ${({ $y }) => $y}px;
  left: ${({ $x }) => $x}px;
`;
const PopTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${colors.textMuted};
  margin: 0 0 0.5rem;
`;
const PopItem = styled.div`
  font-size: 0.82rem;
  color: ${colors.textMuted};
  padding: 3px 0;
  border-bottom: 1px solid ${colors.bgLight};
  &:last-child {
    border-bottom: none;
  }
`;
const CloseBtn = styled.button`
  position: absolute;
  top: 6px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${colors.textDisabled};
  font-size: 1rem;
  line-height: 1;
  &:hover {
    color: ${colors.textMuted};
  }
`;

interface PopoverState extends CalendarItems {
  x: number;
  y: number;
  date: Dayjs;
}

function getMonthDays(year: number, month: number): CalendarDay[] {
  const firstDay = dayjs(new Date(year, month, 1));
  const lastDay = firstDay.endOf('month');
  const days: CalendarDay[] = [];
  for (let i = firstDay.day() - 1; i >= 0; i--)
    days.push({ date: firstDay.subtract(i + 1, 'day'), otherMonth: true });
  for (let d = 1; d <= lastDay.date(); d++)
    days.push({ date: dayjs(new Date(year, month, d)), otherMonth: false });
  const rem = 7 - (days.length % 7);
  if (rem < 7)
    for (let i = 1; i <= rem; i++) days.push({ date: lastDay.add(i, 'day'), otherMonth: true });
  return days;
}

export default function Calendar() {
  const dispatch = useAppDispatch();
  const { items: events } = useAppSelector((s) => s.events);
  const { items: children } = useAppSelector((s) => s.children);
  const today = dayjs();
  const [viewYear, setViewYear] = useState(today.year());
  const [viewMonth, setViewMonth] = useState(today.month());
  const [popover, setPopover] = useState<PopoverState | null>(null);

  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchChildren());
  }, [dispatch]);

  const dateMap: Record<string, CalendarItems> = {};
  children.forEach((child, idx) => {
    if (!child.dob) return;
    const dob = dayjs(child.dob);
    const key = `${viewYear}-${String(dob.month() + 1).padStart(2, '0')}-${String(dob.date()).padStart(2, '0')}`;
    if (!dateMap[key]) dateMap[key] = { birthdays: [], events: [] };
    dateMap[key].birthdays.push({ child, color: CHILD_COLORS[idx % CHILD_COLORS.length] });
  });
  events.forEach((event) => {
    if (!event.date) return;
    const key = dayjs(event.date).format('YYYY-MM-DD');
    if (!dateMap[key]) dateMap[key] = { birthdays: [], events: [] };
    dateMap[key].events.push({ event, color: '#0ea5e9' });
  });

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
    setPopover(null);
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
    setPopover(null);
  }

  function handleDayClick(
    e: MouseEvent<HTMLDivElement>,
    dayObj: CalendarDay,
    items?: CalendarItems
  ) {
    if (!items || (items.birthdays.length === 0 && items.events.length === 0)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPopover({
      x: Math.min(rect.right + 4, window.innerWidth - 310),
      y: Math.min(rect.top, window.innerHeight - 200),
      date: dayObj.date,
      ...items,
    });
  }

  return (
    <div onClick={() => setPopover(null)}>
      <PageTitle>Calendar</PageTitle>
      <Wrapper onClick={(e) => e.stopPropagation()}>
        <Header>
          <NavBtn onClick={prevMonth}>&larr;</NavBtn>
          <MonthLabel>{dayjs(new Date(viewYear, viewMonth)).format('MMMM YYYY')}</MonthLabel>
          <NavBtn onClick={nextMonth}>&rarr;</NavBtn>
        </Header>
        <WeekRow>
          {WEEKDAYS.map((d) => (
            <WeekDay key={d}>{d}</WeekDay>
          ))}
        </WeekRow>
        <MonthGrid
          days={getMonthDays(viewYear, viewMonth)}
          today={today}
          dateMap={dateMap}
          onDayClick={handleDayClick}
        />
      </Wrapper>
      {popover && (
        <Popover $x={popover.x} $y={popover.y} onClick={(e) => e.stopPropagation()}>
          <CloseBtn onClick={() => setPopover(null)}>&times;</CloseBtn>
          <PopTitle>{popover.date.format('MMMM D, YYYY')}</PopTitle>
          {popover.birthdays.map(({ child, color }) => (
            <PopItem key={child.id} style={{ color }}>
              {child.name}&apos;s Birthday
            </PopItem>
          ))}
          {popover.events.map(({ event }) => (
            <PopItem key={event.id}>{event.theme || 'Party'}</PopItem>
          ))}
        </Popover>
      )}
    </div>
  );
}
