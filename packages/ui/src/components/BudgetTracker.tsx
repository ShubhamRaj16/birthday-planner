import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Expense } from '../types';
import { mediaUrl } from '../lib/media';
import { expensesApi } from '../api/expenses.api';
import { toCsv, downloadCsv, fileSlug } from '../lib/csv';
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../redux/slices/expensesSlice';

interface BudgetTrackerProps {
  eventId: number;
  eventBudget?: number | string | null;
  eventTheme?: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'venue',
  'catering',
  'cake',
  'decorations',
  'return gifts',
  'entertainment',
  'photography',
  'invites/printing',
  'miscellaneous',
];

// ─── Styled components ────────────────────────────────────────────────────────

const Wrapper = styled.div`
  padding: 0.25rem 0;
`;

const SummaryBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-radius: 10px;
  padding: 0.85rem 1.25rem;
  margin-bottom: 1rem;
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const SummaryLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  color: #7c3aed;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const SummaryValue = styled.span`
  font-size: 1.05rem;
  font-weight: 700;
  color: #1f2937;
`;

const AlertBanner = styled.div<{ $level: 'over' | 'warn' }>`
  padding: 0.65rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1rem;

  background: ${({ $level }) => ($level === 'over' ? '#fee2e2' : '#fef3c7')};
  color: ${({ $level }) => ($level === 'over' ? '#991b1b' : '#92400e')};
  border: 1px solid ${({ $level }) => ($level === 'over' ? '#fca5a5' : '#fde68a')};
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  margin-bottom: 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.5rem 0.75rem;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
  color: #111827;
`;

const CategoryChip = styled.span`
  background: #ede9fe;
  color: #5b21b6;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: capitalize;
`;

const PaidCheckbox = styled.input`
  accent-color: #7c3aed;
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 2px 6px;
  border-radius: 4px;

  &:hover { background: #fee2e2; }
`;

const FormSection = styled.div`
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
`;

const FormTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #5b21b6;
  margin-bottom: 0.75rem;
`;

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: flex-end;
  margin-bottom: 0.5rem;
`;

const FormInput = styled.input`
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font-size: 0.875rem;
  color: #111827;
  flex: 1 1 140px;
  min-width: 100px;

  &:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 2px #ede9fe;
  }
`;

const FormSelect = styled.select`
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font-size: 0.875rem;
  color: #111827;
  flex: 1 1 160px;
  min-width: 130px;
  background: #fff;

  &:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 2px #ede9fe;
  }
`;

const CheckLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
`;

const PrimaryBtn = styled.button`
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.45rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;

  &:hover { background: #6d28d9; }
  &:disabled { background: #c4b5fd; cursor: not-allowed; }
`;

const ChartSection = styled.div`
  margin-top: 1.5rem;
`;

const ChartTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
`;

const ErrorMsg = styled.p`
  color: #b91c1c;
  font-size: 0.82rem;
  margin-top: 0.4rem;
`;

const EmptyMsg = styled.p`
  color: #9ca3af;
  font-size: 0.875rem;
  padding: 0.75rem 0;
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function BudgetTracker({ eventId, eventBudget, eventTheme }: BudgetTrackerProps) {
  const dispatch = useAppDispatch();
  const expenses = useAppSelector((state) => state.expenses.byEventId[eventId] || []);
  const summary = useAppSelector((state) => state.expenses.summaryByEventId[eventId]);
  const expError = useAppSelector((state) => state.expenses.error);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ label: '', amount: '', category: 'miscellaneous', paid: false });
  const [formError, setFormError] = useState('');
  const [adding, setAdding] = useState(false);
  // SCRUM-40: receipt upload state
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [receiptError, setReceiptError] = useState('');
  const receiptRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    if (eventId) dispatch(fetchExpenses(eventId));
  }, [eventId, dispatch]);

  const budget = Number(eventBudget) || 0;
  const spent = summary?.total ?? expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const unpaid = expenses.filter((e) => !e.paid).reduce((s, e) => s + Number(e.amount || 0), 0);
  const remaining = budget - spent;
  const pct = budget > 0 ? (spent / budget) * 100 : 0;

  // Category breakdown for chart
  const categoryData = CATEGORIES.map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    amount: expenses
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + Number(e.amount || 0), 0),
  })).filter((c) => c.amount > 0);

  async function handleAddExpense(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.label.trim()) { setFormError('Label is required.'); return; }
    if (!form.amount || isNaN(Number(form.amount))) { setFormError('Valid amount is required.'); return; }
    setFormError('');
    setAdding(true);
    try {
      await dispatch(createExpense({ eventId, data: { ...form, amount: Number(form.amount) } })).unwrap();
      dispatch(fetchExpenses(eventId));
      setForm({ label: '', amount: '', category: 'miscellaneous', paid: false });
      setAddOpen(false);
    } catch (err) {
      setFormError(String(err || 'Failed to add expense.'));
    } finally {
      setAdding(false);
    }
  }

  async function handlePaidToggle(expense: Expense) {
    dispatch(updateExpense({ eventId, id: expense.id, data: { paid: !expense.paid } }));
  }

  async function handleDelete(expenseId: number) {
    if (!window.confirm('Delete this expense?')) return;
    await dispatch(deleteExpense({ eventId, id: expenseId })).unwrap();
    dispatch(fetchExpenses(eventId));
  }

  // SCRUM-40: upload a receipt for an expense (backend multer endpoint)
  async function handleReceiptUpload(expenseId: number, file: File) {
    if (file.size > 5 * 1024 * 1024) { setReceiptError('Receipt must be under 5 MB.'); return; }
    setReceiptError('');
    setUploadingId(expenseId);
    try {
      await expensesApi.uploadReceipt(eventId, expenseId, file);
      dispatch(fetchExpenses(eventId));
    } catch {
      setReceiptError('Receipt upload failed.');
    } finally {
      setUploadingId(null);
    }
  }

  // SCRUM-48: export expenses to CSV
  function exportExpenses() {
    const csv = toCsv<Expense>(
      [
        { key: 'label', label: 'Label' },
        { key: 'category', label: 'Category' },
        { key: 'amount', label: 'Amount' },
        { key: 'paid', label: 'Paid' },
        { key: 'date', label: 'Date' },
        { key: 'notes', label: 'Notes' },
      ],
      expenses,
    );
    downloadCsv(`expenses-${fileSlug(eventTheme)}-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <Wrapper>
      {/* Summary bar */}
      <SummaryBar>
        <SummaryItem>
          <SummaryLabel>Budget</SummaryLabel>
          <SummaryValue>&#x20B9;{budget.toLocaleString()}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Spent</SummaryLabel>
          <SummaryValue>&#x20B9;{spent.toLocaleString()}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Remaining</SummaryLabel>
          <SummaryValue style={{ color: remaining < 0 ? '#dc2626' : '#059669' }}>
            &#x20B9;{remaining.toLocaleString()}
          </SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Unpaid</SummaryLabel>
          <SummaryValue style={{ color: unpaid > 0 ? '#d97706' : '#374151' }}>
            &#x20B9;{unpaid.toLocaleString()}
          </SummaryValue>
        </SummaryItem>
      </SummaryBar>

      {/* Budget alert */}
      {budget > 0 && pct >= 100 && (
        <AlertBanner $level="over">
          Budget exceeded! You have spent &#x20B9;{spent.toLocaleString()} of your &#x20B9;{budget.toLocaleString()} budget ({Math.round(pct)}%).
        </AlertBanner>
      )}
      {budget > 0 && pct >= 80 && pct < 100 && (
        <AlertBanner $level="warn">
          You have used {Math.round(pct)}% of your budget. Only &#x20B9;{remaining.toLocaleString()} remaining.
        </AlertBanner>
      )}

      {/* Add button */}
      <FormRow style={{ marginBottom: '1rem' }}>
        <PrimaryBtn onClick={() => setAddOpen((v) => !v)}>
          {addOpen ? 'Cancel' : '+ Add Expense'}
        </PrimaryBtn>
        <PrimaryBtn
          onClick={exportExpenses}
          disabled={expenses.length === 0}
          style={{ background: '#fff', color: '#7c3aed', border: '1.5px solid #7c3aed' }}
        >
          Export CSV
        </PrimaryBtn>
      </FormRow>
      {receiptError && <ErrorMsg>{receiptError}</ErrorMsg>}

      {/* Add expense form */}
      {addOpen && (
        <FormSection>
          <FormTitle>Add Expense</FormTitle>
          <form onSubmit={handleAddExpense}>
            <FormRow>
              <FormInput
                placeholder="Label *"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
              <FormInput
                type="number"
                placeholder="Amount &#x20B9; *"
                value={form.amount}
                min="0"
                step="1"
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
              <FormSelect
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </FormSelect>
              <CheckLabel>
                <PaidCheckbox
                  type="checkbox"
                  checked={form.paid}
                  onChange={(e) => setForm({ ...form, paid: e.target.checked })}
                />
                Paid
              </CheckLabel>
              <PrimaryBtn type="submit" disabled={adding}>
                {adding ? 'Adding...' : 'Add'}
              </PrimaryBtn>
            </FormRow>
            {formError && <ErrorMsg>{formError}</ErrorMsg>}
          </form>
        </FormSection>
      )}

      {/* Expense table */}
      {expenses.length === 0 ? (
        <EmptyMsg>No expenses logged yet.</EmptyMsg>
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Label</Th>
                <Th>Category</Th>
                <Th>Amount</Th>
                <Th>Paid</Th>
                <Th>Receipt</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <Td>{exp.label}</Td>
                  <Td><CategoryChip>{exp.category}</CategoryChip></Td>
                  <Td>&#x20B9;{Number(exp.amount).toLocaleString()}</Td>
                  <Td>
                    <PaidCheckbox
                      type="checkbox"
                      checked={!!exp.paid}
                      onChange={() => handlePaidToggle(exp)}
                      title="Toggle paid status"
                    />
                  </Td>
                  <Td>
                    {exp.receiptPath ? (
                      <a href={mediaUrl(exp.receiptPath)} target="_blank" rel="noopener noreferrer"
                         style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 600 }}>
                        View
                      </a>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => receiptRefs.current[exp.id]?.click()}
                          disabled={uploadingId === exp.id}
                          style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, padding: 0 }}
                        >
                          {uploadingId === exp.id ? 'Uploading…' : '📎 Attach'}
                        </button>
                        <input
                          ref={(el) => { receiptRefs.current[exp.id] = el; }}
                          type="file"
                          accept="image/*,application/pdf"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleReceiptUpload(exp.id, f);
                          }}
                        />
                      </>
                    )}
                  </Td>
                  <Td>
                    <DeleteBtn onClick={() => handleDelete(exp.id)} title="Delete expense">
                      &#10005;
                    </DeleteBtn>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {/* Category bar chart */}
      {categoryData.length > 0 && (
        <ChartSection>
          <ChartTitle>Spending by Category</ChartTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} margin={{ top: 4, right: 16, left: 0, bottom: 40 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Spent']}
              />
              <Bar dataKey="amount" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      )}

      {expError && <ErrorMsg>{expError}</ErrorMsg>}
    </Wrapper>
  );
}
