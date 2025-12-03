import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { divisions, districts } from '../../data/locations';

type AddressItem = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  divisionId: string;
  districtId: string;
  area: string;
  addressLine: string;
  isDefault: boolean;
};

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  divisionId: string;
  districtId: string;
  area: string;
  addressLine: string;
  isDefault: boolean;
};

const initialForm: FormState = {
  firstName: '',
  lastName: '',
  phone: '',
  divisionId: '',
  districtId: '',
  area: '',
  addressLine: '',
  isDefault: false,
};

const initialAddresses: AddressItem[] = [
  {
    id: 'home',
    firstName: 'Linkon',
    lastName: '',
    phone: '+880 1516-164420',
    divisionId: '3',
    districtId: '1',
    area: 'Dhanmondi',
    addressLine: 'House 17, Road 12, Dhaka 1209',
    isDefault: true,
  },
  {
    id: 'office',
    firstName: 'Linkon',
    lastName: '',
    phone: '+880 1516-164420',
    divisionId: '3',
    districtId: '11',
    area: 'Banani',
    addressLine: '8th Floor, Soft Tower, Banani 1213',
    isDefault: false,
  },
];

export function AddressCard() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [addressList, setAddressList] = useState<AddressItem[]>(initialAddresses);
  const [divisionOpen, setDivisionOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);

  const filteredDistricts = useMemo(
    () => districts.filter((d) => d.division_id === form.divisionId),
    [form.divisionId]
  );

  const divisionName = (id: string) => divisions.find((d) => d.id === id)?.name || '';
  const districtName = (id: string) => districts.find((d) => d.id === id)?.name || '';

  const handleChange = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => {
      const next = {
        ...prev,
        [key]: value,
      };
      if (key === 'divisionId') {
        next.districtId = '';
      }
      return next;
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    (['firstName', 'lastName', 'phone', 'divisionId', 'districtId', 'area', 'addressLine'] as const).forEach(
      (field) => {
        if (!String(form[field]).trim()) {
          nextErrors[field] = 'Required';
        }
      }
    );

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    const payload = {
      ...form,
      division: divisionName(form.divisionId),
      district: districtName(form.districtId),
    };

    console.log('Address form submitted', payload);

    setAddressList((prev) => [
      {
        id: `${Date.now()}`,
        ...form,
      },
      ...prev,
    ]);
    setForm(initialForm);
    setShowForm(false);
    setDivisionOpen(false);
    setDistrictOpen(false);
  };

  return (
    <ThemedView style={styles.card}>
      <View style={styles.headerRow}>
        <ThemedText style={styles.heading}>Saved addresses</ThemedText>
        <Pressable
          style={styles.createButton}
          onPress={() => setShowForm((prev) => !prev)}>
          <Ionicons name="location-outline" size={18} color="#ffffff" />
          <ThemedText style={styles.createButtonText}>
            {showForm ? 'Close' : 'Address'}
          </ThemedText>
        </Pressable>
      </View>

      {showForm ? (
        <View style={styles.formCard}>
          <View style={styles.formRow}>
            <View style={styles.inputBlock}>
              <ThemedText style={styles.label}>First name</ThemedText>
              <TextInput
                placeholder="First name"
                placeholderTextColor="#9ca3af"
                style={[styles.input, errors.firstName && styles.inputError]}
                value={form.firstName}
                onChangeText={(text) => handleChange('firstName', text)}
              />
              {errors.firstName ? <ThemedText style={styles.errorText}>{errors.firstName}</ThemedText> : null}
            </View>
            <View style={styles.inputBlock}>
              <ThemedText style={styles.label}>Last name</ThemedText>
              <TextInput
                placeholder="Last name"
                placeholderTextColor="#9ca3af"
                style={[styles.input, errors.lastName && styles.inputError]}
                value={form.lastName}
                onChangeText={(text) => handleChange('lastName', text)}
              />
              {errors.lastName ? <ThemedText style={styles.errorText}>{errors.lastName}</ThemedText> : null}
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.inputBlock}>
              <ThemedText style={styles.label}>Phone</ThemedText>
              <TextInput
                placeholder="+880 1XXXXXXXXX"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                style={[styles.input, errors.phone && styles.inputError]}
                value={form.phone}
                onChangeText={(text) => handleChange('phone', text)}
              />
              {errors.phone ? <ThemedText style={styles.errorText}>{errors.phone}</ThemedText> : null}
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.inputBlock}>
              <ThemedText style={styles.label}>Division</ThemedText>
              <View style={[styles.select, errors.divisionId && styles.inputError]}>
                <Pressable
                  style={styles.selectTrigger}
                  onPress={() => {
                    setDivisionOpen((prev) => !prev);
                    setDistrictOpen(false);
                  }}>
                  <ThemedText style={styles.selectText}>
                    {form.divisionId ? divisionName(form.divisionId) : 'Select division'}
                  </ThemedText>
                  <Ionicons
                    name={divisionOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#6b7280"
                  />
                </Pressable>
                {divisionOpen ? (
                  <View style={styles.dropdown}>
                    <ScrollView style={styles.dropdownScroll}>
                      {divisions.map((item) => (
                        <Pressable
                          key={item.id}
                          style={styles.option}
                          onPress={() => {
                            handleChange('divisionId', item.id);
                            setDivisionOpen(false);
                          }}>
                          <ThemedText style={styles.optionText}>{item.name}</ThemedText>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}
              </View>
              {errors.divisionId ? <ThemedText style={styles.errorText}>{errors.divisionId}</ThemedText> : null}
            </View>

            <View style={styles.inputBlock}>
              <ThemedText style={styles.label}>District</ThemedText>
              <View style={[styles.select, errors.districtId && styles.inputError]}>
                <Pressable
                  style={styles.selectTrigger}
                  onPress={() => {
                    setDistrictOpen((prev) => !prev);
                    setDivisionOpen(false);
                  }}>
                  <ThemedText style={styles.selectText}>
                    {form.districtId ? districtName(form.districtId) : 'Select district'}
                  </ThemedText>
                  <Ionicons
                    name={districtOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#6b7280"
                  />
                </Pressable>
                {districtOpen ? (
                  <View style={styles.dropdown}>
                    <ScrollView style={styles.dropdownScroll}>
                      {filteredDistricts.map((item) => (
                        <Pressable
                          key={item.id}
                          style={styles.option}
                          onPress={() => {
                            handleChange('districtId', item.id);
                            setDistrictOpen(false);
                          }}>
                          <ThemedText style={styles.optionText}>{item.name}</ThemedText>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}
              </View>
              {errors.districtId ? <ThemedText style={styles.errorText}>{errors.districtId}</ThemedText> : null}
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.inputBlock}>
              <ThemedText style={styles.label}>Area</ThemedText>
              <TextInput
                placeholder="Area"
                placeholderTextColor="#9ca3af"
                style={[styles.input, errors.area && styles.inputError]}
                value={form.area}
                onChangeText={(text) => handleChange('area', text)}
              />
              {errors.area ? <ThemedText style={styles.errorText}>{errors.area}</ThemedText> : null}
            </View>
            <View style={styles.inputBlock}>
              <ThemedText style={styles.label}>Address</ThemedText>
              <TextInput
                placeholder="House, road, block"
                placeholderTextColor="#9ca3af"
                style={[styles.input, errors.addressLine && styles.inputError]}
                value={form.addressLine}
                onChangeText={(text) => handleChange('addressLine', text)}
              />
              {errors.addressLine ? <ThemedText style={styles.errorText}>{errors.addressLine}</ThemedText> : null}
            </View>
          </View>

          <Pressable
            style={styles.checkboxRow}
            onPress={() => handleChange('isDefault', !form.isDefault)}>
            <Ionicons
              name={form.isDefault ? 'checkbox' : 'square-outline'}
              size={22}
              color={form.isDefault ? '#f97316' : '#6b7280'}
            />
            <ThemedText style={styles.checkboxLabel}>Set as default address</ThemedText>
          </Pressable>

          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <ThemedText style={styles.submitText}>Save address</ThemedText>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.stack}>
        {addressList.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>
                {item.firstName.slice(0, 1).toUpperCase()}
              </ThemedText>
            </View>

            <View style={styles.textBlock}>
              <View style={styles.rowHeader}>
                <ThemedText style={styles.label}>
                  {item.firstName} {item.lastName}
                </ThemedText>
                {item.isDefault ? <ThemedText style={styles.defaultPill}>Default</ThemedText> : null}
              </View>
              <ThemedText style={styles.detail}>{item.phone}</ThemedText>
              <ThemedText style={styles.detail}>{item.addressLine}</ThemedText>
              <ThemedText style={styles.detail}>
                {item.area}, {districtName(item.districtId)}, {divisionName(item.divisionId)}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#f1f3f5',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f97316',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 0,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  heading: {
    fontWeight: '800',
    fontSize: 18,
    color: '#111827',
  },
  formCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fffaf5',
    gap: 12,
  },
  formRow: {
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
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 12,
    marginTop: 4,
  },
  select: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 0,
    backgroundColor: '#ffffff',
  },
  selectTrigger: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 14,
    color: '#111827',
  },
  dropdown: {
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 200,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionText: {
    fontSize: 14,
    color: '#111827',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 0,
    alignItems: 'center',
  },
  submitText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
  stack: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 0,
    backgroundColor: '#fff1e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#f97316',
    fontWeight: '800',
    fontSize: 16,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  detail: {
    color: '#4b5563',
    fontSize: 13,
    lineHeight: 19,
  },
  defaultPill: {
    backgroundColor: '#ecfdf3',
    color: '#15803d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    fontWeight: '800',
    fontSize: 11,
  },
});
