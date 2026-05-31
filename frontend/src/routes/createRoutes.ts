import { ComponentType } from 'react';

interface RouteConfig {
  path: string;
  element: ComponentType<any>;
}

interface RouteParams {
  DashboardPage: ComponentType<any>;
  ChildrenPage: ComponentType<any>;
  EventsPage: ComponentType<any>;
  EventDetailPage: ComponentType<any>;
  CalendarPage: ComponentType<any>;
  RemindersPage: ComponentType<any>;
  NotFoundPage: ComponentType<any>;
}

export function createRoutes({
  DashboardPage,
  ChildrenPage,
  EventsPage,
  EventDetailPage,
  CalendarPage,
  RemindersPage,
  NotFoundPage,
}: RouteParams): RouteConfig[] {
  return [
    { path: '/', element: DashboardPage },
    { path: '/children', element: ChildrenPage },
    { path: '/events', element: EventsPage },
    { path: '/events/:id', element: EventDetailPage },
    { path: '/calendar', element: CalendarPage },
    { path: '/reminders', element: RemindersPage },
    { path: '*', element: NotFoundPage },
  ];
}
