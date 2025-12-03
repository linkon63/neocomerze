import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { useCart } from '@/context/cart-context';
import { endpoints } from '@/constants/api';

type ApiProduct = {
  id: number;
  name?: { en?: string };
  media?: { original_url?: string }[];
  tags?: { name?: string }[];
  variants?: {
    id: number;
    sku?: string;
    option_values?: { name?: { en?: string } }[];
    current_pricing?: { unit_price?: string };
  }[];
};

type ProductCard = {
  id: number;
  name: string;
  price: string;
  image?: string;
  badge?: string;
  variantId?: number | null;
  variantLabel?: string;
};

export default function ProductsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { addItem } = useCart();
  const palette = useMemo(
    () => ({
      background: isDark ? '#0f1115' : '#ffffff',
      card: isDark ? '#1a1d24' : '#ffffff',
      muted: isDark ? '#7b828f' : '#6b7280',
      accent: isDark ? '#f47223' : '#f85606',
      border: isDark ? '#252832' : '#e5e7eb',
    }),
    [isDark]
  );

  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(endpoints.products);
        const json = await res.json();
        const mapped: ProductCard[] = (json?.data as ApiProduct[] | undefined)?.map((item) => {
          const firstVariant = item.variants?.[0];
          const variantLabel =
            firstVariant?.option_values
              ?.map((o) => o.name?.en)
              .filter(Boolean)
              .join(' / ') || firstVariant?.sku;
          return {
            id: item.id,
            name: item.name?.en ?? 'Unnamed item',
            price: firstVariant?.current_pricing?.unit_price ?? 'BDT —',
            image: item.media?.[0]?.original_url,
            badge: item.tags?.[0]?.name,
            variantId: firstVariant?.id ?? null,
            variantLabel: variantLabel || undefined,
          };
        }) ?? [];
        if (isMounted) {
          setProducts(mapped);
        }
      } catch (err) {
        if (isMounted) setError('Could not load products.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const renderItem = ({ item }: { item: ProductCard }) => (
    <Pressable
      style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
      onPress={() => router.push(`/product/${item.id}`)}>
      {item.image ? (
        <Image source={item.image} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.image, { backgroundColor: isDark ? '#15191f' : '#e4ddd1' }]} />
      )}
      <View style={styles.meta}>
        <ThemedText style={styles.name}>{item.name}</ThemedText>
        <ThemedText style={[styles.price, { color: palette.accent }]}>{item.price}</ThemedText>
        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.iconButton, { borderColor: palette.accent }]}
            onPress={() =>
              addItem({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                variantId: item.variantId ?? null,
                variantLabel: item.variantLabel,
              })
            }>
            <ThemedText style={[styles.iconButtonText, { color: palette.accent }]}>＋</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.buyButton, { backgroundColor: palette.accent }]}
            onPress={() => router.push(`/product/${item.id}`)}>
            <ThemedText style={[styles.buyText, { color: '#ffffff' }]}>Buy</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.iconButton, { borderColor: palette.accent }]}
            onPress={() => console.log('wishlist')}>
            <ThemedText style={[styles.iconButtonText, { color: palette.accent }]}>♡</ThemedText>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <ThemedView style={[styles.screen, { backgroundColor: palette.background }]}>
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
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  listContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 32,
  },
  row: {
    gap: 14,
  },
  card: {
    flex: 1,
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
    fontSize: 13,
    lineHeight: 17,
  },
  price: {
    fontWeight: '700',
    fontSize: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontWeight: '700',
    color: '#0f403a',
    fontSize: 10,
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
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
