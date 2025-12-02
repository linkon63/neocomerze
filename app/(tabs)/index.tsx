import { Image } from 'expo-image';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { useCart } from '@/context/cart-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { endpoints } from '@/constants/api';

type HeroSlide = {
  id: string | number;
  title: string;
  copy: string;
  cta: string;
  image?: string;
  tone: string;
};

const fallbackHeroSlides: HeroSlide[] = [
  {
    id: 'fallback-1',
    title: 'Tailored looks',
    copy: 'Layered textures, clean silhouettes, and color that feels curated.',
    cta: 'Shop new arrivals',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
    tone: '#0b3b3c',
  },
  {
    id: 'fallback-2',
    title: 'Everyday carry',
    copy: 'Utility-forward bags and tools built to move with you.',
    cta: 'See travel edit',
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
    tone: '#523423',
  },
  {
    id: 'fallback-3',
    title: 'Home rituals',
    copy: 'Warm light, sculpted ceramics, and small luxuries for slow nights in.',
    cta: 'Refresh your space',
    image:
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80',
    tone: '#2f2b33',
  },
];

type ApiCategory = {
  id: number;
  name?: { en?: string };
};

type CategoryItem = {
  id: number;
  name: string;
};

type ApiCampaignItem = {
  id: number;
  media?: { original_url?: string }[];
};

type ApiCampaign = {
  id: number;
  name?: string;
  items?: ApiCampaignItem[];
};

type ApiProduct = {
  id: number;
  name?: { en?: string };
  media?: { original_url?: string }[];
  tags?: { name?: string }[];
  variants?: { current_pricing?: { unit_price?: string } }[];
};

type ProductCard = {
  id: number;
  name: string;
  price: string;
  image?: string;
  badge?: string;
  description?: string;
};

const testimonials = [
  {
    quote: '“Fast delivery and the quality exceeded expectations.”',
    name: 'Farhana, Dhaka',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
  {
    quote: '“Minimal designs, premium feel—love the curation.”',
    name: 'Arman, Chattogram',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80',
    rating: 4.5,
  },
  {
    quote: '“Customer support was smooth and the fit guide helped a lot.”',
    name: 'Nadia, Sylhet',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
  {
    quote: '“The packaging was premium and items matched the photos perfectly.”',
    name: 'Rafi, Rajshahi',
    image:
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80',
    rating: 4.8,
  },
  {
    quote: '“Flash deals are unbeatable—keeps me coming back every week.”',
    name: 'Tania, Khulna',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    rating: 4.7,
  },
];

export default function HomeScreen() {
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

  const screenWidth = Dimensions.get('window').width;
  const horizontalGutter = 24;
  const heroWidth = screenWidth - horizontalGutter * 2;
  const heroHeight = Math.max(180, Math.min(heroWidth * 0.52, 320));

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(fallbackHeroSlides);
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const badgeTextColor = isDark ? '#061c17' : '#0f403a';

  const renderBadge = (label: string, style?: StyleProp<ViewStyle>) => (
    <View style={[styles.badge, { backgroundColor: palette.accent }, style]}>
      <ThemedText style={[styles.badgeText, { color: badgeTextColor }]}>{label}</ThemedText>
    </View>
  );

  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const testimonialRef = useRef<ScrollView | null>(null);
  const testimonialWidth = screenWidth - 48;

  useEffect(() => {
    let isMounted = true;

    const loadCampaigns = async () => {
      try {
        const response = await fetch(endpoints.campaigns);
        const json = await response.json();
        const tones = ['#0b3b3c', '#523423', '#2f2b33', '#1d2b3a', '#153336'];

        const mapped: HeroSlide[] =
          (json?.data as ApiCampaign[] | undefined)?.flatMap((campaign, campaignIndex) =>
            (campaign.items ?? []).map((item, itemIndex) => {
              const toneIndex = (campaignIndex + itemIndex) % tones.length;
              return {
                id: item.id,
                title: campaign.name ?? 'Campaign',
                copy: 'Seasonal campaigns, curated for you.',
                cta: 'Shop now',
                image: item.media?.[0]?.original_url,
                tone: tones[toneIndex],
              };
            })
          ) ?? [];

        if (isMounted && mapped.length) {
          setHeroSlides(mapped);
        }
      } catch (err) {
        // Swallow errors and keep fallbacks
      }
    };

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(endpoints.products);
        const json = await response.json();
        const mapped: ProductCard[] = (json?.data as ApiProduct[] | undefined)?.map((item) => {
          const firstVariant = item.variants?.[0];
          return {
            id: item.id,
            name: item.name?.en ?? 'Unnamed item',
            price: firstVariant?.current_pricing?.unit_price ?? 'BDT —',
            image: item.media?.[0]?.original_url,
            badge: item.tags?.[0]?.name,
            description: item.description?.en,
          };
        }) ?? [];

        if (isMounted) {
          setProducts(mapped.slice(0, 8));
        }
      } catch (err) {
        if (isMounted) {
          setError('Could not load products right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        const response = await fetch(endpoints.categories);
        const json = await response.json();
        const mapped =
          (json?.data as ApiCategory[] | undefined)?.map((item) => ({
            id: item.id,
            name: item.name?.en ?? 'Untitled category',
          })) ?? [];

        if (isMounted) {
          setCategories(mapped.slice(0, 12));
        }
      } catch (err) {
        if (isMounted) {
          setCategoriesError('Could not load categories right now.');
        }
      } finally {
        if (isMounted) {
          setCategoriesLoading(false);
        }
      }
    };

    loadCampaigns();
    loadProducts();
    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (testimonialIndex + 1) % testimonials.length;
      setTestimonialIndex(nextIndex);
      testimonialRef.current?.scrollTo({ x: nextIndex * testimonialWidth, animated: true });
    }, 3200);
    return () => clearInterval(interval);
  }, [testimonialIndex, testimonialWidth]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.background }]}
      edges={['top', 'left', 'right']}>
      <ThemedView style={[styles.screen, { backgroundColor: palette.background }]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.navBar}>
            <View style={styles.logoRow}>
              <Image source={require('../../public/jannat.png')} style={styles.logo} contentFit="contain" />
              {/* <ThemedText type="title" style={styles.navTitle}>
                Shopping করুন আমাদের সাথে
              </ThemedText> */}
            </View>
            <Pressable style={styles.profileButton} onPress={() => router.push('/profile')}>
              <IconSymbol name="person.crop.circle" color={palette.accent} size={26} />
            </Pressable>
          </View>

          <View style={styles.heroWrapper}>
            <ScrollView
              horizontal
              pagingEnabled
              snapToInterval={heroWidth + 12}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.heroRail, { paddingHorizontal: horizontalGutter }]}>
              {heroSlides.map((slide) => (
                <View
                  key={slide.id}
                  style={[
                    styles.heroCard,
                    {
                      width: heroWidth,
                      height: heroHeight,
                      backgroundColor: slide.tone,
                      borderColor: palette.border,
                    },
                  ]}>
                  <Image source={slide.image} style={styles.heroImage} contentFit="cover" />
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Category</ThemedText>
            </View>
            {categoriesLoading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={palette.accent} />
                <ThemedText style={{ color: palette.muted }}>Loading categories…</ThemedText>
              </View>
            ) : categoriesError ? (
              <View style={styles.loadingWrap}>
                <ThemedText style={{ color: palette.muted }}>{categoriesError}</ThemedText>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRail}>
                {categories.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() =>
                      router.push(
                        `/category/${category.id}?name=${encodeURIComponent(category.name)}`
                      )
                    }>
                    <View
                      style={[
                        styles.categoryPill,
                        { borderColor: palette.border, backgroundColor: palette.card },
                      ]}>
                      <ThemedText style={styles.categoryText}>{category.name}</ThemedText>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Featured products</ThemedText>
              <ThemedText style={[styles.sectionHint, { color: palette.muted }]}>
                Limited runs updated weekly.
              </ThemedText>
              <Pressable onPress={() => router.push('/products')}>
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
              <View style={styles.productGrid}>
                {products.map((product) => (
                  <Pressable
                    key={product.id}
                    style={[
                      styles.productCard,
                      { backgroundColor: palette.card, borderColor: palette.border },
                    ]}
                    onPress={() => router.push(`/product/${product.id}`)}>
                    {product.image ? (
                      <Image source={product.image} style={styles.productImage} contentFit="cover" />
                    ) : (
                      <View
                        style={[
                          styles.productImage,
                          { backgroundColor: isDark ? '#15191f' : '#e4ddd1' },
                        ]}
                      />
                    )}
                    <View style={styles.productMeta}>
                      <ThemedText style={styles.productName}>{product.name}</ThemedText>
                      <ThemedText style={[styles.price, { color: palette.accent }]}>
                        {product.price}
                      </ThemedText>
                  <View style={styles.buttonRow}>
                    <Pressable
                      style={[styles.iconButton, { borderColor: palette.accent }]}
                      onPress={() =>
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                          variantId: null,
                          variantLabel: undefined,
                        })
                      }>
                      <ThemedText style={styles.iconButtonText}>＋</ThemedText>
                    </Pressable>
                    <Pressable
                      style={[styles.buyButton, { backgroundColor: palette.accent }]}
                      onPress={() => router.push(`/product/${product.id}`)}>
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
            ))}
              </View>
            )}
          </View>

          <Pressable style={[styles.seeMoreButton, { borderColor: palette.border }]} onPress={() => router.push('/products')}>
            <ThemedText style={styles.seeMoreText}>See more products</ThemedText>
          </Pressable>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Testimonials</ThemedText>
              <ThemedText style={[styles.sectionHint, { color: palette.muted }]}>
                What our customers are saying.
              </ThemedText>
            </View>
            <ScrollView
              horizontal
              pagingEnabled
              ref={testimonialRef}
              showsHorizontalScrollIndicator={false}
              snapToInterval={testimonialWidth + 12}
              decelerationRate="fast"
              contentContainerStyle={[styles.heroRail, { paddingHorizontal: 0 }]}>
              {testimonials.map((item, idx) => (
                <View
                  key={item.name}
                  style={[
                    styles.testimonialCard,
                    {
                      width: testimonialWidth,
                      borderColor: palette.accent,
                      backgroundColor: isDark ? '#1f1b17' : '#fff6ef',
                    },
                  ]}>
                  <View style={styles.testimonialBadge}>
                    <ThemedText style={styles.testimonialBadgeText}>Trusted buyers</ThemedText>
                  </View>
                  <ThemedText style={styles.testimonialQuote}>{item.quote}</ThemedText>
                  <View style={styles.testimonialFooter}>
                    {item.image ? (
                      <Image source={item.image} style={styles.testimonialAvatar} contentFit="cover" />
                    ) : null}
                    <ThemedText style={[styles.testimonialName, { color: palette.muted }]}>
                      {item.name}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.ratingRow}>
                    {'★'.repeat(Math.floor(item.rating)) + (item.rating % 1 ? '½' : '')}
                  </ThemedText>
                </View>
              ))}
            </ScrollView>
          </View>

          {products.length >= 1 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText type="subtitle">Latest arrivals</ThemedText>
                <ThemedText style={[styles.sectionHint, { color: palette.muted }]}>
                  Fresh drops we think you’ll like.
                </ThemedText>
              </View>
              <View style={styles.latestStack}>
                {products.slice(0, 2).map((product) => (
                  <Pressable
                    key={product.id}
                    style={[styles.latestCard, { borderColor: palette.border, backgroundColor: palette.card }]}
                    onPress={() => router.push(`/product/${product.id}`)}>
                    {product.image ? (
                      <Image source={product.image} style={styles.latestImage} contentFit="cover" />
                    ) : (
                      <View
                        style={[
                          styles.latestImage,
                          { backgroundColor: isDark ? '#15191f' : '#e4ddd1' },
                        ]}
                      />
                    )}
                    <View style={styles.latestMeta}>
                      <ThemedText style={styles.latestTitle}>{product.name}</ThemedText>
                      <ThemedText style={[styles.latestPrice, { color: palette.accent }]}>
                        {product.price}
                      </ThemedText>
                      <ThemedText style={[styles.latestDescription, { color: palette.muted }]}>
                        {product.description || 'Discover the latest from our collection.'}
                      </ThemedText>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <View
            style={[
              styles.footer,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}>
            <View>
              <ThemedText type="subtitle">Stay in the loop</ThemedText>
              <ThemedText style={[styles.sectionHint, { color: palette.muted }]}>
                Drops, restocks, and styling notes every other week.
              </ThemedText>
            </View>
            <View style={styles.footerActions}>
              <Pressable style={[styles.ctaGhost, { borderColor: palette.border }]}>
                <ThemedText style={[styles.ctaText, { color: textColor }]}>Sign up</ThemedText>
              </Pressable>
              <Pressable style={[styles.ctaGhost, { borderColor: palette.border }]}>
                <ThemedText style={[styles.ctaText, { color: textColor }]}>Contact</ThemedText>
              </Pressable>
            </View>
            <View style={styles.footerMeta}>
              <ThemedText style={[styles.footerText, { color: palette.muted }]}>
                Free returns within 30 days
              </ThemedText>
              <ThemedText style={[styles.footerText, { color: palette.muted }]}>
                Carbon-neutral delivery
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 24,
    paddingBottom: 48,
  },
  navBar: {
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navTitle: {
    fontSize: 22,
    letterSpacing: 0.5,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 76,
    height: 76,
  },
  profileButton: {
    padding: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  kicker: {
    letterSpacing: 2,
    fontSize: 14,
    marginBottom: 4,
  },
  subline: {
    marginTop: 8,
    lineHeight: 22,
  },
  heroRail: {
    gap: 12,
  },
  heroWrapper: {
    marginHorizontal: -24,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 0,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  testimonialCard: {
    borderWidth: 1,
    borderRadius: 0,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  testimonialQuote: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  testimonialName: {
    fontSize: 12,
    fontWeight: '600',
  },
  testimonialFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testimonialAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d9d9d9',
  },
  testimonialBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff22',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  testimonialBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f85606',
  },
  ratingRow: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f59e0b',
  },
  latestStack: {
    gap: 12,
  },
  latestCard: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  latestImage: {
    width: '100%',
    height: 180,
  },
  latestMeta: {
    padding: 12,
    gap: 6,
  },
  latestTitle: {
    fontWeight: '700',
    fontSize: 15,
  },
  latestPrice: {
    fontWeight: '700',
    fontSize: 14,
  },
  latestDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    gap: 4,
  },
  viewAll: {
    fontWeight: '700',
    marginTop: 4,
  },
  sectionHint: {
    lineHeight: 20,
  },
  categoryRail: {
    gap: 10,
    paddingVertical: 6,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  categoryText: {
    fontWeight: '600',
    fontSize: 13,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  productCard: {
    width: '47.5%',
    borderRadius: 0,
    borderWidth: 1,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  productMeta: {
    padding: 12,
    gap: 4,
  },
  productName: {
    fontWeight: '700',
    lineHeight: 17,
    fontSize: 13,
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
  productBadge: {
    marginTop: 6,
    backgroundColor: '#eef8f3',
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
  iconButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  buyButton: {
    paddingHorizontal: 14,
    height: 36,
    borderWidth: 0,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyText: {
    fontWeight: '700',
    fontSize: 13,
  },
  seeMoreButton: {
    marginTop: 4,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 0,
    alignItems: 'center',
  },
  seeMoreText: {
    fontWeight: '700',
    fontSize: 13,
  },
  footer: {
    padding: 18,
    borderRadius: 0,
    borderWidth: 1,
    gap: 12,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  ctaGhost: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
  },
  footerMeta: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 12,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
});
