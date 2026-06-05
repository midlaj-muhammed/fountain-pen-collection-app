/* eslint-disable react-native/no-raw-text */
import { fireEvent, render, screen } from '@testing-library/react-native';

import { InkForm } from './InkForm';

const baseInk = {
  id: 'i1',
  brand: 'Pelikan',
  name: '4001',
  colorHex: '#2D5D3F',
  colorName: 'Dark Green',
  bottleSizeMl: 30,
  currentLevelPct: 60 as const,
  isCartridge: false,
  photoURL: null,
  acquiredAt: null,
  empty: false,
  totalSessions: 0,
  lastUsedAt: null,
  notes: '',
  createdAt: { seconds: 0, nanoseconds: 0, toDate: () => new Date() } as never,
  updatedAt: { seconds: 0, nanoseconds: 0, toDate: () => new Date() } as never,
  deletedAt: null,
};

describe('InkForm', () => {
  it('renders empty fields for a new ink', () => {
    render(<InkForm onSubmit={() => {}} onCancel={() => {}} testID="f" />);
    expect(screen.getByTestId('f-brand').props.value).toBe('');
    expect(screen.getByTestId('f-name').props.value).toBe('');
    expect(screen.getByTestId('f-colorHex').props.value).toBe('#1A1A1A');
  });

  it('pre-fills fields when given an initial ink', () => {
    render(<InkForm initial={baseInk} onSubmit={() => {}} onCancel={() => {}} testID="f" />);
    expect(screen.getByTestId('f-brand').props.value).toBe('Pelikan');
    expect(screen.getByTestId('f-name').props.value).toBe('4001');
    expect(screen.getByTestId('f-colorHex').props.value).toBe('#2D5D3F');
    expect(screen.getByTestId('f-colorName').props.value).toBe('Dark Green');
    expect(screen.getByTestId('f-bottleSizeMl').props.value).toBe('30');
  });

  it('fires onSubmit with the values when the form is valid', () => {
    const onSubmit = jest.fn();
    render(<InkForm onSubmit={onSubmit} onCancel={() => {}} testID="f" />);
    fireEvent.changeText(screen.getByTestId('f-brand'), 'Pelikan');
    fireEvent.changeText(screen.getByTestId('f-name'), '4001');
    fireEvent.press(screen.getByTestId('f-submit'));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ brand: 'Pelikan', name: '4001' }),
    );
  });

  it('disables the submit button when brand or name is empty', () => {
    render(<InkForm onSubmit={() => {}} onCancel={() => {}} testID="f" />);
    expect(screen.getByTestId('f-submit').props.accessibilityState?.disabled).toBe(true);
  });

  it('hides the level row when isCartridge is true', () => {
    render(
      <InkForm
        initial={{ ...baseInk, isCartridge: true }}
        onSubmit={() => {}}
        onCancel={() => {}}
        testID="f"
      />,
    );
    expect(screen.queryByTestId('f-level-100')).toBeNull();
  });
});
