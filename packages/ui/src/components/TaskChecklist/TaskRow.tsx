import styled from 'styled-components';
import dayjs from 'dayjs';
import { CategoryChip } from '../ui';
import { colors } from '../../design/tokens';
import type { TaskChecklistTask } from '../TaskChecklist';

interface Props {
  task: TaskChecklistTask;
  onToggle: (task: TaskChecklistTask) => void;
  onDelete: (id: number) => void;
}

const Item = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.25rem;
  border-bottom: 1px solid ${colors.bgLight};
  &:last-child {
    border-bottom: none;
  }
`;

const Checkbox = styled.input`
  accent-color: ${colors.primary};
  width: 16px;
  height: 16px;
  cursor: pointer;
  flex-shrink: 0;
`;
const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.span<{ $done: boolean; $overdue: boolean }>`
  font-size: 0.875rem;
  color: ${({ $done, $overdue }) =>
    $done ? colors.textDisabled : $overdue ? '#dc2626' : colors.text};
  text-decoration: ${({ $done }) => ($done ? 'line-through' : 'none')};
  font-weight: ${({ $overdue, $done }) => ($overdue && !$done ? '600' : '400')};
`;

const Meta = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 2px;
  flex-wrap: wrap;
`;

const DueDateLabel = styled.span<{ $overdue: boolean }>`
  font-size: 0.72rem;
  color: ${({ $overdue }) => ($overdue ? '#dc2626' : colors.textDisabled)};
  font-weight: ${({ $overdue }) => ($overdue ? '600' : '400')};
`;

const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  &:hover {
    background: ${colors.errorBg};
  }
`;

const TODAY = dayjs().startOf('day');

export default function TaskRow({ task, onToggle, onDelete }: Props) {
  const overdue = !task.done && !!task.dueDate && dayjs(task.dueDate).isBefore(TODAY);

  return (
    <Item>
      <Checkbox
        type="checkbox"
        id={`task-${task.id}`}
        checked={!!task.done}
        onChange={() => onToggle(task)}
      />
      <Info>
        <label htmlFor={`task-${task.id}`} style={{ cursor: 'pointer', display: 'block' }}>
          <Title $done={task.done} $overdue={overdue}>
            {task.title}
            {overdue && ' — OVERDUE'}
          </Title>
        </label>
        <Meta>
          {task.category && <CategoryChip>{task.category}</CategoryChip>}
          {task.dueDate && (
            <DueDateLabel $overdue={overdue}>
              Due {dayjs(task.dueDate).format('MMM D')}
            </DueDateLabel>
          )}
        </Meta>
      </Info>
      <DeleteBtn onClick={() => onDelete(task.id)} title="Delete task">
        &#10005;
      </DeleteBtn>
    </Item>
  );
}
