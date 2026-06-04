/* eslint-disable react-native/no-raw-text */
import { fireEvent, render, screen } from '@testing-library/react-native';

import { PenForm } from './PenForm';

const basePen = {
  id: 'p1',
  brand: 'Pilot',
  model: 'Capless',
  nib: { size: 'F' as const, material: 'steel' as const, customLabel: null },
  color: '#1A1A1A',
  photoURL: null,
  acquiredAt: null,
  retired: false,
  currentInkId: null,
  notes: '',
  totalSessions: 0,
  createdAt: { seconds: 0, nanoseconds: 0, toDate: () => new Date() } as never,
  updatedAt: { seconds: 0, nanoseconds: 0, toDate: () => new Date() } as never,
  deletedAt: null,
};

describe('PenForm', () => {
  it('renders empty fields for a new pen', () => {
    render(<PenForm onSubmit={() => {}} onCancel={() => {}} testID="f" />);
    expect(screen.getByTestId('f-brand').props.value).toBe('');
  });

  it('pre-fills fields when given an initial pen', () => {
    render(<PenForm initial={basePen} onSubmit={() => {}} onCancel={() => {}} testID="f" />);
    expect(screen.getByTestId('f-brand').props.value).toBe('Pilot');
    expect(screen.getByTestId('f-model').props.value).toBe('Capless');
  });

  it('fires onSubmit with the values when the form is valid', () => {
    const onSubmit = jest.fn();
    render(<PenForm onSubmit={onSubmit} onCancel={() => {}} testID="f" />);
    fireEvent.changeText(screen.getByTestId('f-brand'), 'Pilot');
    fireEvent.changeText(screen.getByTestId('f-model'), 'Capless');
    fireEvent.press(screen.getByTestId('f-submit'));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ brand: 'Pilot', model: 'Capless' }),
    );
  });

  it('disables the submit button when brand is empty', () => {
    render(<PenForm onSubmit={() => {}} onCancel={() => {}} testID="f" />);
    expect(screen.getByTestId('f-submit').props.accessibilityState?.disabled).toBe(true);
  });
});
