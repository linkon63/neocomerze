import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { endpoints } from '@/constants/api';

type ApiProduct = {
  id: number;
  name?: { en?: string };
  media?: { original_url?: string }[];
  tags?: { name?: string }[];
  variants?: { current_pricing?: { unit_price?: string } }[];
  category?: { id: number; name?: { en?: string } };
};

type ProductCard = {
  id: number;
  name: string;
  price: string;
  image?: string;
  badge?: string;
  categoryId?: number;
};

export default function CategoryProductsScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = useMemo(
    () => ({
      background: isDark ? '#0f1115' : '#f4f0e7',
      card: isDark ? '#1a1d24' : '#ffffff',
      muted: isDark ? '#7b828f' : '#7a6f5f',
      accent: isDark ? '#f47223' : '#f85606',
      border: isDark ? '#252832' : '#e8ded0',
    }),
    [isDark]
  );

  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: name || 'Category' });
  }, [navigation, name]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(endpoints.products);
        const json = await res.json();
        const mapped: ProductCard[] =
          (json?.data as ApiProduct[] | undefined)?.map((item) => {
            const firstVariant = item.variants?.[0];
            return {
              id: item.id,
              name: item.name?.en ?? 'Unnamed item',
              price: firstVariant?.current_pricing?.unit_price ?? 'BDT —',
              image: item.media?.[0]?.original_url,
              badge: item.tags?.[0]?.name,
              categoryId: item.category?.id,
            };
          }) ?? [];

        const catIdNum = Number(id);
        const filtered = mapped.filter((p) => p.categoryId === catIdNum);

        if (isMounted) {
          setProducts(filtered);
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
  }, [id]);

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
        {item.badge ? (
          <View style={[styles.badge, { backgroundColor: palette.accent }]}>
            <ThemedText style={styles.badgeText}>{item.badge}</ThemedText>
          </View>
        ) : null}
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
        ) : products.length === 0 ? (
          <View style={styles.loadingWrap}>
            <ThemedText style={{ color: palette.muted }}>No products in this category.</ThemedText>
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
    gap: 6,
  },
  name: {
    fontWeight: '700',
  },
  price: {
    fontWeight: '700',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 0,
  },
  badgeText: {
    fontWeight: '700',
    color: '#ffffff',
    fontSize: 12,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
