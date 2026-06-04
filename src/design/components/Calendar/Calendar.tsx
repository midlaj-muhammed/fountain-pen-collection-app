import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar as RNCalendar, type DateData } from 'react-native-calendars';

import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { radius } from '@/design/tokens/radius';

export type CalendarProps = {
  /** ISO date strings ('YYYY-MM-DD') that have at least one session. */
  sessionDates?: string[];
  onSelectDate: (date: Date) => void;
  initialDate?: Date;
  testID?: string;
};

/**
 * Monthly calendar grid. Days with sessions show a small violet dot under
 * the number; the selected day gets a violet border. Built on
 * `react-native-calendars`.
 */
export function Calendar({
  sessionDates = [],
  onSelectDate,
  initialDate = new Date(),
  testID,
}: CalendarProps) {
  const [selected, setSelected] = useState<string>(
    initialDate.toISOString().slice(0, 10),
  );

  const marked: Record<string, { marked: boolean; selected: boolean; selectedColor: string }> = {};
  for (const d of sessionDates) {
    marked[d] = { marked: true, selected: d === selected, selectedColor: colors.accent };
  }
  marked[selected] = {
    marked: marked[selected]?.marked ?? false,
    selected: true,
    selectedColor: colors.accent,
  };

  return (
    <View testID={testID} style={styles.wrap}>
      <RNCalendar
        current={initialDate.toISOString().slice(0, 10)}
        onDayPress={(day: DateData) => {
          setSelected(day.dateString);
          onSelectDate(new Date(day.year, day.month - 1, day.day));
        }}
        markedDates={marked}
        theme={{
          calendarBackground: colors.bg,
          textSectionTitleColor: colors.textMuted,
          dayTextColor: colors.text,
          todayTextColor: colors.accent,
          selectedDayBackgroundColor: colors.accent,
          selectedDayTextColor: colors.textInverse,
          monthTextColor: colors.text,
          arrowColor: colors.accent,
          textDisabledColor: colors.divider,
          textDayFontWeight: '500',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
        }}
        style={styles.cal}
      />
      <View style={styles.legend}>
        <Text variant="caption" color="textMuted">
          {sessionDates.length === 0
            ? 'No sessions this month'
            : `${sessionDates.length} session${sessionDates.length === 1 ? '' : 's'} this month`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cal: {
    borderRadius: radius.md,
  },
  legend: {
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  wrap: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
  },
});
