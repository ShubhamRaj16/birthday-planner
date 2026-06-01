import { useEffect, useState, type MouseEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import styled from 'styled-components';
import dayjs, { type Dayjs } from 'dayjs';
import { fetchEvents } from '../redux/slices/eventsSlice';
import { fetchChildren } from '../redux/slices/childrenSlice';
import type { Child, Event } from '../types';

interface CalendarDay {
  date: Dayjs;
  otherMonth: boolean;
}

interface CalendarItems {
  birthdays: Array<{ child: Child; color: string }>;
  events: Array<{ event: Event; color: string }>;
}

interface PopoverState extends CalendarItems {
  x: number;
  y: number;
  date: Dayjs;
}

const CHILD_COLORS = ['#7c3aed', '#0ea5e9', '#f59e0b', '#10b981', '#f43f5e'];

const PageTitle = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const CalendarWrapper = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: #7c3aed;
  color: #fff;
`;

const MonthLabel = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
`;

const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.35);
  }
`;

const WeekRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f5f3ff;
  border-bottom: 1px solid #e5e7eb;
`;

const WeekDay = styled.div`
  text-align: center;
  padding: 0.5rem 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
`;

const DayCell = styled.div<{ $hasItems: boolean; $today: boolean; $otherMonth: boolean }>`
  min-height: 80px;
  border-right: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
  padding: 4px;
  cursor: ${({ $hasItems }) => ($hasItems ? 'pointer' : 'default')};
  background: ${({ $today, $otherMonth }) =>
    $today ? '#faf5ff' : $otherMonth ? '#f9fafb' : '#fff'};
  transition: background 0.1s;

  &:hover {
    background: ${({ $otherMonth }) => ($otherMonth ? '#f3f4f6' : '#faf5ff')};
  }

  &:nth-child(7n) {
    border-right: none;
  }
`;

const DayNumber = styled.div<{ $today: boolean; $otherMonth: boolean }>`
  font-size: 0.8rem;
  font-weight: ${({ $today }) => ($today ? '700' : '400')};
  color: ${({ $today, $otherMonth }) =>
    $today ? '#7c3aed' : $otherMonth ? '#c4b5fd' : '#374151'};
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${({ $today }) => ($today ? '#ede9fe' : 'transparent')};
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

const EventPill = styled.div<{ color: string }>`
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

const Popover = styled.div<{ $x: number; $y: number }>`
  position: fixed;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  min-width: 220px;
  max-width: 300px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 100;
  top: ${({ $y }) => $y}px;
  left: ${({ $x }) => $x}px;
`;

const PopoverTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem;
`;

const PopoverItem = styled.div`
  font-size: 0.82rem;
  color: #374151;
  padding: 3px 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 6px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 1rem;
  line-height: 1;

  &:hover {
    color: #374151;
  }
`;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthDays(year: number, month: number): CalendarDay[] {
  // month is 0-indexed for dayjs
  const firstDay = dayjs(new Date(year, month, 1));
  const lastDay = firstDay.endOf('month');
  const startOffset = firstDay.day(); // 0=Sun
  const days: CalendarDay[] = [];

  // days from previous month
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({ date: firstDay.subtract(i + 1, 'day'), otherMonth: true });
  }
  // days of current month
  for (let d = 1; d <= lastDay.date(); d++) {
    days.push({ date: dayjs(new Date(year, month, d)), otherMonth: false });
  }
  // pad to complete grid (multiple of 7)
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: lastDay.add(i, 'day'), otherMonth: true });
    }
  }
  return days;
}

export default function Calendar() {
  const dispatch = useAppDispatch();
  const { items: events } = useAppSelector((state) => state.events);
  const { items: children } = useAppSelector((state) => state.children);

  const today = dayjs();
  const [viewYear, setViewYear] = useState(today.year());
  const [viewMonth, setViewMonth] = useState(today.month()); // 0-indexed

  const [popover, setPopover] = useState<PopoverState | null>(null);

  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchChildren());
  }, [dispatch]);

  // Build a map: dateKey -> { birthdays: [], events: [] }
  const dateMap: Record<string, CalendarItems> = {};

  children.forEach((child, idx) => {
    if (!child.dob) return;
    const dob = dayjs(child.dob);
    // Project birthday onto current view year
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

  const days = getMonthDays(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
    setPopover(null);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
    setPopover(null);
  }

  function handleDayClick(
    e: MouseEvent<HTMLDivElement>,
    dayObj: CalendarDay,
    items?: CalendarItems,
  ) {
    if (!items || (items.birthdays.length === 0 && items.events.length === 0)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(rect.right + 4, window.innerWidth - 310);
    const y = Math.min(rect.top, window.innerHeight - 200);
    setPopover({ x, y, date: dayObj.date, ...items });
  }

  return (
    <div onClick={() => setPopover(null)}>
      <PageTitle>Calendar</PageTitle>

      <CalendarWrapper onClick={(e) => e.stopPropagation()}>
        <CalendarHeader>
          <NavButton onClick={prevMonth}>&larr;</NavButton>
          <MonthLabel>
            {dayjs(new Date(viewYear, viewMonth)).format('MMMM YYYY')}
          </MonthLabel>
          <NavButton onClick={nextMonth}>&rarr;</NavButton>
        </CalendarHeader>

        <WeekRow>
          {WEEKDAYS.map((d) => (
            <WeekDay key={d}>{d}</WeekDay>
          ))}
        </WeekRow>

        <CalendarGrid>
          {days.map((dayObj, i) => {
            const key = dayObj.date.format('YYYY-MM-DD');
            const items = dateMap[key];
            const isToday = dayObj.date.isSame(today, 'day');
            const hasBirthdays = items?.birthdays?.length > 0;
            const hasEvents = items?.events?.length > 0;
            const hasItems = hasBirthdays || hasEvents;

            return (
              <DayCell
                key={i}
                $today={isToday}
                $otherMonth={dayObj.otherMonth}
                $hasItems={hasItems}
                onClick={(e) => handleDayClick(e, dayObj, items)}
              >
                <DayNumber $today={isToday} $otherMonth={dayObj.otherMonth}>
                  {dayObj.date.date()}
                </DayNumber>
                {hasBirthdays && (
                  <DotRow>
                    {items.birthdays.map(({ child, color }) => (
                      <Dot key={child.id} color={color} title={`${child.name}'s birthday`} />
                    ))}
                  </DotRow>
                )}
                {hasEvents &&
                  items.events.slice(0, 2).map(({ event, color }) => (
                    <EventPill key={event.id} color={color}>
                      {event.theme || 'Party'}
                    </EventPill>
                  ))}
              </DayCell>
            );
          })}
        </CalendarGrid>
      </CalendarWrapper>

      {popover && (
        <Popover $x={popover.x} $y={popover.y} onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={() => setPopover(null)}>&times;</CloseButton>
          <PopoverTitle>{popover.date.format('MMMM D, YYYY')}</PopoverTitle>
          {popover.birthdays.map(({ child, color }) => (
            <PopoverItem key={child.id} style={{ color }}>
              {child.name}&apos;s Birthday
            </PopoverItem>
          ))}
          {popover.events.map(({ event }) => (
            <PopoverItem key={event.id}>
              {event.theme || 'Party'}
              {event.child?.name ? ` (${event.child.name})` : ''}
              {event.venue ? ` @ ${event.venue}` : ''}
            </PopoverItem>
          ))}
        </Popover>
      )}

      <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
          <Dot color="#7c3aed" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />
          Coloured dots = birthdays
        </span>
        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
          <EventPill color="#0ea5e9" style={{ display: 'inline-block', marginRight: 4 }}>
            Event
          </EventPill>
          Blue pills = events
        </span>
      </div>
    </div>
  );
}
