import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function RecruitingLayout() {
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
      <Tabs.Screen name="candidates" options={{ title: 'Candidates', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, opacity: color === Colors.primary ? 1 : 0.5 }}>\u{1F464}</Text> }} />
      <Tabs.Screen name="jobs" options={{ title: 'Jobs', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, opacity: color === Colors.primary ? 1 : 0.5 }}>\u{1F4BC}</Text> }} />
      <Tabs.Screen name="analytics" options={{ title: 'Analytics', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, opacity: color === Colors.primary ? 1 : 0.5 }}>\u{1F4CA}</Text> }} />
      <Tabs.Screen name="candidate/[id]" options={{ href: null }} />
    </Tabs>
  );
}
