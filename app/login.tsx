import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/context/AuthContext';
import { Colors, withAlpha } from '@/constants/Colors';
import { API_BASE_URL } from '@/constants/ApiConfig';
import { FontSize, Radius, Spacing } from '@/constants/Theme';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { user, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  async function handleGoogleLogin() {
    const loginUrl = `${API_BASE_URL}/login`;

    if (Platform.OS === 'web') {
      window.location.href = loginUrl;
      return;
    }

    setBusy(true);
    try {
      const result = await WebBrowser.openAuthSessionAsync(loginUrl, 'kpitracker://');
      if (result.type === 'success' || result.type === 'dismiss') {
        await refreshUser();
      }
    } catch (err) {
      Alert.alert(
        'Sign-in failed',
        err instanceof Error ? err.message : 'Please try again in a moment.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🧊</Text>
        </View>
        <Text style={styles.brand}>IceBreakerBD</Text>
        <Text style={styles.subtitle}>KPI Tracker</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Track. Improve. Win.</Text>
        <Text style={styles.heroBody}>
          Monitor your sales KPIs, manage the recruiting pipeline, and stay on top of team
          performance — all in one place.
        </Text>
      </View>

      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={[styles.googleButton, busy && styles.googleButtonDisabled]}
          onPress={handleGoogleLogin}
          activeOpacity={0.85}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#111" />
          ) : (
            <>
              <Text style={styles.googleLogo}>G</Text>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
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
    gap: Spacing.sm,
  },
  logoBox: {
    width: 88,
    height: 88,
    borderRadius: Radius.xl,
    backgroundColor: withAlpha(Colors.primary, 0.15),
    borderWidth: 1,
    borderColor: withAlpha(Colors.primary, 0.4),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logoEmoji: { fontSize: 44 },
  brand: {
    color: Colors.primary,
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.text.secondary,
    fontSize: FontSize.lg,
    fontWeight: '500',
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  heroTitle: {
    color: Colors.text.primary,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroBody: {
    color: Colors.text.secondary,
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  ctaSection: {
    gap: Spacing.md,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
  },
  googleButtonDisabled: { opacity: 0.7 },
  googleLogo: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleButtonText: {
    color: '#111',
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  legalNote: {
    color: Colors.text.muted,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
  version: {
    color: Colors.text.muted,
    fontSize: 11,
    textAlign: 'center',
  },
});
