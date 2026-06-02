import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../theme";
import StarRating from "../components/StarRating";
import api from "../services/api";

export default function HistoryScreen({ navigation }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      const response = await api.get("/reviews/mine");
      setReviews(response.data);
    } catch (error) {
      console.log("Error loading reviews:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadReviews();
    });
    return unsubscribe;
  }, [navigation, loadReviews]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const categoryEmojis = {
    Clássicos: "🥃",
    Tropicais: "🌴",
    "Gin-Based": "🫒",
    "Rum & Cachaça": "🍹",
    "Whisky & Bourbon": "🥃",
    "Sem Álcool": "🍹",
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadReviews();
            }}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>📖 Meu Histórico</Text>
            <Text style={styles.subtitle}>
              {reviews.length} drink{reviews.length !== 1 ? "s" : ""} avaliado
              {reviews.length !== 1 ? "s" : ""}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.drinkEmoji}>
                {categoryEmojis[item.drink?.category?.name] || "🍸"}
              </Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.drinkName}>{item.drink?.name}</Text>
              <View style={styles.cardMeta}>
                <Ionicons
                  name="location-outline"
                  size={12}
                  color={COLORS.textMuted}
                />
                <Text style={styles.establishment}>
                  {item.drink?.establishment?.name}
                </Text>
              </View>
              <View style={styles.ratingRow}>
                <StarRating rating={item.rating} size={14} />
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                </Text>
              </View>
              {item.comment && (
                <Text style={styles.comment} numberOfLines={2}>
                  "{item.comment}"
                </Text>
              )}
              {/* Mini sensory */}
              <View style={styles.sensoryRow}>
                {item.sweetness && (
                  <Text style={styles.sensoryItem}>🍯 {item.sweetness}</Text>
                )}
                {item.bitterness && (
                  <Text style={styles.sensoryItem}>🫒 {item.bitterness}</Text>
                )}
                {item.citrus && (
                  <Text style={styles.sensoryItem}>🍋 {item.citrus}</Text>
                )}
                {item.strength && (
                  <Text style={styles.sensoryItem}>🔥 {item.strength}</Text>
                )}
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>Nenhuma avaliação ainda</Text>
            <Text style={styles.emptyText}>
              Comece a explorar drinks e registre suas experiências!
            </Text>
          </View>
        }
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
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardLeft: {
    width: 60,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
  },
  drinkEmoji: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
    padding: SPACING.md,
  },
  drinkName: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  establishment: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  date: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
  },
  comment: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontStyle: "italic",
    marginBottom: 6,
  },
  sensoryRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  sensoryItem: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xxxl,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    textAlign: "center",
    paddingHorizontal: SPACING.xxl,
  },
});
