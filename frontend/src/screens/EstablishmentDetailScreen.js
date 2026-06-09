import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SimpleGrid } from "react-native-super-grid";
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
      <ScrollView contentContainerStyle={styles.listContent}>
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
                <Ionicons name="storefront" size={48} color={COLORS.primary} />
              </View>
              <Text style={styles.name}>{establishment.name}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {establishment.drinks?.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>Drinks</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValueSmall}>
                    {new Date(establishment.createdAt).toLocaleDateString("pt-BR", {
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                  <Text style={styles.statLabel}>Desde</Text>
                </View>
              </View>
            </View>

            {establishment.description && (
              <Text style={styles.description}>
                {establishment.description}
              </Text>
            )}

            <View style={styles.contactSection}>
              <TouchableOpacity style={styles.contactRow}>
                <Ionicons name="location" size={18} color={COLORS.primary} />
                <Text style={styles.contactText} selectable>{establishment.address}</Text>
                <Ionicons name="copy-outline" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>

              {establishment.phone && (
                <TouchableOpacity style={styles.contactRow}>
                  <Ionicons name="call" size={18} color={COLORS.primary} />
                  <Text style={styles.contactText} selectable>{establishment.phone}</Text>
                  <Ionicons name="copy-outline" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.sectionTitle}>
              Cardápio ({establishment.drinks?.length || 0})
            </Text>

            {establishment.drinks?.length > 0 ? (
              <SimpleGrid
                itemDimension={140}
                maxItemsPerRow={3}
                data={establishment.drinks}
                spacing={SPACING.base}
                renderItem={({ item }) => (
                  <DrinkCard
                    drink={item}
                    onPress={() =>
                      navigation.navigate("DrinkDetail", { drinkId: item.id })
                    }
                  />
                )}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum drink cadastrado</Text>
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
    marginBottom: SPACING.lg,
  },
  contactSection: {
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactText: {
    color: COLORS.text,
    fontSize: FONTS.sizes.base,
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: SPACING.lg,
    alignItems: "center",
    width: "100%",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.black,
    color: COLORS.primary,
  },
  statValueSmall: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
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
