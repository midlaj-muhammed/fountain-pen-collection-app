/* eslint-disable react-native/no-raw-text */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ButtonS } from '@/design/components/ButtonS/ButtonS';
import { Chip } from '@/design/components/Chip/Chip';
import { Modal } from '@/design/components/Modal/Modal';
import { Stack } from '@/design/primitives/Stack';
import { Text } from '@/design/primitives/Text';
import { colors } from '@/design/tokens/colors';
import { space } from '@/design/tokens/spacing';

export type FilterOption = { id: string; label: string };
export type FilterSection = {
  id: string;
  title: string;
  kind: 'chips' | 'list';
  options: FilterOption[];
};

export type FiltersProps = {
  visible: boolean;
  onClose: () => void;
  onApply: (selections: Record<string, string[]>) => void;
  onReset?: () => void;
  sections: FilterSection[];
  testID?: string;
};

/**
 * Multi-section bottom sheet. Each section renders a row of `Chip`s that
 * toggle inclusion in the section's selection array. Apply commits; Reset
 * clears all sections.
 */
export function Filters({
  visible,
  onClose,
  onApply,
  onReset,
  sections,
  testID,
}: FiltersProps) {
  const [state, setState] = useState<Record<string, string[]>>({});

  const toggle = (sectionId: string, optionId: string) => {
    setState((prev) => {
      const cur = prev[sectionId] ?? [];
      const next = cur.includes(optionId)
        ? cur.filter((x) => x !== optionId)
        : [...cur, optionId];
      return { ...prev, [sectionId]: next };
    });
  };

  return (
    <Modal visible={visible} onClose={onClose} testID={testID}>
      <Stack gap="lg" style={styles.body}>
        <Text variant="h2">Filters</Text>
        {sections.map((section) => (
          <Stack key={section.id} gap="sm">
            <Text variant="small" color="textMuted" weight="600">
              {section.title}
            </Text>
            <View style={styles.chipsWrap}>
              {section.options.map((opt) => {
                const active = (state[section.id] ?? []).includes(opt.id);
                return (
                  <Chip
                    key={opt.id}
                    label={opt.label}
                    active={active}
                    onPress={() => toggle(section.id, opt.id)}
                  />
                );
              })}
            </View>
          </Stack>
        ))}
        <Stack axis="horizontal" gap="sm">
          {onReset ? (
            <ButtonS variant="ghost" onPress={onReset} style={styles.flex}>
              Reset
            </ButtonS>
          ) : null}
          <ButtonS
            onPress={() => {
              onApply(state);
              onClose();
            }}
            style={styles.flex}
          >
            Apply
          </ButtonS>
        </Stack>
      </Stack>
    </Modal>
  );
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: colors.bgElevated,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  flex: {
    flex: 1,
  },
});
