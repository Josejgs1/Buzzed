import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SimpleGrid } from "react-native-super-grid";
import { COLORS, FONTS, SPACING, RADIUS } from "../theme";
import DrinkCard from "../components/DrinkCard";
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

  const sections = useMemo(() => {
    const grouped = {};
    reviews.forEach((review) => {
      const date = new Date(review.createdAt).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(review);
    });
    return Object.entries(grouped).map(([date, items]) => ({ date, items }));
  }, [reviews]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
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
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="book" size={28} color={COLORS.primary} />
            <Text style={styles.title}>Meu Histórico</Text>
          </View>
          <Text style={styles.subtitle}>
            {reviews.length} drink{reviews.length !== 1 ? "s" : ""} avaliado
            {reviews.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {sections.length > 0 ? (
          sections.map((section) => (
            <View key={section.date}>
              <Text style={styles.dateHeader}>{section.date}</Text>
              <SimpleGrid
                itemDimension={140}
                maxItemsPerRow={3}
                data={section.items}
                spacing={SPACING.base}
                renderItem={({ item }) => (
                  <DrinkCard
                    drink={item.drink}
                    onPress={() =>
                      navigation.navigate("DrinkDetail", { drinkId: item.drink?.id })
                    }
                  />
                )}
              />
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={56} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Nenhuma avaliação ainda</Text>
            <Text style={styles.emptyText}>
              Comece a explorar drinks e registre suas experiências!
            </Text>
          </View>
        )}
      </ScrollView>
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
  dateHeader: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
    textTransform: "capitalize",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    textAlign: "center",
    paddingHorizontal: SPACING.xxl,
  },
});
