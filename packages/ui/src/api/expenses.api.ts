import http from './http';
import type { ApiResponse, Expense } from '../types';

// ─── Expenses repository ──────────────────────────────────────────────────────
// Standard expense CRUD lives in expensesSlice; this covers the multipart
// receipt upload that can't go through a plain JSON thunk.

/** Upload a receipt image for an expense. */
export async function uploadReceipt(
  eventId: number,
  expenseId: number,
  file: File,
): Promise<Expense> {
  const fd = new FormData();
  fd.append('receipt', file);
  const res = await http.post<ApiResponse<Expense>>(
    `/events/${eventId}/expenses/${expenseId}/receipt`,
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data.data;
}

export const expensesApi = { uploadReceipt };
