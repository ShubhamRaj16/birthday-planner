// No module mock needed — we inject a mock client directly via _setClientForTesting
import { getSuggestions, _resetClient, _setClientForTesting } from '../../src/services/aiService';

const mockCreate = vi.fn();
const mockClient = { messages: { create: mockCreate } };

beforeEach(() => {
  _setClientForTesting(mockClient);
  mockCreate.mockReset();
  mockCreate.mockResolvedValue({
    content: [{ text: '["suggestion 1","suggestion 2","suggestion 3","suggestion 4","suggestion 5"]' }],
  });
});

afterAll(() => {
  _resetClient(); // restore normal state for any subsequent require
});

describe('aiService — getSuggestions', () => {
  const mockEvent = { theme: 'Space', venue: 'Hall' };
  const mockChild = { name: 'Arjun', dob: new Date('2018-06-15'), interests: 'Lego', allergies: null };

  it('returns type and 5 suggestions for themes', async () => {
    const result = await getSuggestions('themes', mockEvent, mockChild);
    expect(result.type).toBe('themes');
    expect(result.suggestions).toHaveLength(5);
  });

  it('returns type and 5 suggestions for gifts', async () => {
    const result = await getSuggestions('gifts', mockEvent, mockChild);
    expect(result.type).toBe('gifts');
    expect(result.suggestions).toHaveLength(5);
  });

  it('returns type and 5 suggestions for activities', async () => {
    const result = await getSuggestions('activities', mockEvent, mockChild);
    expect(result.type).toBe('activities');
    expect(result.suggestions).toHaveLength(5);
  });

  it('returns type and 5 suggestions for venue', async () => {
    const result = await getSuggestions('venue', mockEvent, mockChild);
    expect(result.type).toBe('venue');
    expect(result.suggestions).toHaveLength(5);
  });

  it('returns type and 5 suggestions for catering', async () => {
    const result = await getSuggestions('catering', mockEvent, mockChild);
    expect(result.type).toBe('catering');
    expect(result.suggestions).toHaveLength(5);
  });

  it('returns single-item array for message type (raw text, not JSON)', async () => {
    mockCreate.mockResolvedValueOnce({ content: [{ text: 'Hi {guestName}! Come to the party.' }] });
    const result = await getSuggestions('message', mockEvent, mockChild);
    expect(result.type).toBe('message');
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0]).toContain('{guestName}');
  });

  it('throws 400 for unknown suggestion type', async () => {
    await expect(getSuggestions('unknown', mockEvent, mockChild))
      .rejects.toMatchObject({ status: 400 });
  });

  it('falls back to line-splitting when SDK returns non-JSON text', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ text: '1. Idea one\n2. Idea two\n3. Idea three\n4. Idea four\n5. Idea five' }],
    });
    const result = await getSuggestions('themes', {}, {});
    expect(result.suggestions).toHaveLength(5);
    expect(result.suggestions[0]).toContain('Idea one');
  });
});
