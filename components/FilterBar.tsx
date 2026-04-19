import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, withAlpha } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Theme';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDef {
  key: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (v: string) => void;
}

interface Props {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  filters?: FilterDef[];
}

export function FilterBar({
  searchPlaceholder = 'Search…',
  searchValue,
  onSearchChange,
  filters = [],
}: Props) {
  return (
    <View style={styles.wrapper}>
      {onSearchChange ? (
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={searchValue}
            onChangeText={onSearchChange}
            placeholder={searchPlaceholder}
            placeholderTextColor={Colors.text.muted}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchValue ? (
            <TouchableOpacity
              onPress={() => onSearchChange('')}
              style={styles.clearBtn}
              hitSlop={8}
            >
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {filters.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((filter) => (
            <FilterGroup key={filter.key} filter={filter} />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

function FilterGroup({ filter }: { filter: FilterDef }) {
  return (
    <View style={styles.group}>
      <Chip
        label={`All ${filter.label}`}
        active={!filter.value}
        onPress={() => filter.onChange('')}
      />
      {filter.options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          active={filter.value === opt.value}
          onPress={() => filter.onChange(filter.value === opt.value ? '' : opt.value)}
        />
      ))}
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, active ? styles.chipActive : null]}
    >
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.input,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchIcon: { fontSize: FontSize.md, opacity: 0.8 },
  searchInput: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: FontSize.md,
    paddingVertical: Spacing.md,
  },
  clearBtn: { padding: 4 },
  clearText: { color: Colors.text.muted, fontSize: FontSize.md },
  filterRow: {
    gap: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  group: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: withAlpha(Colors.primary, 0.18),
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.text.secondary,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.primary,
  },
});
