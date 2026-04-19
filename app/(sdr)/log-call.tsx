import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { logCall } from '@/services/api';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const DURATION_PRESETS = [5, 15, 30, 45, 60];

export default function LogCallScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [durationText, setDurationText] = useState('');
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    title.trim().length > 0 &&
    Number(durationText) > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    !submitting;

  function reset() {
    setTitle('');
    setDurationText('');
    setDate(todayISO());
    setNotes('');
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    const duration = Number(durationText);
    setSubmitting(true);
    try {
      await logCall({
        title: title.trim(),
        duration,
        call_date: date,
        crm_notes: notes.trim() || undefined,
      });
      Alert.alert('Call logged', 'Nice work — it will appear in your KPIs shortly.', [
        {
          text: 'Log another',
          onPress: () => reset(),
        },
        {
          text: 'Done',
          style: 'default',
          onPress: () => {
            reset();
            router.push('/(sdr)/dashboard');
          },
        },
      ]);
    } catch (err) {
      Alert.alert(
        "Couldn't save call",
        err instanceof Error ? err.message : 'Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          eyebrow="Log a call"
          title="Quick call log"
          subtitle="Capture context while it's fresh."
        />

        <Field label="Title" required>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Discovery — Acme Corp"
            placeholderTextColor={Colors.text.muted}
            returnKeyType="next"
          />
        </Field>

        <Field label="Duration (minutes)" required>
          <TextInput
            style={styles.input}
            value={durationText}
            onChangeText={(v) => setDurationText(v.replace(/[^0-9]/g, ''))}
            placeholder="30"
            placeholderTextColor={Colors.text.muted}
            keyboardType="number-pad"
            maxLength={3}
          />
          <View style={styles.presets}>
            {DURATION_PRESETS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.presetChip,
                  Number(durationText) === m ? styles.presetChipActive : null,
                ]}
                onPress={() => setDurationText(String(m))}
              >
                <Text
                  style={[
                    styles.presetText,
                    Number(durationText) === m ? styles.presetTextActive : null,
                  ]}
                >
                  {m}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Field>

        <Field label="Call date (YYYY-MM-DD)" required>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder={todayISO()}
            placeholderTextColor={Colors.text.muted}
            autoCapitalize="none"
          />
        </Field>

        <Field label="CRM notes">
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Outcome, next steps, objections…"
            placeholderTextColor={Colors.text.muted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Field>

        <TouchableOpacity
          style={[styles.submit, !canSubmit && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          <Text style={styles.submitText}>
            {submitting ? 'Saving…' : 'Save call'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondary} onPress={() => router.back()}>
          <Text style={styles.secondaryText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg.base },
  content: { padding: Spacing.screen, paddingBottom: 40, gap: Spacing.md },
  field: { gap: Spacing.sm },
  fieldLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  required: { color: Colors.danger },
  input: {
    backgroundColor: Colors.bg.input,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    color: Colors.text.primary,
    fontSize: FontSize.md,
  },
  textArea: { minHeight: 100 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  presetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetText: {
    color: Colors.text.secondary,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  presetTextActive: { color: '#fff' },
  submit: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontSize: FontSize.md, fontWeight: '800' },
  secondary: { paddingVertical: Spacing.md, alignItems: 'center' },
  secondaryText: { color: Colors.text.muted, fontSize: FontSize.sm, fontWeight: '600' },
});
