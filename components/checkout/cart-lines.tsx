import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CartItem } from '@/context/cart-context';

type Props = {
  items: CartItem[];
  accent: string;
};

const parsePrice = (price: string) => {
  const numeric = parseFloat(price.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

export function CartLines({ items, accent }: Props) {
  return (
    <View style={styles.card}>
      <ThemedText type="subtitle">Items</ThemedText>
      <View style={styles.list}>
        {items.map((item) => {
          const lineTotal = parsePrice(item.price) * item.quantity;
          return (
            <View key={`${item.id}-${item.variantId ?? 'base'}`} style={styles.line}>
              <View style={styles.thumbWrap}>
                {item.image ? (
                  <Image source={item.image} style={styles.thumb} contentFit="cover" />
                ) : (
                  <View style={[styles.thumb, styles.thumbPlaceholder]} />
                )}
              </View>
              <View style={styles.meta}>
                <ThemedText style={styles.title}>{item.name}</ThemedText>
                {item.variantLabel ? (
                  <ThemedText style={styles.variant}>{item.variantLabel}</ThemedText>
                ) : null}
                <ThemedText style={styles.qty}>Qty: {item.quantity}</ThemedText>
              </View>
              <View style={styles.amounts}>
                <ThemedText style={[styles.price, { color: accent }]}>{item.price}</ThemedText>
                <ThemedText style={styles.lineTotal}>BDT {lineTotal.toFixed(2)}</ThemedText>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
  },
  list: {
    gap: 10,
  },
  line: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  thumbWrap: {
    width: 54,
    height: 54,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    backgroundColor: '#e5e7eb',
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontWeight: '700',
    fontSize: 13,
  },
  variant: {
    fontSize: 12,
    color: '#6b7280',
  },
  qty: {
    fontSize: 12,
    color: '#6b7280',
  },
  amounts: {
    alignItems: 'flex-end',
    gap: 2,
  },
  price: {
    fontWeight: '700',
    fontSize: 13,
  },
  lineTotal: {
    fontWeight: '700',
    fontSize: 12,
    color: '#111827',
  },
});
