import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../theme";
import StarRating from "./StarRating";

export default function DrinkCard({ drink, onPress, compact = false, compactWidth }) {
  const categoryEmojis = {
    Clássicos: "🥃",
    Tropicais: "🌴",
    "Gin-Based": "🫒",
    "Rum & Cachaça": "🍹",
    "Whisky & Bourbon": "🥃",
    "Sem Álcool": "🍹",
  };

  const emoji = categoryEmojis[drink.category?.name] || "🍸";

  return (
    <TouchableOpacity
      style={[styles.card, compact && [styles.cardCompact, compactWidth && { width: compactWidth }]]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Visual placeholder with gradient */}
      <View style={styles.imageContainer}>
        {drink.imageUrl ? (
          <Image
            source={{ uri: `http://192.168.18.223:3333${drink.imageUrl}` }}
            style={styles.drinkImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.gradientBg}>
            <Text style={styles.drinkEmoji}>{emoji}</Text>
          </View>
        )}
        {drink.abv > 0 && (
          <View style={styles.abvBadge}>
            <Text style={styles.abvText}>{drink.abv}%</Text>
          </View>
        )}
        {drink.abv === 0 && (
          <View style={[styles.abvBadge, { backgroundColor: COLORS.success }]}>
            <Text style={styles.abvText}>0%</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {drink.name}
        </Text>

        {drink.establishment && (
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={12}
              color={COLORS.textMuted}
            />
            <Text style={styles.location} numberOfLines={1}>
              {drink.establishment.name}
            </Text>
          </View>
        )}

        <View style={styles.bottomRow}>
          {drink.avgRating !== null && drink.avgRating !== undefined ? (
            <StarRating rating={drink.avgRating} size={14} showValue />
          ) : (
            <Text style={styles.noRating}>Sem avaliações</Text>
          )}
        </View>

        {/* Mini sensory indicators */}
        <View style={styles.sensoryRow}>
          <View style={styles.sensoryDot}>
            <Text style={styles.sensoryEmoji}>🍯</Text>
            <Text style={styles.sensoryVal}>{drink.sweetness}</Text>
          </View>
          <View style={styles.sensoryDot}>
            <Text style={styles.sensoryEmoji}>🫒</Text>
            <Text style={styles.sensoryVal}>{drink.bitterness}</Text>
          </View>
          <View style={styles.sensoryDot}>
            <Text style={styles.sensoryEmoji}>🍋</Text>
            <Text style={styles.sensoryVal}>{drink.citrus}</Text>
          </View>
          <View style={styles.sensoryDot}>
            <Text style={styles.sensoryEmoji}>🔥</Text>
            <Text style={styles.sensoryVal}>{drink.strength}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardCompact: {
    width: 140,
    marginRight: SPACING.base,
  },
  imageContainer: {
    aspectRatio: 1,
    position: "relative",
  },
  gradientBg: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
  },
  drinkImage: {
    width: "100%",
    height: "100%",
  },
  drinkEmoji: {
    fontSize: 48,
  },
  abvBadge: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  abvText: {
    color: COLORS.text,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
  },
  info: {
    padding: SPACING.md,
  },
  name: {
    color: COLORS.text,
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.bold,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 4,
  },
  location: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    flex: 1,
  },
  bottomRow: {
    marginBottom: 6,
  },
  noRating: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    fontStyle: "italic",
  },
  sensoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sensoryDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  sensoryEmoji: {
    fontSize: 10,
  },
  sensoryVal: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
  },
});
