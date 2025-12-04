import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { fetchJson } from '@/utils/api-client';
import { endpoints } from '@/constants/api';
import { GeneralInfo } from '@/types/home';
import { router } from 'expo-router';
import { db } from '@/utils/firebase';

export default function RegisterScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generalInfo, setGeneralInfo] = useState<GeneralInfo | null>(null);

  useEffect(() => {
    fetchJson<{ generalInfo?: GeneralInfo }>(endpoints.generalInfo)
      .then((json) => setGeneralInfo(json.generalInfo ?? null))
      .catch(() => {});
  }, []);

  const onSubmit = async () => {
    setError(null);
    if (!phone || !password || !confirm) {
      setError('Please fill all fields');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      const usersRef = collection(db, 'users');
      const userDoc = doc(usersRef, phone);
      const existing = await getDoc(userDoc);
      if (existing.exists()) {
        setError('An account with this phone already exists.');
        return;
      }

      let customerId: string | undefined;
      try {
        const res = await fetch(endpoints.customers, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ phone }),
        });
        const json = await res.json();
        if (!res.ok || json?.status !== 'success') {
          throw new Error(json?.message || 'Could not create customer in inventory.');
        }
        customerId = json?.data?.id?.toString();
      } catch (err: any) {
        setError(err?.message || 'Inventory service error. Please try again.');
        return;
      }

      await setDoc(userDoc, {
        phone,
        password,
        customer_id: customerId,
        createdAt: serverTimestamp(),
      });
      router.replace('/login');
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        setError('Permission denied. Check Firestore rules or credentials.');
      } else {
        setError(err?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.container}>
            {generalInfo?.media?.[0]?.original_url ? (
              <Image source={generalInfo.media[0].original_url} style={styles.logo} contentFit="contain" />
            ) : (
              <ThemedText type="title" style={styles.title}>
                {generalInfo?.shop_name || 'Register'}
              </ThemedText>
            )}
            {generalInfo?.top_bar_slogan ? (
              <ThemedText style={styles.subtitle}>{generalInfo.top_bar_slogan}</ThemedText>
            ) : null}

            <View style={styles.form}>
              <ThemedText style={styles.label}>Phone</ThemedText>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="01516164420"
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />

              <ThemedText style={styles.label}>Password</ThemedText>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="password"
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />

              <ThemedText style={styles.label}>Confirm password</ThemedText>
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                placeholder="password"
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />

              {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

              <Pressable style={styles.button} onPress={onSubmit} disabled={submitting}>
                <ThemedText style={styles.buttonText}>{submitting ? 'Submitting…' : 'Register'}</ThemedText>
              </Pressable>
              <Pressable style={[styles.secondaryButton, styles.outline]} onPress={() => router.replace('/login')}>
                <ThemedText style={styles.secondaryText}>Back to login</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardAvoider: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    gap: 12,
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontWeight: '700',
    fontSize: 22,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 10,
    marginTop: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f8f9fb',
  },
  error: {
    color: '#b91c1c',
    fontSize: 12,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#f85606',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  outline: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
