// ─── Domain types (API JSON shapes — dates are ISO strings over the wire) ──────

export interface Child {
  id: number;
  name: string;
  dob: string;
  photo: string | null;
  interests: string | null;
  allergies: string | null;
  school: string | null;
  events?: Event[];
  createdAt: string;
  updatedAt: string;
}

export type EventStatus = 'Draft' | 'Active' | 'Completed';

export interface Event {
  id: number;
  childId: number;
  child?: Child;
  date: string;
  venue: string | null;
  address: string | null;
  theme: string | null;
  budget: number | null;
  status: EventStatus;
  myGateLink: string | null;
  cardPath: string | null;
  messageTemplate: string | null;
  notes: string | null;
  googlePhotosUrl: string | null;
  tasks?: Task[];
  reminders?: Reminder[];
  photos?: Photo[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  eventId: number;
  title: string;
  category: string;
  dueDate: string | null;
  done: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type RsvpStatus = 'Pending' | 'Confirmed' | 'Declined';

export interface Guest {
  id: number;
  eventId: number;
  name: string;
  phone: string | null;
  ageGroup: string | null;
  dietary: string | null;
  rsvp: RsvpStatus;
  inviteSent: boolean;
  inviteSentAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: number;
  eventId: number;
  label: string;
  amount: number;
  category: string;
  paid: boolean;
  receiptPath: string | null;
  date: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type GiftStatus = 'idea' | 'bought' | 'received';

export interface Gift {
  id: number;
  eventId: number;
  name: string;
  description: string | null;
  price: number | null;
  source: 'manual' | 'ai';
  status: GiftStatus;
  givenBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: number;
  eventId: number | null;
  triggerAt: string;
  fired: boolean;
  label: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: number;
  eventId: number;
  storagePath: string;
  caption: string | null;
  isCover: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  total: number;
  paid: number;
  unpaid: number;
  byCategory: Array<{ category: string; amount: number }>;
}

// ─── API envelope ─────────────────────────────────────────────────────────────
export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  data: T;
  error: ApiError | null;
  meta: Record<string, unknown>;
}

// ─── Redux state slices ───────────────────────────────────────────────────────
export interface ChildrenState {
  items: Child[];
  current: Child | null;
  loading: boolean;
  error: string | null;
}

export interface EventsState {
  items: Event[];
  current: Event | null;
  loading: boolean;
  error: string | null;
}

export interface RemindersState {
  items: Reminder[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export interface GuestsState {
  byEventId: Record<number, Guest[]>;
  loading: boolean;
  error: string | null;
}

export interface ExpensesState {
  byEventId: Record<number, Expense[]>;
  summaryByEventId: Record<number, ExpenseSummary>;
  loading: boolean;
  error: string | null;
}

export interface GiftsState {
  byEventId: Record<number, Gift[]>;
  loading: boolean;
  error: string | null;
}

export interface PhotosState {
  byEventId: Record<number, Photo[]>;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  children: ChildrenState;
  events: EventsState;
  reminders: RemindersState;
  guests: GuestsState;
  expenses: ExpensesState;
  gifts: GiftsState;
  photos: PhotosState;
}
