import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function SDRLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.bg.card },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: { backgroundColor: Colors.bg.card, borderTopColor: Colors.border, borderTopWidth: 1 },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'My KPIs', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, opacity: color === Colors.primary ? 1 : 0.5 }}>\u{1F4CA}</Text> }} />
      <Tabs.Screen name="log-call" options={{ title: 'Log Call', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, opacity: color === Colors.primary ? 1 : 0.5 }}>\u{1F4DE}</Text> }} />
      <Tabs.Screen name="log-meeting" options={{ title: 'Log Meeting', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, opacity: color === Colors.primary ? 1 : 0.5 }}>\u{1F91D}</Text> }} />
    </Tabs>
  );
}
