import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

type Props = {
  palette: { card: string; border: string; muted: string };
  textColor: string;
};

export function FooterSection({ palette, textColor }: Props) {
  const openWhatsApp = () => {
    const phone = "01712508063";
    const url = `https://wa.me/88${phone}`;
    Linking.openURL(url);
  };

  return (
    <View
      style={[
        styles.footer,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
      <View style={styles.topRow}>
        <Image
          source={require("../../public/jannat.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <ThemedText type="subtitle">NeoComerze</ThemedText>
        <View style={styles.brandCopy}>
          <ThemedText
            style={[
              styles.tagline,
              { color: palette.muted, textAlign: "center" },
            ]}
          >
            Everyday essentials, delivered fast with care.
          </ThemedText>
        </View>
      </View>
      <Pressable
        style={[styles.primaryCta, { backgroundColor: 'orange' }]}
        onPress={openWhatsApp}
      >
        <ThemedText style={styles.primaryCtaText}>
          Need help? Chat on WhatsApp
        </ThemedText>
      </Pressable>

      <View style={styles.contactRow}>
        <ThemedText style={[styles.contactText, { color: palette.muted }]}>
          Phone: +880 1700-000000
        </ThemedText>
        <ThemedText style={[styles.contactText, { color: palette.muted }]}>
          Email: support@neocomerze.com
        </ThemedText>
        <ThemedText style={[styles.contactText, { color: palette.muted }]}>
          Address: 123 Banani, Dhaka, Bangladesh
        </ThemedText>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={[styles.linkPill, { borderColor: palette.border }]}>
          <ThemedText
            style={[styles.linkText, { color: textColor }]}
            numberOfLines={1}
            ellipsizeMode="tail">
            Terms & conditions
          </ThemedText>
        </Pressable>
        <Pressable style={[styles.linkPill, { borderColor: palette.border }]}>
          <ThemedText
            style={[styles.linkText, { color: textColor }]}
            numberOfLines={1}
            ellipsizeMode="tail">
            Delivery policy
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.socialRow}>
        <Pressable
          style={[styles.socialButton, { borderColor: palette.border }]}
        >
          <ThemedText style={styles.socialIcon}>f</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.socialButton, { borderColor: palette.border }]}
        >
          <ThemedText style={styles.socialIcon}>ig</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.socialButton, { borderColor: palette.border }]}
        >
          <ThemedText style={styles.socialIcon}>in</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.socialButton, { borderColor: palette.border }]}
        >
          <ThemedText style={styles.socialIcon}>yt</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  logo: { width: 89, height: 89 },
  brandCopy: {
    gap: 4,
    flexShrink: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  tagline: { fontSize: 12, lineHeight: 16 },
  primaryCta: {
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: "stretch",
  },
  primaryCtaText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
  },
  contactRow: {
    gap: 4,
  },
  contactText: {
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  linkPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 999,
  },
  linkText: {
    fontWeight: "700",
    fontSize: 12,
  },
  socialRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  socialButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    fontWeight: "800",
    fontSize: 12,
  },
});
