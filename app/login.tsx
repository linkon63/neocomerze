import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { fetchJson } from '@/utils/api-client';
import { endpoints } from '@/constants/api';
import { GeneralInfo } from '@/types/home';
import { router } from 'expo-router';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';

export default function LoginScreen() {
  const { setAuthenticated, isAuthenticated } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generalInfo, setGeneralInfo] = useState<GeneralInfo | null>(null);

  useEffect(() => {
    fetchJson<{ generalInfo?: GeneralInfo }>(endpoints.generalInfo)
      .then((json) => setGeneralInfo(json.generalInfo ?? null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/profile');
    }
  }, [isAuthenticated]);

  const onSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (!phone || !password) {
        setError('Enter phone and password.');
        return;
      }
      const userDoc = doc(collection(db, 'users'), phone);
      const snap = await getDoc(userDoc);
      if (!snap.exists()) {
        setError('No account found for this phone.');
        return;
      }
      const data = snap.data() as { password?: string };
      if (data.password !== password) {
        setError('Invalid phone or password.');
        return;
      }
      setAuthenticated(true);
      router.replace('/profile');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {generalInfo?.media?.[0]?.original_url ? (
          <Image source={generalInfo.media[0].original_url} style={styles.logo} contentFit="contain" />
        ) : (
          <ThemedText type="title" style={styles.title}>
            {generalInfo?.shop_name || 'Welcome'}
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

          {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

          <Pressable style={styles.button} onPress={onSubmit} disabled={submitting}>
            <ThemedText style={styles.buttonText}>{submitting ? 'Signing in…' : 'Sign in'}</ThemedText>
          </Pressable>

          <View style={styles.secondaryActions}>
            <Pressable style={[styles.secondaryButton, styles.outline]} onPress={() => router.replace('/')}>
              <ThemedText style={styles.secondaryText}>Go to Home</ThemedText>
            </Pressable>
            <Pressable style={[styles.secondaryButton, styles.outline]} onPress={() => router.push('/register')}>
              <ThemedText style={styles.secondaryText}>Register</ThemedText>
            </Pressable>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
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
  secondaryActions: {
    marginTop: 10,
    gap: 8,
  },
  secondaryButton: {
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
