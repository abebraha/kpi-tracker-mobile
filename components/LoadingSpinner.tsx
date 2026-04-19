import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { FontSize, Spacing } from '@/constants/Theme';

interface Props {
  message?: string;
  size?: 'small' | 'large';
  inline?: boolean;
  style?: ViewStyle;
}

export function LoadingSpinner({ message, size = 'large', inline = false, style }: Props) {
  return (
    <View style={[inline ? styles.inline : styles.block, style]}>
      <ActivityIndicator size={size} color={Colors.primary} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  text: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
  },
});
