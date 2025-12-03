import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { collection, doc, getDoc } from 'firebase/firestore';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth-context';
import { endpoints } from '@/constants/api';
import { db } from '@/utils/firebase';
import { divisions, districts } from '@/data/locations';

export type CheckoutAddress = {
  id: string;
  label: string;
  address: string;
  city?: string;
  phone?: string;
  isDefault?: boolean;
};

type Props = {
  selectedId: string | null;
  onSelect: (address: CheckoutAddress | null) => void;
};

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  addressLine: string;
  divisionId: string;
  districtId: string;
  area: string;
  postcode: string;
  country: string;
};

const initialForm: FormState = {
  firstName: '',
  lastName: '',
  phone: '',
  addressLine: '',
  divisionId: '',
  districtId: '',
  area: '',
  postcode: '',
  country: 'Bangladesh',
};

export function AddressSelector({ selectedId, onSelect }: Props) {
  const { userPhone } = useAuth();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<CheckoutAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [divisionOpen, setDivisionOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedId) || null,
    [addresses, selectedId]
  );

  const filteredDistricts = useMemo(
    () => districts.filter((d) => d.division_id === form.divisionId),
    [form.divisionId]
  );

  const divisionName = (id: string) => divisions.find((d) => d.id === id)?.name || '';
  const districtName = (id: string) => districts.find((d) => d.id === id)?.name || '';

  useEffect(() => {
    const loadCustomer = async () => {
      if (!userPhone) return;
      try {
        const snap = await getDoc(doc(collection(db, 'users'), userPhone));
        if (snap.exists()) {
          const data = snap.data() as { customer_id?: string; first_name?: string; last_name?: string; phone?: string };
          if (data?.customer_id) {
            setCustomerId(data.customer_id);
          }
          setForm((prev) => ({
            ...prev,
            firstName: data?.first_name || prev.firstName,
            lastName: data?.last_name || prev.lastName,
            phone: data?.phone || prev.phone || userPhone,
          }));
        }
      } catch {
        // ignore
      }
    };
    loadCustomer();
  }, [userPhone]);

  useEffect(() => {
    const loadAddresses = async () => {
      if (!customerId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${endpoints.customers}/${customerId}`);
        const json: any = await res.json();
        const raw =
          (json?.data?.addresses as any[]) ||
          (json?.addresses as any[]) ||
          (json?.data?.mailing_address ? [json.data.mailing_address] : []) ||
          (json?.mailing_address ? [json.mailing_address] : []);
        console.log('Fetched addresses:', raw);
        const mapped: CheckoutAddress[] =
          raw?.map((a: any, idx: number) => ({
            id: a?.id?.toString() || `addr-${idx}`,
            label: `${a?.first_name ?? ''} ${a?.last_name ?? ''}`.trim() || 'Saved address',
            address: a?.address || a?.addressLine || '',
            city: a?.city,
            phone: a?.phone,
            isDefault: Boolean(a?.is_default),
          })) ?? [];

        setAddresses(mapped);
        if (!selectedId && mapped.length) {
          onSelect(mapped[0]);
        }
      } catch (err: any) {
        setError(err?.message || 'Could not load addresses');
      } finally {
        setLoading(false);
      }
    };
    loadAddresses();
  }, [customerId, onSelect, selectedId]);

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'divisionId') {
        next.districtId = '';
      }
      return next;
    });
    setError(null);
  };

  const handleSave = async () => {
    setError(null);
    if (
      !form.firstName ||
      !form.lastName ||
      !form.phone ||
      !form.addressLine ||
      !form.area ||
      !form.divisionId ||
      !form.districtId ||
      !form.postcode
    ) {
      setError('Please fill all required fields');
      return;
    }
    if (!customerId) {
      setError('Missing customer id. Please re-login.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        mailing_address: {
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
          state: divisionName(form.divisionId),
          city: districtName(form.districtId),
          address: `${form.area}, ${form.addressLine}`,
          postcode: form.postcode,
          country: form.country,
          type: 'billing',
          mark_as_both: true,
          is_default: true,
        },
      };
      const res = await fetch(`${endpoints.customers}/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Could not save address');
      }
      const newAddress: CheckoutAddress = {
        id: `new-${Date.now()}`,
        label: `${form.firstName} ${form.lastName}`,
        address: `${form.area}, ${form.addressLine}`,
        city: districtName(form.districtId) || form.area,
        phone: form.phone,
        isDefault: true,
      };
      setAddresses((prev) => [newAddress, ...prev]);
      onSelect(newAddress);
      setShowForm(false);
    } catch (err: any) {
      setError(err?.message || 'Could not save address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View>
          <ThemedText type="subtitle">Delivery address</ThemedText>
          <ThemedText style={styles.hint}>Select or add where to deliver.</ThemedText>
        </View>
        <Pressable style={styles.addButton} onPress={() => setShowForm(true)}>
          <Ionicons name="add" size={16} color="#0f766e" />
          <ThemedText style={styles.addText}>Add</ThemedText>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#0f766e" />
          <ThemedText style={styles.hint}>Loading addresses…</ThemedText>
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.empty}>
          <ThemedText style={styles.hint}>No saved addresses yet.</ThemedText>
          <Pressable style={styles.emptyAdd} onPress={() => setShowForm(true)}>
            <ThemedText style={styles.emptyAddText}>Add address</ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.list}>
          {addresses.map((addr) => {
            const isActive = selectedAddress?.id === addr.id;
            return (
              <Pressable
                key={addr.id}
                style={[
                  styles.addressCard,
                  {
                    borderColor: isActive ? '#0f766e' : '#e5e7eb',
                    backgroundColor: isActive ? '#ecfdf3' : '#ffffff',
                  },
                ]}
                onPress={() => onSelect(addr)}>
                <View style={styles.addressRow}>
                  <Ionicons
                    name={isActive ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={isActive ? '#0f766e' : '#9ca3af'}
                  />
                  <View style={styles.addressMeta}>
                    <ThemedText style={styles.addrTitle}>{addr.label}</ThemedText>
                    <ThemedText style={styles.addrDetail}>{addr.address}</ThemedText>
                    {addr.city ? (
                      <ThemedText style={styles.addrDetail}>{addr.city}</ThemedText>
                    ) : null}
                    {addr.phone ? (
                      <ThemedText style={styles.addrDetail}>Phone: {addr.phone}</ThemedText>
                    ) : null}
                  </View>
                  {addr.isDefault ? (
                    <View style={styles.badge}>
                      <ThemedText style={styles.badgeText}>Default</ThemedText>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>New address</ThemedText>
              <Pressable onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={20} color="#111827" />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
              <View style={styles.row}>
                <TextInput
                  placeholder="First name*"
                  placeholderTextColor="#9ca3af"
                  value={form.firstName}
                  onChangeText={(text) => updateField('firstName', text)}
                  style={[styles.input, styles.half]}
                />
                <TextInput
                  placeholder="Last name*"
                  placeholderTextColor="#9ca3af"
                  value={form.lastName}
                  onChangeText={(text) => updateField('lastName', text)}
                  style={[styles.input, styles.half]}
                />
              </View>
              <TextInput
                placeholder="Phone*"
                placeholderTextColor="#9ca3af"
                value={form.phone}
                onChangeText={(text) => updateField('phone', text)}
                style={styles.input}
                keyboardType="phone-pad"
              />

              <Pressable
                style={styles.select}
                onPress={() => {
                  setDivisionOpen((prev) => !prev);
                  setDistrictOpen(false);
                }}>
                <ThemedText style={styles.selectLabel}>Division*</ThemedText>
                <ThemedText style={styles.selectValue}>
                  {divisionName(form.divisionId) || 'Select division'}
                </ThemedText>
              </Pressable>
              {divisionOpen ? (
                <View style={styles.optionList}>
                  {divisions.map((div) => (
                    <Pressable
                      key={div.id}
                      style={styles.optionItem}
                      onPress={() => {
                        updateField('divisionId', div.id);
                        setDivisionOpen(false);
                      }}>
                      <ThemedText>{div.name}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              <Pressable
                style={[styles.select, { opacity: form.divisionId ? 1 : 0.6 }]}
                disabled={!form.divisionId}
                onPress={() => {
                  setDistrictOpen((prev) => !prev);
                  setDivisionOpen(false);
                }}>
                <ThemedText style={styles.selectLabel}>District*</ThemedText>
                <ThemedText style={styles.selectValue}>
                  {districtName(form.districtId) || 'Select district'}
                </ThemedText>
              </Pressable>
              {districtOpen ? (
                <View style={styles.optionList}>
                  {filteredDistricts.map((dist) => (
                    <Pressable
                      key={dist.id}
                      style={styles.optionItem}
                      onPress={() => {
                        updateField('districtId', dist.id);
                        setDistrictOpen(false);
                      }}>
                      <ThemedText>{dist.name}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              <TextInput
                placeholder="Area / City*"
                placeholderTextColor="#9ca3af"
                value={form.area}
                onChangeText={(text) => updateField('area', text)}
                style={styles.input}
              />
              <TextInput
                placeholder="Address line*"
                placeholderTextColor="#9ca3af"
                value={form.addressLine}
                onChangeText={(text) => updateField('addressLine', text)}
                style={styles.input}
              />
              <View style={styles.row}>
                <TextInput
                  placeholder="Postcode*"
                  placeholderTextColor="#9ca3af"
                  value={form.postcode}
                  onChangeText={(text) => updateField('postcode', text)}
                  style={[styles.input, styles.half]}
                  keyboardType="number-pad"
                />
                <TextInput
                  placeholder="Country*"
                  placeholderTextColor="#9ca3af"
                  value={form.country}
                  onChangeText={(text) => updateField('country', text)}
                  style={[styles.input, styles.half]}
                />
              </View>

              {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
              <Pressable
                disabled={saving}
                style={[styles.saveButton, { opacity: saving ? 0.7 : 1 }]}
                onPress={handleSave}>
                <ThemedText style={styles.saveText}>{saving ? 'Saving…' : 'Save address'}</ThemedText>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hint: {
    color: '#6b7280',
    fontSize: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0f766e',
    backgroundColor: '#ecfdf3',
  },
  addText: {
    color: '#0f766e',
    fontWeight: '700',
  },
  loading: {
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  empty: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    gap: 8,
  },
  emptyAdd: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0f766e',
    borderRadius: 10,
  },
  emptyAddText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  list: {
    gap: 10,
  },
  addressCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  addressRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  addressMeta: {
    flex: 1,
    gap: 2,
  },
  addrTitle: {
    fontWeight: '800',
  },
  addrDetail: {
    color: '#4b5563',
    fontSize: 12,
    lineHeight: 16,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#0f766e',
    borderRadius: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: '800',
    fontSize: 16,
  },
  form: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
  select: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
  },
  selectLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  selectValue: {
    fontWeight: '700',
    marginTop: 4,
  },
  optionList: {
    maxHeight: 160,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  optionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  error: {
    color: '#c0362c',
    fontSize: 12,
  },
  saveButton: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#0f766e',
    alignItems: 'center',
  },
  saveText: {
    color: '#ffffff',
    fontWeight: '800',
  },
});
