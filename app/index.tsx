import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { FontSize, Spacing } from '@/constants/Theme';

/**
 * Root entry point — waits for session then redirects by role.
 */
export default function IndexScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Signing you in…</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  switch (user.role) {
    case 'admin':
      return <Redirect href="/(admin)/dashboard" />;
    case 'recruiter':
      return <Redirect href="/(recruiting)/candidates" />;
    case 'sdr':
    case 'employee':
      return <Redirect href="/(sdr)/dashboard" />;
    default:
      return <Redirect href="/login" />;
  }
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: Colors.bg.base,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
  },
});
