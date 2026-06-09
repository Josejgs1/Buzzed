import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, SPACING } from "../theme";

const SENSORY_CONFIG = {
  sweetness: { label: "Doçura", color: COLORS.sweet, emoji: "🍯" },
  bitterness: { label: "Amargor", color: COLORS.bitter, emoji: "🫒" },
  citrus: { label: "Cítrico", color: COLORS.citrus, emoji: "🍋" },
  strength: { label: "Força", color: COLORS.strength, emoji: "🔥" },
};

export default function SensoryBar({ type, value, maxValue = 5, size = "md" }) {
  const config = SENSORY_CONFIG[type];
  if (!config || value === null || value === undefined) return null;

  const percentage = (value / maxValue) * 100;
  const barHeight = size === "sm" ? 6 : 8;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.emoji, size === "sm" && styles.emojiSm]}>
          {config.emoji}
        </Text>
        <Text style={[styles.label, size === "sm" && styles.labelSm]}>
          {config.label}
        </Text>
        <Text style={[styles.value, { color: config.color }, size === "sm" && styles.valueSm]}>
          {typeof value === "number" ? value.toFixed(1) : value}/{maxValue}
        </Text>
      </View>
      <View style={[styles.track, { height: barHeight }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: config.color,
              height: barHeight,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  emoji: {
    fontSize: FONTS.sizes.md,
    marginRight: 6,
  },
  emojiSm: {
    fontSize: FONTS.sizes.sm,
    marginRight: 4,
  },
  label: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  labelSm: {
    fontSize: FONTS.sizes.xs,
  },
  value: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  valueSm: {
    fontSize: FONTS.sizes.xs,
  },
  track: {
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    borderRadius: 4,
  },
});
