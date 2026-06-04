import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  fetchChildren,
  createChild,
  updateChild,
  deleteChild,
} from '../redux/slices/childrenSlice';
import styled from 'styled-components';
import { Button } from '../components/ui';
import { colors, spacing, radius } from '../design/tokens';
import ChildCard from '../components/ChildCard/ChildCard';
import ChildForm from '../components/ChildCard/ChildForm';
import ChildTimeline from '../components/ChildCard/ChildTimeline';

const PageTitle = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${colors.text};
  margin-bottom: 1.5rem;
`;
const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${spacing.lg};
`;
const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background: ${colors.bgLightest};
  border: 1px dashed ${colors.border};
  border-radius: ${radius.lg};
  color: ${colors.textSubtle};
`;

export default function Children() {
  const dispatch = useAppDispatch();
  const { items: children, loading, error } = useAppSelector((state) => state.children);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchChildren());
  }, [dispatch]);

  function handleCreate(fd: FormData) {
    dispatch(createChild(fd)).then((action) => {
      if (createChild.fulfilled.match(action)) setShowForm(false);
    });
  }

  function handleUpdate(fd: FormData) {
    if (editingId == null) return;
    dispatch(updateChild({ id: editingId, data: fd })).then((action) => {
      if (updateChild.fulfilled.match(action)) setEditingId(null);
    });
  }

  function handleDelete(id: number) {
    if (window.confirm('Delete this child and all their events?')) dispatch(deleteChild(id));
  }

  const editingChild = children.find((c) => c.id === editingId);

  return (
    <div>
      <TopBar>
        <PageTitle style={{ margin: 0 }}>Children</PageTitle>
        {!showForm && <Button onClick={() => setShowForm(true)}>+ Add Child</Button>}
      </TopBar>

      {showForm && (
        <ChildForm
          title="Add Child"
          loading={loading}
          error={error}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingId && editingChild && (
        <ChildForm
          title={`Edit — ${editingChild.name}`}
          initial={{
            name: editingChild.name || '',
            dob: editingChild.dob ? editingChild.dob.slice(0, 10) : '',
            interests: Array.isArray(editingChild.interests)
              ? editingChild.interests.join(', ')
              : editingChild.interests || '',
            allergies: editingChild.allergies || '',
            school: editingChild.school || '',
            avatar: null,
          }}
          loading={loading}
          error={error}
          onSubmit={handleUpdate}
          onCancel={() => setEditingId(null)}
        />
      )}

      {loading && !showForm && !editingId && <p style={{ color: colors.textSubtle }}>Loading...</p>}

      {!loading && children.length === 0 && !showForm && (
        <EmptyState>
          <p>No children added yet. Click &ldquo;Add Child&rdquo; to get started.</p>
        </EmptyState>
      )}

      <Grid>
        {children.map((child) => (
          <ChildCard key={child.id} child={child} onEdit={setEditingId} onDelete={handleDelete} />
        ))}
      </Grid>

      <ChildTimeline childList={children} />
    </div>
  );
}
