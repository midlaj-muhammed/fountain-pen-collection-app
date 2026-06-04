import { layout } from './layout';

describe('layout token (Figma-confirmed)', () => {
  it('canvas is 375 (iPhone standard)', () => {
    expect(layout.canvas).toBe(375);
  });

  it('pageMargin is 15', () => {
    expect(layout.pageMargin).toBe(15);
  });

  it('contentWidth = canvas - pageMargin * 2 (i.e. 345)', () => {
    expect(layout.contentWidth).toBe(345);
    expect(layout.contentWidth).toBe(layout.canvas - layout.pageMargin * 2);
  });
});
