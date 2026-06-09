import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../theme";
import StarRating from "../components/StarRating";
import api from "../services/api";

export default function RestaurantProductsScreen({ navigation }) {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDrinks = useCallback(async () => {
    try {
      const response = await api.get("/restaurant/drinks");
      setDrinks(response.data);
    } catch (error) {
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Não foi possível carregar os produtos"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDrinks();
  }, [loadDrinks]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadDrinks();
    });
    return unsubscribe;
  }, [navigation, loadDrinks]);

  function handleDelete(drink) {
    Alert.alert(
      "Remover produto",
      `Deseja remover "${drink.name}" do cardápio?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/restaurant/drinks/${drink.id}`);
              loadDrinks();
            } catch (error) {
              Alert.alert(
                "Erro",
                error.response?.data?.error || "Não foi possível remover"
              );
            }
          },
        },
      ]
    );
  }

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
        data={drinks}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadDrinks();
            }}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Produtos</Text>
              <Text style={styles.subtitle}>{drinks.length} item(ns) ativos</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate("RestaurantProductForm")}
            >
              <Ionicons name="add" size={22} color={COLORS.background} />
              <Text style={styles.addButtonText}>Novo</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            drink={item}
            onEdit={() =>
              navigation.navigate("RestaurantProductForm", { drinkId: item.id })
            }
            onDelete={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🍸</Text>
            <Text style={styles.emptyTitle}>Nenhum produto cadastrado</Text>
            <Text style={styles.emptyText}>
              Cadastre o primeiro drink para ele aparecer na busca dos clientes.
            </Text>
          </View>
        }
      />
    </View>
  );
}

function ProductCard({ drink, onEdit, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardIcon}>
          <Ionicons name="beer" size={30} color={COLORS.primary} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.drinkName}>{drink.name}</Text>
          <Text style={styles.category}>{drink.category?.name}</Text>
          {drink.description && (
            <Text style={styles.description} numberOfLines={2}>
              {drink.description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="flame-outline" size={14} color={COLORS.accent} />
          <Text style={styles.metaText}>{drink.abv}% ABV</Text>
        </View>
        {drink.avgRating ? (
          <StarRating rating={drink.avgRating} size={14} showValue />
        ) : (
          <Text style={styles.noRating}>Sem avaliações</Text>
        )}
      </View>

      <View style={styles.sensoryRow}>
        <Text style={styles.sensoryItem}>🍯 {drink.sweetness}</Text>
        <Text style={styles.sensoryItem}>🫒 {drink.bitterness}</Text>
        <Text style={styles.sensoryItem}>🍋 {drink.citrus}</Text>
        <Text style={styles.sensoryItem}>🔥 {drink.strength}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Ionicons name="create-outline" size={18} color={COLORS.primary} />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={18} color={COLORS.accent} />
          <Text style={styles.deleteButtonText}>Remover</Text>
        </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  addButtonText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  cardTop: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  cardIcon: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  drinkName: {
    color: COLORS.text,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
  category: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
    fontWeight: FONTS.weights.medium,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    lineHeight: 18,
    marginTop: SPACING.xs,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
  },
  noRating: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
  },
  sensoryRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  sensoryItem: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  editButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  deleteButtonText: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
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
