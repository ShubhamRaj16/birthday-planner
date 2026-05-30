// No React.lazy — all pages imported statically for SSR compatibility.
import { createRoutes } from './createRoutes';
import {
  DashboardPage,
  ChildrenPage,
  EventsPage,
  EventDetailPage,
  CalendarPage,
  RemindersPage,
  NotFoundPage,
} from './pageLoaders';

// Synchronous — no code splitting, keeps SSR hydration working correctly.
export async function createClientRoutes() {
  return createRoutes({
    DashboardPage,
    ChildrenPage,
    EventsPage,
    EventDetailPage,
    CalendarPage,
    RemindersPage,
    NotFoundPage,
  });
}
