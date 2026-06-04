import { describe, it, expect } from 'vitest';
import reducer, { addToast, removeToast } from '../../redux/slices/toastSlice';

describe('toastSlice', () => {
  it('addToast appends a toast with incrementing id', () => {
    const s1 = reducer(undefined, addToast('hello', 'success'));
    expect(s1.items).toHaveLength(1);
    expect(s1.items[0]).toMatchObject({ message: 'hello', variant: 'success' });
  });

  it('addToast defaults variant to info', () => {
    const s = reducer(undefined, addToast('plain'));
    expect(s.items[0].variant).toBe('info');
  });

  it('keeps only the most recent 3 toasts', () => {
    let s = reducer(undefined, addToast('a'));
    s = reducer(s, addToast('b'));
    s = reducer(s, addToast('c'));
    s = reducer(s, addToast('d'));
    expect(s.items.map((t) => t.message)).toEqual(['b', 'c', 'd']);
  });

  it('removeToast removes by id', () => {
    const s1 = reducer(undefined, addToast('x'));
    const id = s1.items[0].id;
    const s2 = reducer(s1, removeToast(id));
    expect(s2.items).toHaveLength(0);
  });
});
