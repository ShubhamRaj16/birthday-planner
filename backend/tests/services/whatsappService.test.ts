import { buildMessage, previewMessage, getDefaultTemplate } from '../../src/services/whatsappService';
import dayjs from 'dayjs';

const mockEvent = {
  date: new Date('2026-07-15'),
  venue: 'Central Park',
  address: '123 Main St',
  theme: 'Space',
  myGateLink: 'https://mygate.com/123',
};

const mockChild = { name: 'Arjun' };

describe('whatsappService — buildMessage', () => {
  it('replaces {guestName} placeholder', () => {
    const template = getDefaultTemplate();
    const msg = buildMessage(template, { guestName: 'Priya', event: mockEvent, child: mockChild });
    expect(msg).toContain('Priya');
    expect(msg).not.toContain('{guestName}');
  });

  it('replaces {childName} placeholder', () => {
    const template = getDefaultTemplate();
    const msg = buildMessage(template, { guestName: 'Guest', event: mockEvent, child: mockChild });
    expect(msg).toContain('Arjun');
    expect(msg).not.toContain('{childName}');
  });

  it('replaces {venue} with event venue', () => {
    const template = getDefaultTemplate();
    const msg = buildMessage(template, { guestName: 'Guest', event: mockEvent, child: mockChild });
    expect(msg).toContain('Central Park');
  });

  it('includes MyGate link when present', () => {
    const template = getDefaultTemplate();
    const msg = buildMessage(template, { guestName: 'Guest', event: mockEvent, child: mockChild });
    expect(msg).toContain('https://mygate.com/123');
  });

  it('omits MyGate section when myGateLink absent', () => {
    const template = getDefaultTemplate();
    const eventNoGate = { ...mockEvent, myGateLink: null };
    const msg = buildMessage(template, { guestName: 'Guest', event: eventNoGate, child: mockChild });
    expect(msg).not.toContain('MyGate');
  });

  it('includes Maps link when address present', () => {
    const template = getDefaultTemplate();
    const msg = buildMessage(template, { guestName: 'Guest', event: mockEvent, child: mockChild });
    expect(msg).toContain('maps.google.com');
  });

  it('omits Maps link when address absent', () => {
    const template = getDefaultTemplate();
    const eventNoAddr = { ...mockEvent, address: null };
    const msg = buildMessage(template, { guestName: 'Guest', event: eventNoAddr, child: mockChild });
    expect(msg).not.toContain('maps.google.com');
  });

  it('formats date correctly', () => {
    const template = getDefaultTemplate();
    const msg = buildMessage(template, { guestName: 'Guest', event: mockEvent, child: mockChild });
    expect(msg).toContain(dayjs(mockEvent.date).format('dddd, MMMM D, YYYY'));
  });

  it('falls back gracefully when child is null', () => {
    const template = getDefaultTemplate();
    const msg = buildMessage(template, { guestName: 'Guest', event: mockEvent, child: null });
    expect(msg).toContain('the birthday child');
  });

  it('collapses multiple blank lines', () => {
    const template = getDefaultTemplate();
    const msg = buildMessage(template, { guestName: 'Guest', event: mockEvent, child: mockChild });
    expect(msg).not.toMatch(/\n{3,}/);
  });
});

describe('whatsappService — previewMessage', () => {
  it('works without DB access', () => {
    const template = getDefaultTemplate();
    const preview = previewMessage(template, mockEvent, mockChild, 'Sample Guest');
    expect(preview).toContain('Sample Guest');
    expect(preview).toContain('Arjun');
  });
});
