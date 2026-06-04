import { useState, type ChangeEvent, type FormEvent } from 'react';
import styled from 'styled-components';
import { Button } from '../ui';
import { colors, spacing, radius } from '../../design/tokens';

export interface ChildFormData {
  name: string;
  dob: string;
  interests: string;
  allergies: string;
  school: string;
  avatar: File | null;
}

interface ChildFormProps {
  initial?: ChildFormData;
  onSubmit: (formData: FormData, form: ChildFormData) => void;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
  title: string;
}

export const EMPTY_FORM: ChildFormData = {
  name: '',
  dob: '',
  interests: '',
  allergies: '',
  school: '',
  avatar: null,
};

const Panel = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.borderLight};
  border-radius: ${radius.lg};
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
`;

const Title = styled.h2`
  font-size: 1.05rem;
  font-weight: 600;
  color: ${colors.textMuted};
  margin-bottom: ${spacing.lg};
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.md};
  margin-bottom: ${spacing.md};
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
  color: ${colors.textMuted};
`;

const Input = styled.input`
  padding: 0.45rem 0.7rem;
  border: 1px solid ${colors.border};
  border-radius: ${radius.sm};
  font-size: 0.9rem;
  outline: none;
  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15);
  }
`;

const ErrorMsg = styled.p`
  color: ${colors.error};
  font-size: 0.85rem;
  margin-bottom: ${spacing.md};
`;
const Actions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-top: ${spacing.lg};
`;

export default function ChildForm({
  initial = EMPTY_FORM,
  onSubmit,
  onCancel,
  loading,
  error,
  title,
}: ChildFormProps) {
  const [form, setForm] = useState(initial);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value, files } = e.target;
    if (name === 'avatar') setForm((f) => ({ ...f, avatar: files?.[0] || null }));
    else setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('dob', form.dob);
    fd.append('interests', form.interests);
    fd.append('allergies', form.allergies);
    fd.append('school', form.school);
    if (form.avatar) fd.append('avatar', form.avatar);
    onSubmit(fd, form);
  }

  return (
    <Panel>
      <Title>{title}</Title>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      <form onSubmit={handleSubmit}>
        <Grid2>
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
            <Label htmlFor="dob">Date of Birth *</Label>
            <Input
              id="dob"
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
              required
            />
          </FieldGroup>
        </Grid2>
        <Grid2>
          <FieldGroup>
            <Label htmlFor="interests">Interests (comma-separated)</Label>
            <Input
              id="interests"
              name="interests"
              value={form.interests}
              onChange={handleChange}
              placeholder="e.g. Lego, painting"
            />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="allergies">Allergies</Label>
            <Input
              id="allergies"
              name="allergies"
              value={form.allergies}
              onChange={handleChange}
              placeholder="e.g. peanuts"
            />
          </FieldGroup>
        </Grid2>
        <Grid2>
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
            <Input id="avatar" name="avatar" type="file" accept="image/*" onChange={handleChange} />
          </FieldGroup>
        </Grid2>
        <Actions>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
        </Actions>
      </form>
    </Panel>
  );
}
