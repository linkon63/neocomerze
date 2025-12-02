import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ProductCard } from '@/types/home';

type Palette = { accent: string; border: string; card: string; muted: string };

type Props = {
  products: ProductCard[];
  loading: boolean;
  error: string | null;
  palette: Palette;
  isDark: boolean;
  onAdd: (product: ProductCard) => void;
  onPressProduct: (id: number) => void;
  onViewAll: () => void;
};

export function FeaturedProductsSection({
  products,
  loading,
  error,
  palette,
  isDark,
  onAdd,
  onPressProduct,
  onViewAll,
}: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Featured products</ThemedText>
        <ThemedText style={[styles.hint, { color: palette.muted }]}>
          Limited runs updated weekly.
        </ThemedText>
        <Pressable onPress={onViewAll}>
          <ThemedText style={[styles.viewAll, { color: palette.accent }]}>View all</ThemedText>
        </Pressable>
      </View>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={palette.accent} />
          <ThemedText style={{ color: palette.muted }}>Loading products…</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.loadingWrap}>
          <ThemedText style={{ color: palette.muted }}>{error}</ThemedText>
        </View>
      ) : (
        <View style={styles.grid}>
          {products.map((product) => (
            <Pressable
              key={product.id}
              style={[
                styles.card,
                { backgroundColor: palette.card, borderColor: palette.border },
              ]}
              onPress={() => onPressProduct(product.id)}>
              {product.image ? (
                <Image source={product.image} style={styles.image} contentFit="cover" />
              ) : (
                <View
                  style={[
                    styles.image,
                    { backgroundColor: isDark ? '#15191f' : '#e4ddd1' },
                  ]}
                />
              )}
              <View style={styles.meta}>
                <ThemedText style={styles.name}>{product.name}</ThemedText>
                <ThemedText style={[styles.price, { color: palette.accent }]}>
                  {product.price}
                </ThemedText>
                <View style={styles.buttonRow}>
                  <Pressable
                    style={[styles.iconButton, { borderColor: palette.accent }]}
                    onPress={() => onAdd(product)}>
                    <ThemedText style={styles.iconButtonText}>＋</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.buyButton, { backgroundColor: palette.accent }]}
                    onPress={() => onPressProduct(product.id)}>
                    <ThemedText style={[styles.buyText, { color: '#ffffff' }]}>Buy</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.iconButton, { borderColor: palette.accent }]}
                    onPress={() => console.log('wishlist')}>
                    <ThemedText style={[styles.iconButtonText, { color: palette.accent }]}>
                      ♡
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  header: { gap: 4 },
  hint: { lineHeight: 20 },
  viewAll: { fontWeight: '700', marginTop: 4 },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  card: {
    width: '47.5%',
    borderRadius: 0,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
  },
  meta: {
    padding: 12,
    gap: 4,
  },
  name: {
    fontWeight: '700',
    lineHeight: 17,
    fontSize: 13,
  },
  price: {
    fontWeight: '700',
    fontSize: 12,
  },
  buttonRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: { fontWeight: '700', fontSize: 16 },
  buyButton: {
    paddingHorizontal: 14,
    height: 36,
    borderWidth: 0,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyText: { fontWeight: '700', fontSize: 13 },
});
