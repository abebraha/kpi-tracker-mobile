import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor={Colors.bg.base} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.bg.card },
          headerTintColor: Colors.text.primary,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: Colors.bg.base },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="(sdr)" options={{ headerShown: false }} />
        <Stack.Screen name="(recruiting)" options={{ headerShown: false }} />
        <Stack.Screen name="(crm)" options={{ headerShown: false }} />
        <Stack.Screen
          name="leaderboard"
          options={{ title: '🏆 Leaderboard' }}
        />
      </Stack>
    </AuthProvider>
  );
}
