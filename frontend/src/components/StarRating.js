import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../theme";

export default function StarRating({ rating, size = 18, showValue = false }) {
  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2;

  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(roundedRating)) {
      stars.push(
        <Ionicons key={i} name="star" size={size} color={COLORS.star} />
      );
    } else if (i - 0.5 === roundedRating) {
      stars.push(
        <Ionicons key={i} name="star-half" size={size} color={COLORS.star} />
      );
    } else {
      stars.push(
        <Ionicons key={i} name="star-outline" size={size} color={COLORS.starEmpty} />
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.stars}>{stars}</View>
      {showValue && rating !== null && (
        <Text style={[styles.value, { fontSize: size * 0.8 }]}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  value: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
    marginLeft: 6,
  },
});
