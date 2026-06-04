import { render, screen } from '@testing-library/react-native';

import { InkLevelDots } from './InkLevelDots';

describe('InkLevelDots', () => {
  it('renders exactly 5 dots regardless of level', () => {
    render(<InkLevelDots level={60} testID="d" />);
    const node = screen.getByTestId('d');
    // 5 dot children
    expect(node.children).toHaveLength(5);
  });

  it('marks dots as filled based on the 5-step level (0/20/40/60/80/100)', () => {
    render(<InkLevelDots level={40} testID="d" />);
    const node = screen.getByTestId('d');
    // First 2 dots filled, last 3 empty (since 40% = 2 of 5 steps)
    const styles = (node.children as { props: { style: object } }[]).map((c) =>
      JSON.stringify(c.props.style),
    );
    const filledCount = styles.filter((s: string) => s.includes('"#6B4FE0"')).length;
    expect(filledCount).toBe(2);
  });

  it('exposes an accessibilityLabel describing the level', () => {
    render(<InkLevelDots level={80} testID="d" />);
    expect(screen.getByTestId('d').props.accessibilityLabel).toMatch(/80%/);
  });
});
