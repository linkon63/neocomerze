import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  UIManager,
  View,
} from 'react-native';
import { collection, doc, getDoc } from 'firebase/firestore';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { endpoints } from '@/constants/api';
import { useAuth } from '@/context/auth-context';
import { db } from '@/utils/firebase';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type OrderLine = {
  id: string;
  name: string;
  qty: number;
  price: number;
  image?: string;
};

type OrderCard = {
  id: string;
  status: string;
  total: number;
  placedAt?: string;
  items: OrderLine[];
};

const statusStyles: Record<string, { color: string; backgroundColor: string }> = {
  delivered: { color: '#16a34a', backgroundColor: '#dcfce7' },
  'in transit': { color: '#f97316', backgroundColor: '#fff7ed' },
  processing: { color: '#2563eb', backgroundColor: '#e0e7ff' },
  unpaid: { color: '#f97316', backgroundColor: '#fff7ed' },
  paid: { color: '#16a34a', backgroundColor: '#dcfce7' },
};

const parseMoney = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '').replace(/,/g, '');
    const num = parseFloat(cleaned);
    return Number.isFinite(num) ? num : 0;
  }
  return 0;
};
const formatMoney = (value: number) => `৳ ${value.toFixed(2)}`;

export function OrdersCard() {
  const { userPhone } = useAuth();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderCard[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomer = async () => {
      if (!userPhone) return;
      try {
        const snap = await getDoc(doc(collection(db, 'users'), userPhone));
        if (snap.exists()) {
          const data = snap.data() as { customer_id?: string };
          if (data?.customer_id) {
            setCustomerId(data.customer_id);
          }
        }
      } catch {
        // ignore
      }
    };
    loadCustomer();
  }, [userPhone]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!customerId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${endpoints.orders}?customer_id=${customerId}`);
        const json: any = await res.json();
        const rawCandidate = json?.data ?? json?.orders ?? json;
        const rawArray: any[] = Array.isArray(rawCandidate)
          ? rawCandidate
          : Array.isArray(rawCandidate?.data)
          ? rawCandidate.data
          : Array.isArray(rawCandidate?.orders)
          ? rawCandidate.orders
          : [];
        const mapped: OrderCard[] = rawArray.map((o: any, idx: number) => {
          const lineSource =
            o?.purchasable_items ??
            o?.purchasable ??
            o?.items ??
            o?.order_items ??
            o?.order_lines ??
            [];
          const lines: OrderLine[] = Array.isArray(lineSource)
            ? lineSource.map((p: any, i: number) => ({
                id: p?.id?.toString?.() || `${o?.id || idx}-item-${i}`,
                name:
                  p?.name ||
                  p?.product_name ||
                  p?.description ||
                  p?.meta_data?.sku ||
                  'Item',
                qty: p?.quantity || p?.order_quantity || 1,
                price: parseMoney(
                  p?.total_price ?? p?.price ?? p?.unit_price ?? p?.order_unit_price ?? p?.amount
                ),
                image:
                  p?.image ||
                  p?.media?.[0]?.original_url ||
                  p?.product_image ||
                  p?.purchasable?.product?.media?.[0]?.original_url ||
                  p?.purchasable?.product?.images?.[0] ||
                  p?.purchasable?.media?.[0]?.original_url ||
                  p?.meta_data?.image ||
                  (Array.isArray(p?.meta_data?.images) ? p.meta_data.images[0] : undefined),
              }))
            : [];
          const total = parseMoney(o?.total ?? o?.amount_due ?? o?.grand_total ?? o?.subtotal);
          return {
            id: o?.order_number || o?.id?.toString?.() || `order-${idx}`,
            status: (o?.order_status || o?.status || 'Processing').toString(),
            total,
            placedAt: o?.sale_at || o?.created_at,
            items: lines,
          };
        });
        setOrders(mapped);
      } catch (err: any) {
        setError(err?.message || 'Could not load orders');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [customerId]);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderedOrders = useMemo(() => orders, [orders]);

  return (
    <ThemedView style={styles.card}>
      <View style={styles.header}>
        <ThemedText style={styles.heading}>Orders</ThemedText>
        <ThemedText style={styles.hint}>Track delivery status and totals.</ThemedText>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#f97316" />
          <ThemedText style={styles.hint}>Loading orders…</ThemedText>
        </View>
      ) : error ? (
        <ThemedText style={styles.error}>{error}</ThemedText>
      ) : renderedOrders.length === 0 ? (
        <ThemedText style={styles.hint}>No orders yet.</ThemedText>
      ) : (
        <View style={styles.stack}>
          {renderedOrders.map((order) => {
            const isOpen = expanded.has(order.id);
            const statusKey = order.status.toLowerCase();
            const statusStyle = statusStyles[statusKey] ?? {
              color: '#2563eb',
              backgroundColor: '#e0e7ff',
            };
            return (
              <View key={order.id} style={styles.row}>
                <Pressable style={styles.rowTop} onPress={() => toggleExpand(order.id)}>
                  <View style={styles.meta}>
                    <ThemedText style={styles.orderId}>Order #{order.id}</ThemedText>
                    {order.placedAt ? (
                      <ThemedText style={styles.date}>{order.placedAt}</ThemedText>
                    ) : null}
                    <View style={[styles.statusPill, statusStyle]}>
                      <ThemedText style={[styles.statusText, {textTransform: 'capitalize'}]}>{order.status}</ThemedText>
                    </View>
                  </View>
                  <View style={styles.amountBlock}>
                    <ThemedText style={styles.total}>{formatMoney(order.total)}</ThemedText>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#6b7280"
                    />
                  </View>
                </Pressable>

                {isOpen ? (
                  <View style={styles.items}>
                    {order.items.map((line) => (
                      <View key={line.id} style={styles.itemRow}>
                        {line.image ? (
                          <View style={styles.thumbWrap}>
                            <Image source={line.image} style={styles.thumb} contentFit="cover" />
                          </View>
                        ) : (
                          <View style={[styles.thumbWrap, styles.thumbPlaceholder]} />
                        )}
                        <View style={{ flex: 1 }}>
                          <ThemedText style={styles.itemName}>{line.name}</ThemedText>
                          <ThemedText style={styles.itemMeta}>Qty: {line.qty}</ThemedText>
                        </View>
                        <ThemedText style={styles.itemPrice}>
                          {formatMoney((line.price || 0) * line.qty)}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      )}
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
  header: { gap: 4 },
  heading: {
    fontWeight: '800',
    fontSize: 18,
    color: '#111827',
  },
  hint: {
    color: '#6b7280',
    fontSize: 12,
  },
  loading: { alignItems: 'center', gap: 6, paddingVertical: 10 },
  error: { color: '#c0362c', fontWeight: '700' },
  stack: {
    gap: 12,
  },
  row: {
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 14,
    backgroundColor: '#fdfdfd',
    overflow: 'hidden',
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  meta: {
    flex: 1,
    gap: 6,
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
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontWeight: '800',
    fontSize: 12,
  },
  total: {
    fontWeight: '800',
    fontSize: 16,
    color: '#0f172a',
  },
  items: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#ffffff',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  thumb: { width: '100%', height: '100%' },
  thumbPlaceholder: { backgroundColor: '#e5e7eb' },
  itemName: {
    fontWeight: '700',
    fontSize: 13,
  },
  itemMeta: {
    color: '#6b7280',
    fontSize: 12,
  },
  itemPrice: {
    fontWeight: '800',
    fontSize: 13,
    color: '#111827',
  },
});
