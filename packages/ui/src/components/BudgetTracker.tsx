import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import styled from 'styled-components';
import type { Expense } from '../types';
import { expensesApi } from '../api/expenses.api';
import { toCsv, downloadCsv, fileSlug } from '../lib/csv';
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../redux/slices/expensesSlice';
import { Button, Table, Th } from './ui';
import { colors, spacing } from '../design/tokens';
import BudgetSummary from './BudgetTracker/BudgetSummary';
import BudgetChart from './BudgetTracker/BudgetChart';
import ExpenseRow from './BudgetTracker/ExpenseRow';
import ExpenseForm from './BudgetTracker/ExpenseForm';

interface Props {
  eventId: number;
  eventBudget?: number | string | null;
  eventTheme?: string | null;
}

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

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.lg};
`;
const Msg = styled.p<{ $error?: boolean }>`
  color: ${({ $error }) => ($error ? colors.error : colors.success)};
  font-size: 0.82rem;
  margin-top: 0.4rem;
`;
const EmptyMsg = styled.p`
  color: ${colors.textDisabled};
  font-size: 0.875rem;
  padding: ${spacing.md} 0;
`;
const TableWrapper = styled.div`
  overflow-x: auto;
  margin-bottom: 1.5rem;
`;

export default function BudgetTracker({ eventId, eventBudget, eventTheme }: Props) {
  const dispatch = useAppDispatch();
  const expenses = useAppSelector((s) => s.expenses.byEventId[eventId] || []);
  const summary = useAppSelector((s) => s.expenses.summaryByEventId[eventId]);
  const expError = useAppSelector((s) => s.expenses.error);

  const [addOpen, setAddOpen] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [receiptError, setReceiptError] = useState('');

  useEffect(() => {
    if (eventId) dispatch(fetchExpenses(eventId));
  }, [eventId, dispatch]);

  const budget = Number(eventBudget) || 0;
  const spent = summary?.total ?? expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const unpaid = expenses.filter((e) => !e.paid).reduce((s, e) => s + Number(e.amount || 0), 0);

  const categoryData = CATEGORIES.map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    amount: expenses
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + Number(e.amount || 0), 0),
  })).filter((c) => c.amount > 0);

  async function handleAddExpense(data: { label: string; amount: number; category: string; paid: boolean }) {
    await dispatch(createExpense({ eventId, data })).unwrap();
    dispatch(fetchExpenses(eventId));
    setAddOpen(false);
  }

  async function handleReceiptUpload(expenseId: number, file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setReceiptError('Receipt must be under 5 MB.');
      return;
    }
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
      expenses
    );
    downloadCsv(
      `expenses-${fileSlug(eventTheme)}-${new Date().toISOString().slice(0, 10)}.csv`,
      csv
    );
  }

  return (
    <div style={{ padding: '0.25rem 0' }}>
      <BudgetSummary budget={budget} spent={spent} unpaid={unpaid} />

      <ActionRow>
        <Button
          size="sm"
          variant={addOpen ? 'secondary' : 'primary'}
          onClick={() => setAddOpen((v) => !v)}
        >
          {addOpen ? 'Cancel' : '+ Add Expense'}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={exportExpenses}
          disabled={expenses.length === 0}
        >
          Export CSV
        </Button>
      </ActionRow>
      {receiptError && <Msg $error>{receiptError}</Msg>}

      {addOpen && (
        <ExpenseForm
          categories={CATEGORIES}
          onSubmit={handleAddExpense}
          onCancel={() => setAddOpen(false)}
        />
      )}

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
                <ExpenseRow
                  key={exp.id}
                  expense={exp}
                  uploadingId={uploadingId}
                  onPaidToggle={(e) =>
                    dispatch(updateExpense({ eventId, id: e.id, data: { paid: !e.paid } }))
                  }
                  onDelete={async (id) => {
                    if (!window.confirm('Delete?')) return;
                    await dispatch(deleteExpense({ eventId, id })).unwrap();
                    dispatch(fetchExpenses(eventId));
                  }}
                  onReceiptUpload={handleReceiptUpload}
                />
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      <BudgetChart data={categoryData} />
      {expError && <Msg $error>{expError}</Msg>}
    </div>
  );
}
