import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { fetchChildren, createChild, updateChild, deleteChild } from '../redux/slices/childrenSlice';

const PageTitle = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
`;

const Button = styled.button`
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #6d28d9;
  }

  &:disabled {
    background: #c4b5fd;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: #f3f4f6;
  color: #374151;

  &:hover {
    background: #e5e7eb;
  }
`;

const DangerButton = styled(Button)`
  background: #fee2e2;
  color: #b91c1c;

  &:hover {
    background: #fecaca;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
`;

const Avatar = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #7c3aed;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ChildName = styled.h3`
  font-weight: 600;
  color: #111827;
  font-size: 1rem;
  margin: 0;
`;

const ChildMeta = styled.p`
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 0.75rem;
`;

const Chip = styled.span`
  background: #ede9fe;
  color: #6d28d9;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.72rem;
  font-weight: 500;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const FormPanel = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
`;

const FormTitle = styled.h2`
  font-size: 1.05rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 0.82rem;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 0.45rem 0.7rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;

  &:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15);
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ErrorMsg = styled.p`
  color: #b91c1c;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 10px;
  color: #6b7280;
`;

function getAge(dobStr) {
  if (!dobStr) return null;
  const dob = new Date(dobStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

const EMPTY_FORM = {
  name: '',
  dateOfBirth: '',
  interests: '',
  allergies: '',
  school: '',
  avatar: null,
};

function ChildForm({ initial = EMPTY_FORM, onSubmit, onCancel, loading, error, title }) {
  const [form, setForm] = useState(initial);

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === 'avatar') {
      setForm((f) => ({ ...f, avatar: files[0] || null }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('dateOfBirth', form.dateOfBirth);
    fd.append('interests', form.interests);
    fd.append('allergies', form.allergies);
    fd.append('school', form.school);
    if (form.avatar) fd.append('avatar', form.avatar);
    onSubmit(fd, form);
  }

  return (
    <FormPanel>
      <FormTitle>{title}</FormTitle>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      <form onSubmit={handleSubmit}>
        <FormRow>
          <FieldGroup>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Aarav"
            />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
              required
            />
          </FieldGroup>
        </FormRow>
        <FormRow>
          <FieldGroup>
            <Label htmlFor="interests">Interests (comma-separated)</Label>
            <Input
              id="interests"
              name="interests"
              value={form.interests}
              onChange={handleChange}
              placeholder="e.g. Lego, painting, cricket"
            />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="allergies">Allergies</Label>
            <Input
              id="allergies"
              name="allergies"
              value={form.allergies}
              onChange={handleChange}
              placeholder="e.g. peanuts, dairy"
            />
          </FieldGroup>
        </FormRow>
        <FormRow>
          <FieldGroup>
            <Label htmlFor="school">School</Label>
            <Input
              id="school"
              name="school"
              value={form.school}
              onChange={handleChange}
              placeholder="e.g. Greenfield Primary"
            />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="avatar">Avatar photo</Label>
            <Input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              onChange={handleChange}
            />
          </FieldGroup>
        </FormRow>
        <FormActions>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
          <SecondaryButton type="button" onClick={onCancel}>
            Cancel
          </SecondaryButton>
        </FormActions>
      </form>
    </FormPanel>
  );
}

export default function Children() {
  const dispatch = useDispatch();
  const { items: children, loading, error } = useSelector((state) => state.children);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    dispatch(fetchChildren());
  }, [dispatch]);

  function handleCreate(fd) {
    dispatch(createChild(fd)).then((action) => {
      if (!action.error) setShowForm(false);
    });
  }

  function handleUpdate(fd, formValues) {
    dispatch(updateChild({ id: editingId, data: formValues })).then((action) => {
      if (!action.error) setEditingId(null);
    });
  }

  function handleDelete(id) {
    if (window.confirm('Delete this child and all their events?')) {
      dispatch(deleteChild(id));
    }
  }

  const editingChild = children.find((c) => c.id === editingId);

  return (
    <div>
      <TopBar>
        <PageTitle style={{ margin: 0 }}>Children</PageTitle>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>+ Add Child</Button>
        )}
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
            dateOfBirth: editingChild.dateOfBirth
              ? editingChild.dateOfBirth.slice(0, 10)
              : '',
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

      {loading && !showForm && !editingId && (
        <p style={{ color: '#6b7280' }}>Loading...</p>
      )}

      {!loading && children.length === 0 && !showForm && (
        <EmptyState>
          <p>No children added yet. Click &ldquo;Add Child&rdquo; to get started.</p>
        </EmptyState>
      )}

      <Grid>
        {children.map((child) => {
          const age = getAge(child.dateOfBirth);
          const interests = Array.isArray(child.interests)
            ? child.interests
            : (child.interests || '').split(',').map((s) => s.trim()).filter(Boolean);
          const initial = (child.name || '?')[0].toUpperCase();

          return (
            <Card key={child.id}>
              <CardTop>
                <Avatar>
                  {child.avatarUrl ? (
                    <img src={child.avatarUrl} alt={child.name} />
                  ) : (
                    initial
                  )}
                </Avatar>
                <div>
                  <ChildName>{child.name}</ChildName>
                  <ChildMeta>
                    {age !== null ? `Age ${age}` : ''}
                    {child.school ? ` · ${child.school}` : ''}
                  </ChildMeta>
                  {child.allergies && (
                    <ChildMeta>Allergies: {child.allergies}</ChildMeta>
                  )}
                </div>
              </CardTop>
              {interests.length > 0 && (
                <ChipRow>
                  {interests.map((interest) => (
                    <Chip key={interest}>{interest}</Chip>
                  ))}
                </ChipRow>
              )}
              <CardActions>
                <SecondaryButton onClick={() => setEditingId(child.id)}>
                  Edit
                </SecondaryButton>
                <DangerButton onClick={() => handleDelete(child.id)}>
                  Delete
                </DangerButton>
              </CardActions>
            </Card>
          );
        })}
      </Grid>
    </div>
  );
}
