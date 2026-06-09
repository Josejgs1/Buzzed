import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../theme";
import StarRating from "../components/StarRating";
import api from "../services/api";

export default function RestaurantReviewsScreen({ navigation }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      const response = await api.get("/restaurant/reviews");
      setReviews(response.data);
    } catch (error) {
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Não foi possível carregar avaliações"
      );
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
            <Text style={styles.title}>Avaliações</Text>
            <Text style={styles.subtitle}>
              {reviews.length} feedback(s) recebido(s)
            </Text>
          </View>
        }
        renderItem={({ item }) => <ReviewCard review={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>Ainda sem avaliações</Text>
            <Text style={styles.emptyText}>
              As avaliações dos clientes aparecerão aqui.
            </Text>
          </View>
        }
      />
    </View>
  );
}

function ReviewCard({ review }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userRow}>
          <Ionicons name="person-circle" size={34} color={COLORS.primary} />
          <View>
            <Text style={styles.userName}>{review.user?.name}</Text>
            <Text style={styles.date}>
              {new Date(review.createdAt).toLocaleDateString("pt-BR")}
            </Text>
          </View>
        </View>
        <StarRating rating={review.rating} size={15} />
      </View>

      <View style={styles.drinkRow}>
        <Ionicons name="beer-outline" size={16} color={COLORS.primary} />
        <Text style={styles.drinkName}>{review.drink?.name}</Text>
      </View>

      {review.comment && <Text style={styles.comment}>{review.comment}</Text>}

      <View style={styles.sensoryRow}>
        {review.sweetness !== null && (
          <Text style={styles.sensoryItem}>🍯 {review.sweetness}</Text>
        )}
        {review.bitterness !== null && (
          <Text style={styles.sensoryItem}>🫒 {review.bitterness}</Text>
        )}
        {review.citrus !== null && (
          <Text style={styles.sensoryItem}>🍋 {review.citrus}</Text>
        )}
        {review.strength !== null && (
          <Text style={styles.sensoryItem}>🔥 {review.strength}</Text>
        )}
      </View>
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
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    color: COLORS.text,
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flex: 1,
  },
  userName: {
    color: COLORS.text,
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.bold,
  },
  date: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    marginTop: 2,
  },
  drinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  drinkName: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  comment: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  sensoryRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  sensoryItem: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
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
  },
});
