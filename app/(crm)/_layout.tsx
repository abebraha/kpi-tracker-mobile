import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from 'A/constants/Colors';

export default function CRMLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.bg.card },
        headerTintColor: Colors.text.primary,
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: Colors.bg.card,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="calls"
        options={{
          title: 'Calls',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, opacity: color === Colors.primary ? 1 : 0.5 }}>📞</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="meetings"
        options={{
          title: 'Meetings',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, opacity: color === Colors.primary ? 1 : 0.5 }}>🤝</Text>
          ),
        }}
      />
    </Tabs>
  );
}
