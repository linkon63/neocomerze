import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ProductCard } from '@/types/home';

type Palette = { accent: string; border: string; card: string; muted: string };

type Props = {
  products: ProductCard[];
  palette: Palette;
  isDark: boolean;
  onAdd: (product: ProductCard) => void;
  onPressProduct: (id: number) => void;
};

export function LatestArrivals({ products, palette, isDark, onAdd, onPressProduct }: Props) {
  if (products.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Latest arrivals</ThemedText>
        <ThemedText style={[styles.hint, { color: palette.muted }]}>
          Fresh drops we think you’ll like.
        </ThemedText>
      </View>
      <View style={styles.stack}>
        {products.slice(0, 2).map((product) => (
          <Pressable
            key={product.id}
            style={[
              styles.card,
              { borderColor: palette.border, backgroundColor: palette.card },
            ]}
            onPress={() => onPressProduct(product.id)}>
            {product.image ? (
              <Image source={product.image} style={styles.image} contentFit="cover" />
            ) : (
              <View style={[styles.image, { backgroundColor: isDark ? '#15191f' : '#e4ddd1' }]} />
            )}
            <View style={styles.meta}>
              <ThemedText style={styles.title}>{product.name}</ThemedText>
              <ThemedText style={[styles.price, { color: palette.accent }]}>{product.price}</ThemedText>
              <ThemedText style={[styles.description, { color: palette.muted }]}>
                {product.description || 'Discover the latest from our collection.'}
              </ThemedText>
              <View style={styles.actions}>
                <Pressable
                  style={[styles.primary, { backgroundColor: palette.accent }]}
                  onPress={() => onAdd(product)}>
                  <ThemedText style={styles.primaryText}>Cart</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.ghost, { borderColor: palette.accent }]}
                  onPress={() => onPressProduct(product.id)}>
                  <ThemedText style={[styles.ghostText, { color: palette.accent }]}>Buy now</ThemedText>
                </Pressable>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  header: { gap: 4 },
  hint: { lineHeight: 20 },
  stack: { gap: 12 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  image: { width: '100%', height: 200 },
  meta: { padding: 14, gap: 8 },
  title: { fontWeight: '800', fontSize: 16 },
  price: { fontWeight: '700', fontSize: 14 },
  description: {
    fontSize: 12,
    lineHeight: 16,
    maxHeight: 16 * 3,
    overflow: 'hidden',
  },
  actions: { flexDirection: 'row', gap: 8, marginTop: 6 },
  primary: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { fontWeight: '700', fontSize: 13, color: '#ffffff' },
  ghost: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: { fontWeight: '700', fontSize: 13 },
});
