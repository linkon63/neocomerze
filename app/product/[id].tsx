import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '@/context/cart-context';
import { endpoints } from '@/constants/api';

type ApiProductDetail = {
  id: number;
  name?: { en?: string };
  description?: { en?: string };
  media?: { original_url?: string }[];
  variants?: {
    id: number;
    sku?: string;
    current_pricing?: { unit_price?: string };
    option_values?: { id: number; name?: { en?: string }; option_name?: { en?: string } }[];
  }[];
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
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

  const [product, setProduct] = useState<ApiProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: 'Product detail' });
  }, [navigation]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(endpoints.productDetail(id));
        const json = await res.json();
        if (isMounted) {
          setProduct(json?.data as ApiProductDetail);
          const firstVariant = json?.data?.variants?.[0];
          if (firstVariant?.id) {
            setSelectedVariantId(firstVariant.id);
          }
        }
      } catch (err) {
        if (isMounted) setError('Could not load product.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const selectedVariant = product?.variants?.find((v) => v.id === selectedVariantId);
  const price = selectedVariant?.current_pricing?.unit_price;
  const images = product?.media ?? [];

  const handleAddToCart = () => {
    if (!product) return;
    const variantLabel =
      selectedVariant?.option_values
        ?.map((o) => o.name?.en)
        .filter(Boolean)
        .join(' / ') || selectedVariant?.sku;

    addItem({
      id: product.id,
      name: product.name?.en ?? 'Product',
      price: price ?? 'BDT —',
      image: product.media?.[0]?.original_url,
      variantId: selectedVariantId,
      variantLabel,
    });
  };

  const handleBuyNow = () => {
    console.log('buyNow');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <ThemedView style={[styles.screen, { backgroundColor: palette.background }]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={palette.accent} />
              <ThemedText style={{ color: palette.muted }}>Loading product…</ThemedText>
            </View>
          ) : error ? (
            <View style={styles.loadingWrap}>
              <ThemedText style={{ color: palette.muted }}>{error}</ThemedText>
            </View>
          ) : !product ? (
            <View style={styles.loadingWrap}>
              <ThemedText style={{ color: palette.muted }}>Product not found.</ThemedText>
            </View>
          ) : (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.imageRail}>
                {images.length ? (
                  images.map((img, idx) => (
                    <Image
                      key={img.original_url ?? idx}
                      source={img.original_url}
                      style={styles.heroImage}
                      contentFit="cover"
                    />
                  ))
                ) : (
                  <View
                    style={[
                      styles.heroImage,
                      { backgroundColor: isDark ? '#15191f' : '#e4ddd1' },
                    ]}
                  />
                )}
              </ScrollView>

              <View style={styles.metaCard}>
                <ThemedText type="title">{product.name?.en ?? 'Product'}</ThemedText>
                {price ? (
                  <ThemedText style={[styles.price, { color: palette.accent }]}>{price}</ThemedText>
                ) : null}
                <ThemedText style={[styles.description, { color: palette.muted }]}>
                  {product.description?.en || 'No description available.'}
                </ThemedText>
              </View>

              {product.variants?.length ? (
                <View style={styles.metaCard}>
                  <ThemedText type="subtitle">Variants</ThemedText>
                  <View style={styles.variantList}>
                    {product.variants.map((variant) => (
                      <Pressable
                        key={variant.id}
                        style={[
                          styles.variantPill,
                          {
                            borderColor:
                              selectedVariantId === variant.id ? palette.accent : palette.border,
                            backgroundColor:
                              selectedVariantId === variant.id ? '#e9f3ef' : palette.card,
                          },
                        ]}
                        onPress={() => setSelectedVariantId(variant.id)}>
                        <ThemedText style={styles.variantText}>
                          {variant.option_values?.map((o) => o.name?.en).filter(Boolean).join(' / ') ||
                            variant.sku ||
                            `Variant ${variant.id}`}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <View style={styles.actions}>
                <Pressable
                  style={[styles.primaryButton, { backgroundColor: palette.accent }]}
                  onPress={handleAddToCart}>
                  <ThemedText style={[styles.primaryText, { color: '#ffffff' }]}>Add to cart</ThemedText>
                </Pressable>
                <Pressable style={[styles.ghostButton, { borderColor: palette.accent }]} onPress={handleBuyNow}>
                  <ThemedText style={[styles.ghostText, { color: palette.accent }]}>Buy now</ThemedText>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const heroWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  content: { padding: 20, gap: 20, paddingBottom: 32 },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  imageRail: {
    gap: 12,
  },
  heroImage: {
    width: heroWidth - 40,
    height: 280,
    borderRadius: 0,
    overflow: 'hidden',
  },
  metaCard: {
    gap: 8,
  },
  price: {
    fontWeight: '700',
    fontSize: 15,
  },
  description: {
    lineHeight: 17,
    fontSize: 13,
  },
  variantList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  variantPill: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 0,
    borderWidth: 1,
  },
  variantText: {
    fontWeight: '600',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#0f1115',
  },
  ghostButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  ghostText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
