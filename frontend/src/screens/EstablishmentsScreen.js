import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../theme";
import api from "../services/api";

export default function EstablishmentsScreen({ navigation }) {
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const response = await api.get("/establishments");
      setEstablishments(response.data);
    } catch (error) {
      console.log("Error loading establishments:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={establishments}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
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
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="location" size={28} color={COLORS.primary} />
              <Text style={styles.title}>Estabelecimentos</Text>
            </View>
            <Text style={styles.subtitle}>
              Explore bares e restaurantes parceiros
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("EstablishmentDetail", {
                establishmentId: item.id,
              })
            }
            activeOpacity={0.8}
          >
            <View style={styles.cardAvatar}>
              <Ionicons name="storefront" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardName}>{item.name}</Text>
              <View style={styles.cardMeta}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={COLORS.textMuted}
                />
                <Text style={styles.cardAddress} numberOfLines={1}>
                  {item.address}
                </Text>
              </View>
              <View style={styles.cardFooter}>
                <View style={styles.drinkCount}>
                  <Ionicons
                    name="beer-outline"
                    size={16}
                    color={COLORS.primary}
                  />
                  <Text style={styles.drinkCountText}>
                    {item._count?.drinks || 0} drinks
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.textMuted}
                />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
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
  listContent: {
    padding: SPACING.base,
    paddingBottom: SPACING.xxxl,
  },
  header: {
    paddingTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: SPACING.xs,
  },
  cardAddress: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    flex: 1,
  },
  cardDescription: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  drinkCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  drinkCountText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
});
