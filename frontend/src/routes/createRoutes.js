export function createRoutes({
  DashboardPage,
  ChildrenPage,
  EventsPage,
  EventDetailPage,
  CalendarPage,
  RemindersPage,
  NotFoundPage,
}) {
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
