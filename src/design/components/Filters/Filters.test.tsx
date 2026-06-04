import { fireEvent, render, screen } from '@testing-library/react-native';

import { Filters, type FilterSection } from './Filters';

const sections: FilterSection[] = [
  {
    id: 'rating',
    title: 'Rating',
    kind: 'chips',
    options: [
      { id: '5', label: '5★' },
      { id: '4', label: '4★ & up' },
    ],
  },
];

describe('Filters', () => {
  it('renders a section title', () => {
    render(
      <Filters
        visible
        onClose={() => {}}
        onApply={() => {}}
        sections={sections}
        testID="f"
      />,
    );
    expect(screen.getByText('Rating')).toBeTruthy();
  });

  it('calls onClose when the backdrop is pressed', () => {
    const onClose = jest.fn();
    render(
      <Filters
        visible
        onClose={onClose}
        onApply={() => {}}
        sections={sections}
        testID="f"
      />,
    );
    fireEvent.press(screen.getByTestId('f-backdrop'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onApply with the selected values when Apply is pressed', () => {
    const onApply = jest.fn();
    render(
      <Filters
        visible
        onClose={() => {}}
        onApply={onApply}
        sections={sections}
        testID="f"
      />,
    );
    fireEvent.press(screen.getByText('5★'));
    fireEvent.press(screen.getByText('Apply'));
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ rating: expect.arrayContaining(['5']) }),
    );
  });
});
