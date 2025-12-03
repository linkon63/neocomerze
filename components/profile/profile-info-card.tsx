import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export function ProfileInfoCard() {
  const fields = [
    { label: 'Full name', value: 'Linkon' },
    { label: 'Phone', value: '+880 1516-164420' },
    { label: 'Email', value: 'linkon@demo.com' },
  ];

  return (
    <ThemedView style={styles.card}>
      <ThemedText style={styles.heading}>Account overview</ThemedText>

      <View style={styles.fieldStack}>
        {fields.map((item) => (
          <View key={item.label} style={styles.row}>
            <ThemedText style={styles.label}>{item.label}</ThemedText>
            <ThemedText style={styles.value}>{item.value}</ThemedText>
          </View>
        ))}
      </View>

      <View style={styles.tags}>
        <ThemedText style={styles.tag}>Preferred shopper</ThemedText>
        <ThemedText style={[styles.tag, styles.secondaryTag]}>Phone verified</ThemedText>
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
  },
  heading: {
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 12,
    color: '#111827',
  },
  fieldStack: {
    gap: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: '#6b7280',
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#fff4ec',
    color: '#f97316',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontWeight: '700',
    fontSize: 12,
  },
  secondaryTag: {
    backgroundColor: '#ecfeff',
    color: '#0284c7',
  },
});
