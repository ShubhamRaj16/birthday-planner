import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import {
  removeToast,
  type Toast as ToastItem,
  type ToastVariant,
} from '../redux/slices/toastSlice';
import type { RootState } from '../types';

const Stack = styled.div`
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1000;
`;

const Item = styled.div<{ $variant: ToastVariant }>`
  min-width: 220px;
  max-width: 360px;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  background: ${({ $variant }) =>
    $variant === 'success' ? '#059669' : $variant === 'error' ? '#dc2626' : '#7c3aed'};
`;

function ToastRow({ toast }: { toast: ToastItem }) {
  const dispatch = useDispatch();
  useEffect(() => {
    const t = setTimeout(() => dispatch(removeToast(toast.id)), 4000);
    return () => clearTimeout(t);
  }, [dispatch, toast.id]);
  return (
    <Item
      $variant={toast.variant}
      role="status"
      aria-live="polite"
      onClick={() => dispatch(removeToast(toast.id))}
    >
      {toast.message}
    </Item>
  );
}

export default function ToastHost() {
  const items = useSelector((s: RootState) => s.toast.items);
  if (!items.length) return null;
  return (
    <Stack aria-live="polite" aria-atomic="false">
      {items.map((t) => (
        <ToastRow key={t.id} toast={t} />
      ))}
    </Stack>
  );
}
