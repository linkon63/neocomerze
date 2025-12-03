import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, doc, getDoc } from 'firebase/firestore';

import { AddressCard } from '@/components/profile/address-card';
import { LogoutCard } from '@/components/profile/logout-card';
import { OrdersCard } from '@/components/profile/orders-card';
import { ProfileInfoCard } from '@/components/profile/profile-info-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth-context';
import { db } from '@/utils/firebase';

type ProfileTab = 'profile' | 'address' | 'orders' | 'logout' | 'home';

type TabItem = {
  key: ProfileTab;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const tabs: TabItem[] = [
  { key: 'home', title: 'Home', icon: 'home-outline' },
  { key: 'profile', title: 'Profile info', icon: 'person-circle-outline' },
  { key: 'address', title: 'Address', icon: 'location-outline' },
  { key: 'orders', title: 'Orders', icon: 'bag-handle-outline' },
  { key: 'logout', title: 'Logout', icon: 'log-out-outline' },
];

const avatarImage = require('../assets/images/icon.png');

export default function ProfileScreen() {
  const { isAuthenticated, logout, userPhone } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [headerInfo, setHeaderInfo] = useState<{ name: string; phone: string }>({
    name: 'Linkon',
    phone: userPhone || '+880 1516-164420',
  });

  const activeTitle = useMemo(
    () => tabs.find((tab) => tab.key === activeTab)?.title ?? 'Profile',
    [activeTab]
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <ProfileInfoCard
            onProfileSaved={(data) => {
              const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
              setHeaderInfo((prev) => ({
                name: fullName || prev.name,
                phone: data.phone || prev.phone,
              }));
            }}
          />
        );
      case 'address':
        return <AddressCard />;
      case 'orders':
        return <OrdersCard />;
      case 'home':
        return null;
      case 'logout':
        return <LogoutCard onLogout={logout} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!userPhone) return;
    setHeaderInfo((prev) => ({ ...prev, phone: userPhone }));
    const loadProfile = async () => {
      try {
        const snap = await getDoc(doc(collection(db, 'users'), userPhone));
        if (snap.exists()) {
          const data = snap.data() as { first_name?: string; last_name?: string; phone?: string };
          const fullName = `${data?.first_name || ''} ${data?.last_name || ''}`.trim();
          setHeaderInfo((prev) => ({
            name: fullName || prev.name,
            phone: data?.phone || prev.phone || userPhone,
          }));
        }
      } catch {
        // ignore fetch errors; UI will keep defaults
      }
    };
    loadProfile();
  }, [userPhone]);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerCard}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarGlow}>
                <Image source={avatarImage} style={styles.avatar} contentFit="cover" />
              </View>
            </View>
            <ThemedText type="title" style={styles.name}>
              {headerInfo.name}
            </ThemedText>
            <ThemedText style={styles.role}>Premium shopper</ThemedText>
            <ThemedText style={styles.contact}>{headerInfo.phone}</ThemedText>
          </View>

          <View style={styles.tabs}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  onPress={() => {
                    setActiveTab(tab.key);
                    if (tab.key === 'home') {
                      router.replace('/');
                    }
                  }}>
                  <View style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                    <Ionicons
                      name={tab.icon}
                      size={22}
                      color={isActive ? '#f97316' : '#6b7280'}
                    />
                  </View>
                  <ThemedText style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {tab.title}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{activeTitle}</ThemedText>
            <ThemedText style={styles.sectionHint}>
              Switch tabs to preview the details for each section.
            </ThemedText>
            {renderContent()}
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f97316',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  homeButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  headerCard: {
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#fff7ed',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ffedd5',
    gap: 6,
  },
  avatarWrap: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fed7aa',
    marginBottom: 4,
  },
  avatarGlow: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fff',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fed7aa',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
  },
  name: {
    fontSize: 24,
  },
  role: {
    color: '#ea580c',
    fontWeight: '800',
    fontSize: 13,
  },
  contact: {
    color: '#4b5563',
    fontSize: 13,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tabButton: {
    flexBasis: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 12,
    alignItems: 'center',
    gap: 8,
  },
  tabButtonActive: {
    borderColor: '#f97316',
    backgroundColor: '#fff7ed',
  },
  tabIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: '#ffedd5',
  },
  tabLabel: {
    fontWeight: '700',
    color: '#374151',
    fontSize: 13,
  },
  tabLabelActive: {
    color: '#d97706',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontWeight: '800',
    fontSize: 18,
    color: '#111827',
  },
  sectionHint: {
    color: '#6b7280',
    fontSize: 13,
  },
});
