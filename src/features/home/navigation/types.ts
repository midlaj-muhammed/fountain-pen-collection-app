/**
 * HomeStack lives inside the Pens tab. Initial route is Home; "See all
 * pens" / "See all inks" navigates to PenList / InkList. Sessions have
 * their own list/detail/form routes; the QuickLog 1-tap goes straight
 * to SessionDetail with the new session id.
 */
export type HomeStackParamList = {
  Home: undefined;
  PenList: undefined;
  InkList: undefined;
  SessionList: undefined;
  PenDetail: { penId: string };
  InkDetail: { inkId: string };
  SessionDetail: { sessionId: string };
  PenForm: { penId: string | undefined };
  InkForm: { inkId: string | undefined };
  SessionForm: { sessionId: string | undefined };
};
