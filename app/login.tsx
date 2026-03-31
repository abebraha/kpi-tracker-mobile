import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { API_BASE_URL } from '@/constants/ApiConfig';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { user, isLoading, refreshUser } = useAuth();
  const router = useRouter();

  // If already logged in, go to root (which redirects by role)
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/');
    }
  }, [user, isLoading]);

  async function handleGoogleLogin() {
    const loginUrl = `${API_BASE_URL}/login`;

    if (Platform.OS === 'web') {
      // On web, navigate directly — Flask handles the Google OAuth redirect
      window.location.href = loginUrl;
    } else {
      // On native, open in-app browser, then refresh session
      const result = await WebBrowser.openAuthSessionAsync(
        loginUrl,
        'kpitracker://'   // deep link scheme (matches app.json scheme)
      );
      if (result.type === 'success' || result.type === 'dismiss') {
        // Try refreshing user session after browser closes
        await refreshUser();
      }
    }
  }

  return (
    <View style={styles.container}>
      {/* Logo / Branding */}
      <View style={styles.logoArea}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🧊</Text>
        </View>
        <Text style={styles.brand}>IceBreakerBD</Text>
        <Text style={styles.subtitle}>KPI Tracker</Text>
      </View>

      {/* Hero copy */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Track. Improve. Win.</Text>
        <Text style={styles.heroBody}>
          Monitor your sales KPIs, manage the recruiting pipeline, and stay on
          top of team performance — all in one place.
        </Text>
      </View>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          activeOpacity={0.85}
        >
          <Text style={styles.googleLogo}>G</Text>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.legalNote}>
          Sign in with your @icebreakerbd.com Google account.
        </Text>
      </View>

      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.base,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 48,
  },
  logoArea: {
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoEmoji: { fontSize: 42 },
  brand: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  hero: {
    alignItems: 'center',
    gap: 12,
  },
  heroTitle: {
    color: Colors.text.primary,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroBody: {
    color: Colors.text.secondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaSection: {
    gap: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  googleLogo: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
  legalNote: {
    color: Colors.text.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  version: {
    color: Colors.text.muted,
    fontSize: 11,
    textAlign: 'center',
  },
});
