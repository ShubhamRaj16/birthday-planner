import type { Event, Guest, Expense, Gift, Photo, Reminder, Child } from '../types';

export const aChild = (over: Partial<Child> = {}): Child => ({
  id: 1, name: 'Mia', dob: '2018-05-01', interests: 'dinos', allergies: null, photo: null, ...over,
} as Child);

export const anEvent = (over: Partial<Event> = {}): Event => ({
  id: 10, childId: 1, date: '2026-07-01', venue: 'Hall', address: null, theme: 'Jungle',
  budget: 20000, status: 'Active', myGateLink: null, cardPath: null, messageTemplate: null,
  notes: null, googlePhotosUrl: null, ...over,
} as Event);

export const aGuest = (over: Partial<Guest> = {}): Guest => ({
  id: 100, name: 'Alice', phone: '9876543210', rsvp: 'Pending', inviteSent: false,
  ageGroup: 'adult', dietary: '', ...over,
} as Guest);

export const anExpense = (over: Partial<Expense> = {}): Expense => ({
  id: 200, label: 'Cake', amount: 1500, category: 'cake', receiptPath: null, ...over,
} as Expense);

export const aGift = (over: Partial<Gift> = {}): Gift => ({
  id: 300, name: 'Lego', status: 'idea', source: null, ...over,
} as Gift);

export const aPhoto = (over: Partial<Photo> = {}): Photo => ({
  id: 400, storagePath: '/uploads/photos/10/x.jpg', caption: null, isCover: false, ...over,
} as Photo);

export const aReminder = (over: Partial<Reminder> = {}): Reminder => ({
  id: 500, label: 'Order cake', triggerAt: '2026-06-20T10:00:00Z', fired: false, ...over,
} as Reminder);
