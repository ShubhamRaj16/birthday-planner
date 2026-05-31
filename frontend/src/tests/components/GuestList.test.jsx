import { screen } from '@testing-library/react';
import { renderWithStore } from '../../test/renderWithStore';
import GuestList from '../../components/GuestList';

// Pre-populated Redux state with test guests
const makeState = (guests) => ({
  guests: {
    byEventId: { 42: guests },
    loading: false,
    error: null,
  },
});

const mockGuests = [
  { id: 1, name: 'Alice', rsvp: 'Confirmed', inviteSent: false, phone: '9876543210', ageGroup: 'adult', dietary: '' },
  { id: 2, name: 'Bob',   rsvp: 'Pending',   inviteSent: true,  phone: '9876543211', ageGroup: 'adult', dietary: '' },
  { id: 3, name: 'Carol', rsvp: 'Declined',  inviteSent: false, phone: '9876543212', ageGroup: 'child', dietary: '' },
];

describe('GuestList', () => {
  describe('rendering', () => {
    it('renders guest names', () => {
      renderWithStore(<GuestList eventId={42} />, makeState(mockGuests));
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Carol')).toBeInTheDocument();
    });

    it('shows correct total count in summary chip', () => {
      renderWithStore(<GuestList eventId={42} />, makeState(mockGuests));
      // Chip format: "Total 3"
      expect(screen.getByText('Total 3')).toBeInTheDocument();
    });

    it('shows confirmed count as 1', () => {
      renderWithStore(<GuestList eventId={42} />, makeState(mockGuests));
      // Chip format: "Confirmed 1"
      expect(screen.getByText('Confirmed 1')).toBeInTheDocument();
    });

    it('shows declined count as 1', () => {
      renderWithStore(<GuestList eventId={42} />, makeState(mockGuests));
      // Chip format: "Declined 1"
      expect(screen.getByText('Declined 1')).toBeInTheDocument();
    });

    it('renders empty message when no guests', () => {
      renderWithStore(<GuestList eventId={42} />, makeState([]));
      expect(screen.getByText(/no guests/i)).toBeInTheDocument();
    });
  });

  describe('RSVP badges', () => {
    it('shows Confirmed badge for confirmed guest', () => {
      renderWithStore(<GuestList eventId={42} />, makeState(mockGuests));
      expect(screen.getAllByText('Confirmed').length).toBeGreaterThanOrEqual(1);
    });

    it('shows Pending badge for pending guest', () => {
      renderWithStore(<GuestList eventId={42} />, makeState(mockGuests));
      expect(screen.getAllByText('Pending').length).toBeGreaterThanOrEqual(1);
    });
  });
});
