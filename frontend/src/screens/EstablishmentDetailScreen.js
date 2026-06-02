import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../theme";
import DrinkCard from "../components/DrinkCard";
import api from "../services/api";

export default function EstablishmentDetailScreen({ route, navigation }) {
  const { establishmentId } = route.params;
  const [establishment, setEstablishment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEstablishment();
  }, [establishmentId]);

  async function loadEstablishment() {
    try {
      const response = await api.get(`/establishments/${establishmentId}`);
      setEstablishment(response.data);
    } catch (error) {
      console.log("Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!establishment) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={establishment.drinks}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Header with back button */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Establishment info */}
            <View style={styles.infoCard}>
              <View style={styles.iconContainer}>
                <Ionicons name="wine" size={48} color={COLORS.primary} />
              </View>
              <Text style={styles.name}>{establishment.name}</Text>

              <View style={styles.metaRow}>
                <Ionicons name="location" size={16} color={COLORS.primary} />
                <Text style={styles.address}>{establishment.address}</Text>
              </View>

              {establishment.phone && (
                <View style={styles.metaRow}>
                  <Ionicons name="call" size={16} color={COLORS.primary} />
                  <Text style={styles.phone}>{establishment.phone}</Text>
                </View>
              )}

              {establishment.description && (
                <Text style={styles.description}>
                  {establishment.description}
                </Text>
              )}

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {establishment.drinks?.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>Drinks</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              🍸 Cardápio ({establishment.drinks?.length || 0})
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <DrinkCard
            drink={item}
            onPress={() =>
              navigation.navigate("DrinkDetail", { drinkId: item.id })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum drink cadastrado</Text>
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
  row: {
    justifyContent: "space-between",
  },
  header: {
    paddingTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  backButton: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.full,
    padding: SPACING.sm,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: COLORS.backgroundLight,
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  name: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  address: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    flex: 1,
  },
  phone: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    lineHeight: 22,
    textAlign: "center",
    marginTop: SPACING.md,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: SPACING.lg,
    gap: SPACING.xxl,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.black,
    color: COLORS.primary,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.md,
  },
});
