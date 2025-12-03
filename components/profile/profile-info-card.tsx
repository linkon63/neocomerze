import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { collection, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { endpoints } from '@/constants/api';
import { db } from '@/utils/firebase';
import { useAuth } from '@/context/auth-context';

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

type ProfileInfoCardProps = {
  onProfileSaved?: (data: FormState) => void;
};

const initialForm: FormState = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
};

export function ProfileInfoCard({ onProfileSaved }: ProfileInfoCardProps) {
  const { userPhone } = useAuth();
  const [form, setForm] = useState<FormState>(() => ({
    ...initialForm,
    phone: userPhone || '',
  }));
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);

  useEffect(() => {
    if (userPhone && !form.phone) {
      setForm((prev) => ({ ...prev, phone: userPhone }));
    }
  }, [userPhone, form.phone]);

  useEffect(() => {
    const loadCustomer = async () => {
      if (!userPhone) return;
      setLoadingExisting(true);
      try {
        const snap = await getDoc(doc(collection(db, 'users'), userPhone));
        if (snap.exists()) {
          const data = snap.data() as {
            customer_id?: string;
            first_name?: string;
            last_name?: string;
            email?: string;
            phone?: string;
          };
          if (data?.customer_id) {
            setCustomerId(data.customer_id);
          }
          setForm((prev) => ({
            ...prev,
            firstName: data?.first_name || prev.firstName,
            lastName: data?.last_name || prev.lastName,
            email: data?.email || prev.email,
            phone: data?.phone || prev.phone || userPhone,
          }));
        }
      } catch (err) {
        // ignore fetch errors for now; submit will surface errors
      } finally {
        setLoadingExisting(false);
      }
    };
    loadCustomer();
  }, [userPhone]);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    (['firstName', 'lastName', 'phone', 'email'] as const).forEach((field) => {
      if (!form[field].trim()) {
        nextErrors[field] = 'Required';
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async () => {
    setStatus(null);
    if (!validate()) return;
    if (!customerId) {
      setStatus('Missing customer id. Please re-login or register.');
      return;
    }
    setSubmitting(true);
    try {
      // Update Firestore
      const userDoc = doc(collection(db, 'users'), form.phone);
      await setDoc(
        userDoc,
        {
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
          email: form.email,
          customerphonenumber: form.phone,
          profile_payload: {
            current_password: '',
            email: form.email,
            first_name: form.firstName,
            last_name: form.lastName,
            password: '',
            password_confirmation: '',
            phone: form.phone,
            customerphonenumber: form.phone,
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // PUT customers API
      const res = await fetch(`${endpoints.customers}/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          current_password: '',
          email: form.email,
          first_name: form.firstName,
          last_name: form.lastName,
          password: '',
          password_confirmation: '',
          phone: form.phone,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Profile update failed (${res.status})`);
      }

      onProfileSaved?.(form);
      setStatus('Profile saved');
    } catch (err: any) {
      setStatus(err?.message || 'Could not save profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.card}>
      <ThemedText style={styles.heading}>Profile info</ThemedText>

      <View style={styles.form}>
        <View style={styles.row}>
          <View style={styles.inputBlock}>
            <ThemedText style={styles.label}>First name</ThemedText>
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              placeholder="First name"
              placeholderTextColor="#9ca3af"
              value={form.firstName}
              onChangeText={(text) => handleChange('firstName', text)}
            />
            {errors.firstName ? (
              <ThemedText style={styles.error}>{errors.firstName}</ThemedText>
            ) : null}
          </View>
          <View style={styles.inputBlock}>
            <ThemedText style={styles.label}>Last name</ThemedText>
            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              placeholder="Last name"
              placeholderTextColor="#9ca3af"
              value={form.lastName}
              onChangeText={(text) => handleChange('lastName', text)}
            />
            {errors.lastName ? <ThemedText style={styles.error}>{errors.lastName}</ThemedText> : null}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputBlock}>
          <ThemedText style={styles.label}>Phone</ThemedText>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="01XXXXXXXXX"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            value={form.phone}
            editable={false}
          />
          {errors.phone ? <ThemedText style={styles.error}>{errors.phone}</ThemedText> : null}
        </View>
        <View style={styles.inputBlock}>
          <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="email@example.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(text) => handleChange('email', text)}
            />
            {errors.email ? <ThemedText style={styles.error}>{errors.email}</ThemedText> : null}
          </View>
        </View>

        <Pressable style={styles.button} onPress={onSubmit} disabled={submitting || loadingExisting}>
          <ThemedText style={styles.buttonText}>
            {submitting ? 'Saving…' : loadingExisting ? 'Loading…' : 'Save'}
          </ThemedText>
        </Pressable>
        {status ? <ThemedText style={styles.status}>{status}</ThemedText> : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f3f5',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    gap: 12,
  },
  heading: {
    fontWeight: '800',
    fontSize: 18,
    color: '#111827',
  },
  form: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  inputBlock: {
    flex: 1,
    minWidth: '45%',
  },
  label: {
    fontWeight: '800',
    fontSize: 14,
    color: '#111827',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  error: {
    color: '#b91c1c',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
  status: {
    fontSize: 13,
    color: '#111827',
  },
});
