import type { Request } from 'express';
import type {
  Child, Event, Task, Reminder, Guest, Expense, Gift, Photo,
} from '@prisma/client';

// SQLite has no enums — Event.status is a String. Model the allowed values here.
export type EventStatus = 'Draft' | 'Active' | 'Completed';

// ─── Re-export Prisma model types ─────────────────────────────────────────────
export type { Child, Event, Task, Reminder, Guest, Expense, Gift, Photo };

// ─── API response envelope ────────────────────────────────────────────────────
export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta: Record<string, unknown>;
}

// ─── Service input types (backend only) ──────────────────────────────────────
export interface CreateChildInput {
  name: string;
  dob: string;
  photo?: string;
  interests?: string;
  allergies?: string;
  school?: string;
}

export interface UpdateChildInput {
  name?: string;
  dob?: string;
  photo?: string;
  interests?: string;
  allergies?: string;
  school?: string;
}

export interface CreateEventInput {
  childId: number;
  date: string;
  venue?: string;
  address?: string;
  theme?: string;
  budget?: number | string;
  myGateLink?: string;
  messageTemplate?: string;
  notes?: string;
}

export interface UpdateEventInput {
  date?: string;
  venue?: string;
  address?: string;
  theme?: string;
  budget?: number | string | null;
  myGateLink?: string;
  cardPath?: string;
  messageTemplate?: string;
  notes?: string;
  googlePhotosUrl?: string | null;
}

export interface CreateGuestInput {
  name: string;
  phone?: string;
  ageGroup?: string;
  dietary?: string;
  rsvp?: string;
  notes?: string;
}

export interface UpdateGuestInput {
  name?: string;
  phone?: string;
  ageGroup?: string;
  dietary?: string;
  rsvp?: string;
  inviteSent?: boolean;
  notes?: string;
}

export interface CreateExpenseInput {
  label: string;
  amount: number | string;
  category?: string;
  paid?: boolean;
  notes?: string;
  date?: string;
}

export interface UpdateExpenseInput {
  label?: string;
  amount?: number | string;
  category?: string;
  paid?: boolean;
  notes?: string;
  receiptPath?: string;
}

export interface CreateGiftInput {
  name: string;
  description?: string;
  price?: number | string | null;
  source?: 'manual' | 'ai';
  status?: 'idea' | 'bought' | 'received';
  givenBy?: string;
  notes?: string;
}

export interface UpdateGiftInput {
  name?: string;
  description?: string;
  price?: number | string | null;
  status?: 'idea' | 'bought' | 'received';
  givenBy?: string;
  notes?: string;
}

export interface CreateReminderInput {
  eventId?: number | null;
  triggerAt: string | Date;
  label: string;
  type?: string;
}

export interface UpdateReminderInput {
  triggerAt?: string | Date;
  label?: string;
  fired?: boolean;
}

export interface ExpenseSummary {
  total: number;
  paid: number;
  unpaid: number;
  byCategory: Array<{ category: string; amount: number }>;
}

// ─── AI types ─────────────────────────────────────────────────────────────────
export type SuggestionType = 'themes' | 'activities' | 'gifts' | 'venue' | 'catering' | 'message';

export interface AiContext {
  childName: string;
  age: string;
  interests: string | null;
  allergies: string | null;
  theme: string | null;
  venue: string | null;
}

export interface SuggestionResult {
  type: SuggestionType;
  suggestions: string[];
}

// ─── WhatsApp types ───────────────────────────────────────────────────────────
export interface WaLinkResult {
  link: string;
  message: string;
  guest: Guest;
  event: Event;
}

export interface MessageContext {
  guestName: string;
  event: Partial<Event>;
  child: Partial<Child> | null;
}

// ─── Multer request augmentation ─────────────────────────────────────────────
export interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// ─── Task defaults ────────────────────────────────────────────────────────────
export interface TaskDefault {
  title: string;
  category: string;
  daysOffset: number;
}
