import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { fetchUnreadCount } from '../redux/slices/remindersSlice';

const Nav = styled.nav`
  background-color: #7c3aed;
  padding: 0 1.5rem;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
`;

const Brand = styled(Link)`
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.1rem;
  margin-right: 1.5rem;
  flex-shrink: 0;

  &:hover {
    color: #e9d5ff;
  }
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  color: ${({ $active }) => ($active ? '#e9d5ff' : 'rgba(255,255,255,0.8)')};
  text-decoration: none;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  background: ${({ $active }) => ($active ? 'rgba(255,255,255,0.15)' : 'transparent')};
  transition:
    background 0.15s,
    color 0.15s;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }
`;

const Badge = styled.span`
  background: #f43f5e;
  color: #fff;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0 5px;
  min-width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
`;

export default function Header() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const unreadCount = useAppSelector((state) => state.reminders.unreadCount);

  // SCRUM-37: poll unread reminder count every 60s (matches backend cron) + on navigation
  useEffect(() => {
    dispatch(fetchUnreadCount());
    const timer = setInterval(() => dispatch(fetchUnreadCount()), 60000);
    return () => clearInterval(timer);
  }, [dispatch, location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <Nav>
      <Brand to="/">Birthday Planner</Brand>
      <NavLink to="/" $active={isActive('/')}>
        Dashboard
      </NavLink>
      <NavLink to="/children" $active={isActive('/children')}>
        Children
      </NavLink>
      <NavLink to="/events" $active={isActive('/events')}>
        Events
      </NavLink>
      <NavLink to="/calendar" $active={isActive('/calendar')}>
        Calendar
      </NavLink>
      <NavLink to="/reminders" $active={isActive('/reminders')}>
        Reminders
        {unreadCount > 0 && <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>}
      </NavLink>
    </Nav>
  );
}
