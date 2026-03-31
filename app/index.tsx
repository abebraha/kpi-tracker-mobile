import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from 'A/context/AuthContext';
import { Colors } from 'A/constants/Colors';

/**
 * Root entry point — redirects based on auth state and user role.
 */
export default function IndexScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  // Route to the right section based on role
  switch (user.role) {
    case 'admin':
      return <Redirect href="/(admin)/dashboard" />;
    case 'sdr':
      return <Redirect href="/(sdr)/dashboard" />;
    case 'recruiter':
      return <Redirect href="/(recruiting)/candidates" />;
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
  },
});
