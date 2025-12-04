import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  TextInput,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { endpoints } from '@/constants/api';
import { fetchJson } from '@/utils/api-client';

type ApiProduct = {
  id: number;
  name?: { en?: string };
  media?: { original_url?: string }[];
  variants?: { id: number; current_pricing?: { unit_price?: string } }[];
};

type SearchResult = {
  id: number;
  name: string;
  price?: string;
  image?: string;
};

type Props = {
  accent: string;
  onProfilePress: () => void;
  onSearch?: (value: string) => void;
  logoUrl?: string;
  shopName?: string;
};

export function NavBar({ accent, onProfilePress, onSearch, logoUrl, shopName }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestQueryRef = useRef('');
  const inputRef = useRef<TextInput>(null);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (onSearch) onSearch(value);
  };

  const mapProductToResult = (item: ApiProduct): SearchResult => ({
    id: item.id,
    name: item.name?.en ?? 'Product',
    price: item.variants?.[0]?.current_pricing?.unit_price,
    image: item.media?.[0]?.original_url,
  });

  const fetchSuggestions = async (term: string) => {
    setLoadingResults(true);
    setSearchError(null);
    try {
      const url = `${endpoints.products}?per_page=50&search=${encodeURIComponent(term)}`;
      const json = await fetchJson<{ data?: ApiProduct[] }>(url);
      const normalizedTerm = term.toLowerCase();
      const filtered =
        json?.data
          ?.map(mapProductToResult)
          .filter((item) => item.name.toLowerCase().includes(normalizedTerm)) ?? [];

      if (latestQueryRef.current === term) {
        setResults(filtered.slice(0, 6));
      }
    } catch (err) {
      if (latestQueryRef.current === term) {
        setResults([]);
        setSearchError('Could not load products.');
      }
    } finally {
      if (latestQueryRef.current === term) {
        setLoadingResults(false);
      }
    }
  };

  useEffect(() => {
    const trimmed = query.trim();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (trimmed.length < 2) {
      latestQueryRef.current = trimmed;
      setResults([]);
      setSearchError(null);
      setLoadingResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      latestQueryRef.current = trimmed;
      fetchSuggestions(trimmed);
    }, 250);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleSelectProduct = (product: SearchResult) => {
    setQuery(product.name);
    setResults([]);
    setIsFocused(false);
    inputRef.current?.blur();
    router.push(`/product/${product.id}`);
  };

  const shouldShowDropdown =
    query.trim().length >= 2 && (isFocused || results.length > 0 || loadingResults || searchError);

  return (
    <View style={styles.navBar}>
      <View style={styles.logoRow}>
        <Image
          source={logoUrl ? { uri: logoUrl } : require('../../public/jannat.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
      <View style={styles.searchWrap}>
        <View style={styles.searchContainer}>
          <TextInput
            ref={inputRef}
            value={query}
            placeholder="Looking for?"
            placeholderTextColor="#4b5563"
            onChangeText={handleSearch}
            underlineColorAndroid="transparent"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoCorrect={false}
            style={[
              styles.searchInput,
              isFocused ? styles.searchInputFocused : styles.searchInputBlurred,
            ]}
          />
          <View style={styles.searchOverlay}>
            <Pressable style={[styles.searchIcon, { backgroundColor: accent }]}>
              <ThemedText style={styles.searchIconText}>🔍</ThemedText>
            </Pressable>
          </View>
        </View>

        {shouldShowDropdown ? (
          <View style={styles.searchDropdown}>
            {loadingResults ? (
              <View style={styles.searchStatusRow}>
                <ActivityIndicator color={accent} size="small" />
                <ThemedText style={styles.statusText}>Searching…</ThemedText>
              </View>
            ) : searchError ? (
              <View style={styles.searchStatusRow}>
                <ThemedText style={styles.statusText}>{searchError}</ThemedText>
              </View>
            ) : results.length ? (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                style={styles.searchScroll}
                contentContainerStyle={styles.searchList}>
                {results.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.searchResult}
                    onPress={() => handleSelectProduct(item)}>
                    {item.image ? (
                      <Image source={item.image} style={styles.searchThumb} contentFit="cover" />
                    ) : (
                      <View style={styles.searchThumb} />
                    )}
                    <View style={styles.searchMeta}>
                      <ThemedText style={styles.searchResultName} numberOfLines={1}>
                        {item.name}
                      </ThemedText>
                      {item.price ? (
                        <ThemedText style={[styles.searchResultPrice, { color: accent }]}>
                          {item.price}
                        </ThemedText>
                      ) : null}
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.searchStatusRow}>
                <ThemedText style={styles.statusText}>No products found.</ThemedText>
              </View>
            )}
          </View>
        ) : null}
      </View>
      <Pressable style={styles.profileButton} onPress={onProfilePress}>
        <IconSymbol name="person.crop.circle" color={accent} size={26} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 50,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 72,
    height: 72,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
    position: 'relative',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
    borderRadius: 999,
    paddingLeft: 14,
    paddingVertical: 8,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingRight: 70,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  searchInputBlurred: {
    backgroundColor: 'transparent',
  },
  searchInputFocused: {
    backgroundColor: 'transparent',
  },
  searchIcon: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconText: {
    color: '#ffffff',
    fontWeight: '700',

  },

  searchOverlay: {
    position: 'absolute',
    right: 5,
  },
  navTitle: {
    fontSize: 22,
    letterSpacing: 0.5,
  },
  profileButton: {
    padding: 6,
  },
  searchDropdown: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 6,
    zIndex: 60,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  searchScroll: {
    maxHeight: 260,
  },
  searchList: {
    paddingVertical: 2,
  },
  searchResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchThumb: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  searchMeta: {
    flex: 1,
    gap: 2,
  },
  searchResultName: {
    fontWeight: '700',
    fontSize: 13,
    color: '#111827',
  },
  searchResultPrice: {
    fontWeight: '700',
    fontSize: 12,
  },
  searchStatusRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
