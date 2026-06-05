/**
 * HomeStack lives inside the Pens tab. Initial route is Home; "See all
 * pens" / "See all inks" navigates to PenList / InkList, which already
 * exist in their own feature stacks but are mounted here as well so the
 * user can drill down without leaving the Pens tab.
 */
export type HomeStackParamList = {
  Home: undefined;
  PenList: undefined;
  InkList: undefined;
  PenDetail: { penId: string };
  InkDetail: { inkId: string };
  PenForm: { penId: string | undefined };
  InkForm: { inkId: string | undefined };
};
