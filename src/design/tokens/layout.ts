/**
 * Layout tokens — the Figma-confirmed frame:
 *   canvas: 375 px (iPhone standard)
 *   pageMargin: 15 px on each side
 *   contentWidth: 345 px (= canvas - 2*pageMargin)
 *
 * Use `layout.contentWidth` for the inner width of any full-screen container.
 * For 2-column grids, half = (contentWidth - gap) / 2.
 */
export const layout = {
  canvas: 375,
  pageMargin: 15,
  contentWidth: 345, // 375 - 15*2
} as const;
