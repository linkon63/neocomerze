import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type AddressItem = {
  label: string;
  detail: string;
  meta?: string;
};

const addresses: AddressItem[] = [
  {
    label: 'Home',
    detail: 'House 17, Road 12, Dhanmondi\nDhaka 1209',
    meta: 'Default shipping',
  },
  {
    label: 'Office',
    detail: '8th Floor, Soft Tower, Banani\nDhaka 1213',
    meta: 'Receives weekday deliveries',
  },
];

export function AddressCard() {
  return (
    <ThemedView style={styles.card}>
      <ThemedText style={styles.heading}>Saved addresses</ThemedText>
      <View style={styles.stack}>
        {addresses.map((item) => (
          <View key={item.label} style={styles.row}>
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{item.label.slice(0, 1)}</ThemedText>
            </View>

            <View style={styles.textBlock}>
              <ThemedText style={styles.label}>{item.label}</ThemedText>
              <ThemedText style={styles.detail}>{item.detail}</ThemedText>
              {item.meta ? <ThemedText style={styles.meta}>{item.meta}</ThemedText> : null}
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
    borderRadius: 12,
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
  label: {
    fontWeight: '800',
    fontSize: 15,
    color: '#111827',
  },
  detail: {
    color: '#4b5563',
    fontSize: 13,
    lineHeight: 19,
  },
  meta: {
    color: '#ea580c',
    fontWeight: '700',
    fontSize: 12,
  },
});
