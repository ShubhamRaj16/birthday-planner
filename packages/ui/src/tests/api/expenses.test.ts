import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import http from '../../api/http';
import { expensesApi } from '../../api/expenses.api';
import { ok } from '../../test/mockHttp';
import { anExpense } from '../../test/fixtures';

const mockHttp = vi.mocked(http);
beforeEach(() => vi.clearAllMocks());

describe('expensesApi.uploadReceipt', () => {
  it('posts FormData receipt to the nested endpoint and returns expense', async () => {
    const exp = anExpense({ receiptPath: '/uploads/receipts/r.png' });
    mockHttp.post.mockResolvedValue(ok(exp));
    const file = new File(['x'], 'r.png', { type: 'image/png' });

    const result = await expensesApi.uploadReceipt(10, 200, file);

    expect(result).toEqual(exp);
    const [url, body, config] = mockHttp.post.mock.calls[0];
    expect(url).toBe('/events/10/expenses/200/receipt');
    expect((body as FormData).get('receipt')).toBe(file);
    expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
  });
});
