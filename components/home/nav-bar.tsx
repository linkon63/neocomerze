import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View, TextInput } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';

type Props = {
  accent: string;
  onProfilePress: () => void;
  onSearch?: (value: string) => void;
  logoUrl?: string;
  shopName?: string;
};

export function NavBar({ accent, onProfilePress, onSearch, logoUrl, shopName }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const handleSearch = (value: string) => {
    if (onSearch) onSearch(value);
  };

  return (
    <View style={styles.navBar}>
      <View style={styles.logoRow}>
        <Image
          source={logoUrl ? { uri: logoUrl } : require('../../public/jannat.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Looking for?"
          placeholderTextColor="#4b5563"
          onChangeText={handleSearch}
          underlineColorAndroid="transparent"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
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
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
    borderRadius: 999,
    paddingLeft: 14,
    paddingVertical: 8,
    marginHorizontal: 12,
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
});
