import { screen } from '@testing-library/react';
import { renderWithStore } from '../../test/renderWithStore';
import BudgetTracker from '../../components/BudgetTracker';
import type { ReactNode } from 'react';
import type { Expense, RootState } from '../../types';

// Mock recharts — SVG layout APIs not available in jsdom
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const makeState = (expenses: Partial<Expense>[]): Partial<RootState> => ({
  expenses: {
    byEventId: { 42: expenses as Expense[] },
    summaryByEventId: {},
    loading: false,
    error: null,
  },
});

describe('BudgetTracker', () => {
  describe('summary values', () => {
    it('renders Budget label in summary bar', () => {
      renderWithStore(
        <BudgetTracker eventId={42} eventBudget={10000} />,
        makeState([])
      );
      // SummaryLabel renders "BUDGET" (uppercase via CSS) — text content is "Budget"
      expect(screen.getByText(/Budget/i)).toBeInTheDocument();
    });

    it('shows total spent correctly', () => {
      const expenses = [
        { id: 1, label: 'Cake', amount: 2000, paid: true,  category: 'cake' },
        { id: 2, label: 'Hall', amount: 5000, paid: false, category: 'venue' },
      ];
      renderWithStore(
        <BudgetTracker eventId={42} eventBudget={10000} />,
        makeState(expenses)
      );
      expect(screen.getByText(/7,000/)).toBeInTheDocument(); // 2000 + 5000
    });
  });

  describe('budget alerts', () => {
    it('shows warning alert at 80% spend', () => {
      const expenses = [
        { id: 1, label: 'Hall', amount: 8000, paid: true, category: 'venue' },
      ];
      renderWithStore(
        <BudgetTracker eventId={42} eventBudget={10000} />,
        makeState(expenses)
      );
      expect(screen.getByText(/80%|Warning|warn/i)).toBeInTheDocument();
    });

    it('shows exceeded alert at 100% spend', () => {
      const expenses = [
        { id: 1, label: 'Hall', amount: 10000, paid: true, category: 'venue' },
      ];
      renderWithStore(
        <BudgetTracker eventId={42} eventBudget={10000} />,
        makeState(expenses)
      );
      expect(screen.getByText(/exceeded|100%/i)).toBeInTheDocument();
    });

    it('shows no alert when under 80%', () => {
      const expenses = [
        { id: 1, label: 'Cake', amount: 5000, paid: true, category: 'cake' },
      ];
      renderWithStore(
        <BudgetTracker eventId={42} eventBudget={10000} />,
        makeState(expenses)
      );
      expect(screen.queryByText(/exceeded/i)).toBeNull();
      expect(screen.queryByText(/Warning.*80%/i)).toBeNull();
    });
  });
});
