import { screen, render } from '@testing-library/react';
import TaskChecklist from '../../components/TaskChecklist';
import dayjs from 'dayjs';

const pastDate = dayjs().subtract(2, 'day').toISOString();
const futureDate = dayjs().add(7, 'day').toISOString();

const makeTasks = (overrides = []) => [
  { id: 1, title: 'Fix venue',  done: true,  dueDate: pastDate,   category: 'venue' },
  { id: 2, title: 'Book cake',  done: false, dueDate: futureDate, category: 'cake' },
  { id: 3, title: 'Send invites', done: false, dueDate: pastDate, category: 'invites/printing' },
  ...overrides,
];

describe('TaskChecklist', () => {
  describe('progress', () => {
    it('shows correct done/total label', () => {
      const tasks = makeTasks();
      render(<TaskChecklist eventId={1} tasks={tasks} onRefresh={() => {}} />);
      // 1 done out of 3 total → "1 / 3" or "1/3"
      expect(screen.getByText(/1\s*\/\s*3/)).toBeInTheDocument();
    });

    it('shows 0/0 when no tasks', () => {
      render(<TaskChecklist eventId={1} tasks={[]} onRefresh={() => {}} />);
      expect(screen.getByText(/0\s*\/\s*0/)).toBeInTheDocument();
    });

    it('shows 100% when all done', () => {
      const allDone = makeTasks().map(t => ({ ...t, done: true }));
      render(<TaskChecklist eventId={1} tasks={allDone} onRefresh={() => {}} />);
      expect(screen.getByText(/100%/)).toBeInTheDocument();
    });
  });

  describe('task rendering', () => {
    it('renders task titles', () => {
      render(<TaskChecklist eventId={1} tasks={makeTasks()} onRefresh={() => {}} />);
      expect(screen.getByText(/Fix venue/)).toBeInTheDocument();
      expect(screen.getByText(/Book cake/)).toBeInTheDocument();
      expect(screen.getByText(/Send invites/)).toBeInTheDocument();
    });

    it('renders empty state when no tasks', () => {
      render(<TaskChecklist eventId={1} tasks={[]} onRefresh={() => {}} />);
      expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
    });
  });

  describe('overdue detection', () => {
    it('renders overdue label for past undone tasks', () => {
      render(<TaskChecklist eventId={1} tasks={makeTasks()} onRefresh={() => {}} />);
      // "Send invites" has a past dueDate and is not done → should show "Overdue"
      expect(screen.getAllByText(/overdue/i).length).toBeGreaterThanOrEqual(1);
    });
  });
});
