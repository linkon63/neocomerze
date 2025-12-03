import { Image } from 'expo-image';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { router } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCart } from '@/context/cart-context';

export default function CartScreen() {
  const { items, remove, clear } = useCart();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const accent = isDark ? '#f47223' : '#f85606';

  const parsePrice = (price: string) => {
    const numeric = parseFloat(price.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const total = items.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);

  const renderItem = ({ item }: any) => (
    <View style={[styles.card, { borderColor: isDark ? '#252832' : '#e8ded0' }]}>
      {item.image ? (
        <Image source={item.image} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.image, { backgroundColor: isDark ? '#15191f' : '#e4ddd1' }]} />
      )}
      <View style={styles.meta}>
        <ThemedText style={styles.name}>{item.name}</ThemedText>
        <ThemedText style={[styles.price, { color: accent }]}>{item.price}</ThemedText>
        {item.variantLabel ? (
          <ThemedText style={[styles.variant, { color: isDark ? '#7b828f' : '#7a6f5f' }]}>
            {item.variantLabel}
          </ThemedText>
        ) : null}
        <ThemedText style={styles.qty}>Qty: {item.quantity}</ThemedText>
        <View style={styles.cardActions}>
          <Pressable
            style={[styles.deleteButton, { borderColor: accent }]}
            onPress={() => remove(item.id, item.variantId)}>
            <ThemedText style={[styles.deleteText, { color: accent }]}>Delete</ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.screen}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText style={[styles.emptyText, { color: isDark ? '#7b828f' : '#7a6f5f' }]}>
              Your cart is empty.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => `${item.id}-${item.variantId ?? 'base'}`}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        )}
        {items.length > 0 ? (
          <>
            <View style={[styles.totalCard, { borderColor: isDark ? '#252832' : '#e8ded0' }]}>
              <ThemedText style={styles.totalLabel}>Total</ThemedText>
              <ThemedText style={[styles.totalValue, { color: accent }]}>
                BDT {total.toFixed(2)}
              </ThemedText>
            </View>
            <Pressable
              style={[styles.checkoutButton, { backgroundColor: accent }]}
              onPress={() => router.push('/checkout')}>
              <ThemedText style={styles.checkoutText}>Checkout</ThemedText>
            </Pressable>
            <Pressable style={[styles.clearButton, { borderColor: isDark ? '#252832' : '#e8ded0' }]} onPress={clear}>
              <ThemedText style={[styles.clearText, { color: textColor }]}>Clear cart</ThemedText>
            </Pressable>
          </>
        ) : null}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1, padding: 16, gap: 12 },
  list: { gap: 12, paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderRadius: 0,
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 100,
  },
  meta: {
    flex: 1,
    gap: 4,
    paddingVertical: 8,
    paddingRight: 8,
  },
  name: {
    fontWeight: '700',
  },
  price: {
    fontWeight: '700',
  },
  variant: {
    fontSize: 14,
  },
  qty: {
    fontSize: 14,
  },
  cardActions: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  deleteText: {
    fontWeight: '700',
    fontSize: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  clearButton: {
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 0,
    alignItems: 'center',
  },
  clearText: {
    fontWeight: '700',
  },
  totalCard: {
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontWeight: '700',
    fontSize: 14,
  },
  totalValue: {
    fontWeight: '800',
    fontSize: 16,
  },
  checkoutButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
});
