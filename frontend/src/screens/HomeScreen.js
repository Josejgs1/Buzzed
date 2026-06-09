import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SimpleGrid } from "react-native-super-grid";
import { COLORS, FONTS, SPACING, RADIUS } from "../theme";
import { useAuth } from "../contexts/AuthContext";
import DrinkCard from "../components/DrinkCard";
import api from "../services/api";

const ITEM_DIMENSION = 140;
const GRID_SPACING = SPACING.base;

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [drinks, setDrinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cardWidth, setCardWidth] = useState(ITEM_DIMENSION);

  const loadData = useCallback(async () => {
    try {
      const [drinksRes, catsRes] = await Promise.all([
        api.get("/drinks", {
          params: selectedCategory ? { categoryId: selectedCategory } : {},
        }),
        api.get("/categories"),
      ]);
      setDrinks(drinksRes.data);
      setCategories(catsRes.data);
    } catch (error) {
      console.log("Error loading data:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reload when navigating back
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  function onRefresh() {
    setRefreshing(true);
    loadData();
  }

  const categoryEmojis = {
    Clássicos: "🥃",
    Tropicais: "🌴",
    "Gin-Based": "🫒",
    "Rum & Cachaça": "🍹",
    "Whisky & Bourbon": "🥃",
    "Sem Álcool": "🍹",
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const topRated = [...drinks]
    .filter((d) => d.avgRating !== null)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 6);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>
                  Olá, {user?.name?.split(" ")[0]} 👋
                </Text>
                <Text style={styles.subtitle}>
                  O que vai beber hoje?
                </Text>
              </View>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate("ProfileTab")}
              >
                <Ionicons name="person-circle" size={40} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Category filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              contentContainerStyle={styles.categoriesContent}
            >
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  !selectedCategory && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={styles.categoryEmoji}>🍸</Text>
                <Text
                  style={[
                    styles.categoryText,
                    !selectedCategory && styles.categoryTextActive,
                  ]}
                >
                  Todos
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.id && styles.categoryChipActive,
                  ]}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === cat.id ? null : cat.id
                    )
                  }
                >
                  <Text style={styles.categoryEmoji}>
                    {categoryEmojis[cat.name] || "🍸"}
                  </Text>
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === cat.id && styles.categoryTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                  <View style={styles.categoryCount}>
                    <Text style={styles.categoryCountText}>
                      {cat._count.drinks}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Top rated section (only when no filter) */}
            {!selectedCategory && topRated.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="star" size={20} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Mais bem avaliados</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                >
                  {topRated.map((drink) => (
                    <DrinkCard
                      key={drink.id}
                      drink={drink}
                      compact
                      compactWidth={cardWidth}
                      onPress={() =>
                        navigation.navigate("DrinkDetail", { drinkId: drink.id })
                      }
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>
                {selectedCategory
                  ? `${categories.find((c) => c.id === selectedCategory)?.name || "Filtrado"}`
                  : "Todos os drinks"}
                {" "}
                <Text style={styles.countText}>({drinks.length})</Text>
              </Text>
            </View>

            {drinks.length > 0 ? (
              <SimpleGrid
                itemDimension={ITEM_DIMENSION}
                maxItemsPerRow={3}
                data={drinks}
                spacing={GRID_SPACING}
                renderItem={({ item }) => (
                  <View onLayout={(e) => {
                    const w = e.nativeEvent.layout.width;
                    if (w !== cardWidth) setCardWidth(w);
                  }}>
                    <DrinkCard
                      drink={item}
                      onPress={() =>
                        navigation.navigate("DrinkDetail", { drinkId: item.id })
                      }
                    />
                  </View>
                )}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyText}>
                  Nenhum drink encontrado nesta categoria
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
    paddingTop: SPACING.md,
  },
  greeting: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  profileButton: {
    padding: SPACING.xs,
  },
  categoriesScroll: {
    marginBottom: SPACING.lg,
  },
  categoriesContent: {
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  categoryTextActive: {
    color: COLORS.background,
    fontWeight: FONTS.weights.bold,
  },
  categoryCount: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  categoryCountText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },
  countText: {
    color: COLORS.textMuted,
    fontWeight: FONTS.weights.regular,
    fontSize: FONTS.sizes.md,
  },
  horizontalList: {
    paddingRight: SPACING.base,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xxxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.base,
  },
});
