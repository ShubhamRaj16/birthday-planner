// No lazy loading — all pages imported statically for SSR compatibility.
// React.lazy() is intentionally NOT used here; it breaks server-side rendering.
import DashboardPage from '../pages/Dashboard';
import ChildrenPage from '../pages/Children';
import EventsPage from '../pages/Events';
import EventDetailPage from '../pages/EventDetail';
import CalendarPage from '../pages/Calendar';
import RemindersPage from '../pages/Reminders';
import NotFoundPage from '../pages/NotFound';

export function getPageForPath(pathname) {
  if (pathname === '/') return DashboardPage;
  if (pathname === '/children') return ChildrenPage;
  if (pathname === '/events') return EventsPage;
  if (pathname.startsWith('/events/')) return EventDetailPage;
  if (pathname === '/calendar') return CalendarPage;
  if (pathname === '/reminders') return RemindersPage;
  return NotFoundPage;
}

export {
  DashboardPage,
  ChildrenPage,
  EventsPage,
  EventDetailPage,
  CalendarPage,
  RemindersPage,
  NotFoundPage,
};
