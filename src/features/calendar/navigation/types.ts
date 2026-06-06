/**
 * Param list for the Calendar tab's native stack. Today the only
 * route is `CalendarMonth`; future routes (day detail, session
 * detail) can be added without touching the navigator.
 */
export type CalendarStackParamList = {
  CalendarMonth: undefined;
};
