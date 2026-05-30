import DashboardPage from '../pages/Dashboard';
import ChildrenPage from '../pages/Children';
import EventsPage from '../pages/Events';
import EventDetailPage from '../pages/EventDetail';
import CalendarPage from '../pages/Calendar';
import RemindersPage from '../pages/Reminders';
import NotFoundPage from '../pages/NotFound';
import { createRoutes } from './createRoutes';

export const serverRoutes = createRoutes({
  DashboardPage,
  ChildrenPage,
  EventsPage,
  EventDetailPage,
  CalendarPage,
  RemindersPage,
  NotFoundPage,
});
