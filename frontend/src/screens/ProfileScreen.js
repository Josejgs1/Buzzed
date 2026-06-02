import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../theme";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [myBadges, setMyBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [profileRes, myBadgesRes, allBadgesRes] = await Promise.all([
        api.get("/auth/profile"),
        api.get("/badges/mine"),
        api.get("/badges"),
      ]);
      setProfile(profileRes.data);
      setMyBadges(myBadgesRes.data);
      setAllBadges(allBadgesRes.data);
    } catch (error) {
      console.log("Error loading profile:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  function handleSignOut() {
    Alert.alert("Sair", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: signOut },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const ownedBadgeIds = new Set(myBadges.map((b) => b.id));

  const badgeEmojis = {
    "Primeiro Gole": "🥂",
    "Explorador Iniciante": "🗺️",
    Mixologista: "🧪",
    "Mestre dos Clássicos": "🎩",
    "Viajante Tropical": "🌴",
    "Amante do Gin": "🫒",
    "Bar Hopper": "🏃",
    "Crítico Exigente": "✍️",
  };

  // Compute explorer level
  const reviewCount = profile?._count?.reviews || 0;
  let level = "Iniciante";
  let levelEmoji = "🌱";
  if (reviewCount >= 15) {
    level = "Mixologista";
    levelEmoji = "🧪";
  } else if (reviewCount >= 5) {
    level = "Explorador";
    levelEmoji = "🗺️";
  } else if (reviewCount >= 1) {
    level = "Curioso";
    levelEmoji = "👀";
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadData();
          }}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color={COLORS.primary} />
        </View>
        <Text style={styles.userName}>{profile?.name}</Text>
        <Text style={styles.userEmail}>{profile?.email}</Text>

        <View style={styles.levelBadge}>
          <Text style={styles.levelEmoji}>{levelEmoji}</Text>
          <Text style={styles.levelText}>{level}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{reviewCount}</Text>
            <Text style={styles.statLabel}>Avaliações</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{myBadges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {new Date(profile?.createdAt).toLocaleDateString("pt-BR", {
                month: "short",
                year: "numeric",
              })}
            </Text>
            <Text style={styles.statLabel}>Desde</Text>
          </View>
        </View>
      </View>

      {/* Badges section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          🏆 Conquistas ({myBadges.length}/{allBadges.length})
        </Text>
        <View style={styles.badgesGrid}>
          {allBadges.map((badge) => {
            const owned = ownedBadgeIds.has(badge.id);
            return (
              <View
                key={badge.id}
                style={[styles.badgeCard, !owned && styles.badgeCardLocked]}
              >
                <Text style={[styles.badgeEmoji, !owned && styles.badgeEmojiLocked]}>
                  {badgeEmojis[badge.name] || "🏅"}
                </Text>
                <Text
                  style={[styles.badgeName, !owned && styles.badgeNameLocked]}
                  numberOfLines={1}
                >
                  {badge.name}
                </Text>
                <Text
                  style={[
                    styles.badgeDescription,
                    !owned && styles.badgeDescriptionLocked,
                  ]}
                  numberOfLines={2}
                >
                  {badge.description}
                </Text>
                {owned && (
                  <View style={styles.unlockedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={COLORS.success}
                    />
                    <Text style={styles.unlockedText}>Desbloqueado</Text>
                  </View>
                )}
                {!owned && (
                  <View style={styles.lockedBadge}>
                    <Ionicons
                      name="lock-closed"
                      size={14}
                      color={COLORS.textMuted}
                    />
                    <Text style={styles.lockedText}>Bloqueado</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.accent} />
        <Text style={styles.signOutText}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: SPACING.base,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  userName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "22",
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary + "44",
    marginBottom: SPACING.lg,
  },
  levelEmoji: {
    fontSize: 18,
  },
  levelText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.black,
    color: COLORS.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  badgeCard: {
    width: "47%",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + "44",
  },
  badgeCardLocked: {
    borderColor: COLORS.border,
    opacity: 0.6,
  },
  badgeEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  badgeEmojiLocked: {
    opacity: 0.4,
  },
  badgeName: {
    color: COLORS.text,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    marginBottom: 4,
  },
  badgeNameLocked: {
    color: COLORS.textMuted,
  },
  badgeDescription: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    lineHeight: 16,
    marginBottom: SPACING.xs,
  },
  badgeDescriptionLocked: {
    color: COLORS.textMuted,
  },
  unlockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  unlockedText: {
    color: COLORS.success,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  lockedText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.accent + "44",
    marginTop: SPACING.md,
  },
  signOutText: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.medium,
  },
});
