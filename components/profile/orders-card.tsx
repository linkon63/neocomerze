import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type OrderItem = {
  id: string;
  status: 'Delivered' | 'Processing' | 'In transit';
  total: string;
  date: string;
};

const orders: OrderItem[] = [
  {
    id: '#NC-2045',
    status: 'Delivered',
    total: '৳ 3,250',
    date: 'Delivered on Jan 5, 2025',
  },
  {
    id: '#NC-1988',
    status: 'In transit',
    total: '৳ 1,840',
    date: 'Out for delivery',
  },
  {
    id: '#NC-1904',
    status: 'Processing',
    total: '৳ 540',
    date: 'Packing items',
  },
];

const statusStyles: Record<OrderItem['status'], { color: string; backgroundColor: string }> = {
  Delivered: { color: '#16a34a', backgroundColor: '#dcfce7' },
  'In transit': { color: '#f97316', backgroundColor: '#fff7ed' },
  Processing: { color: '#2563eb', backgroundColor: '#e0e7ff' },
};

export function OrdersCard() {
  return (
    <ThemedView style={styles.card}>
      <ThemedText style={styles.heading}>Recent orders</ThemedText>
      <View style={styles.stack}>
        {orders.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={styles.meta}>
              <ThemedText style={styles.orderId}>{item.id}</ThemedText>
              <ThemedText style={styles.date}>{item.date}</ThemedText>
            </View>

            <View style={styles.amountBlock}>
              <ThemedText
                style={[
                  styles.statusPill,
                  statusStyles[item.status],
                ]}>
                {item.status}
              </ThemedText>
              <ThemedText style={styles.total}>{item.total}</ThemedText>
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
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  meta: {
    flex: 1,
    gap: 4,
  },
  orderId: {
    fontWeight: '800',
    fontSize: 15,
    color: '#111827',
  },
  date: {
    color: '#4b5563',
    fontSize: 13,
  },
  amountBlock: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '800',
    fontSize: 12,
  },
  total: {
    fontWeight: '800',
    fontSize: 16,
    color: '#0f172a',
  },
});
