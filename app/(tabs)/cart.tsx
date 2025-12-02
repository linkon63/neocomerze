import { Image } from 'expo-image';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  const renderItem = ({ item }: any) => (
    <View style={[styles.card, { borderColor: isDark ? '#252832' : '#e8ded0' }]}>
      {item.image ? (
        <Image source={item.image} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.image, { backgroundColor: isDark ? '#15191f' : '#e4ddd1' }]} />
      )}
      <View style={styles.meta}>
        <ThemedText style={styles.name}>{item.name}</ThemedText>
        <ThemedText style={[styles.price, { color: isDark ? '#81c8be' : '#0f766e' }]}>
          {item.price}
        </ThemedText>
        {item.variantLabel ? (
          <ThemedText style={[styles.variant, { color: isDark ? '#7b828f' : '#7a6f5f' }]}>
            {item.variantLabel}
          </ThemedText>
        ) : null}
        <ThemedText style={styles.qty}>Qty: {item.quantity}</ThemedText>
        <Pressable onPress={() => remove(item.id, item.variantId)}>
          <ThemedText style={[styles.remove, { color: '#c0362c' }]}>Remove</ThemedText>
        </Pressable>
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
          <Pressable style={[styles.clearButton, { borderColor: isDark ? '#252832' : '#e8ded0' }]} onPress={clear}>
            <ThemedText style={[styles.clearText, { color: textColor }]}>Clear cart</ThemedText>
          </Pressable>
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
  remove: {
    fontWeight: '700',
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
});
