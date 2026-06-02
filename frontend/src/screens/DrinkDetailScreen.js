import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../theme";
import { useAuth } from "../contexts/AuthContext";
import SensoryBar from "../components/SensoryBar";
import StarRating from "../components/StarRating";
import api from "../services/api";

export default function DrinkDetailScreen({ route, navigation }) {
  const { drinkId } = route.params;
  const { signed } = useAuth();
  const [drink, setDrink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Review form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sweetness, setSweetness] = useState(3);
  const [bitterness, setBitterness] = useState(3);
  const [citrus, setCitrus] = useState(3);
  const [strength, setStrength] = useState(3);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDrink();
  }, [drinkId]);

  async function loadDrink() {
    try {
      const response = await api.get(`/drinks/${drinkId}`);
      setDrink(response.data);
    } catch (error) {
      console.log("Error loading drink:", error.message);
      Alert.alert("Erro", "Não foi possível carregar o drink");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitReview() {
    if (rating === 0) {
      Alert.alert("Erro", "Selecione uma nota (1-5 estrelas)");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post("/reviews", {
        drinkId,
        rating,
        comment: comment.trim() || null,
        sweetness,
        bitterness,
        citrus,
        strength,
      });

      const { newBadges } = response.data;

      if (newBadges && newBadges.length > 0) {
        Alert.alert(
          "🏆 Nova conquista!",
          newBadges.map((b) => `${b.name}: ${b.description}`).join("\n"),
          [{ text: "Incrível!" }]
        );
      } else {
        Alert.alert("Sucesso", "Avaliação enviada com sucesso!");
      }

      setShowReviewForm(false);
      setRating(0);
      setComment("");
      loadDrink(); // Reload to show new review
    } catch (error) {
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Erro ao enviar avaliação"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!drink) return null;

  const categoryEmojis = {
    Clássicos: "🥃",
    Tropicais: "🌴",
    "Gin-Based": "🫒",
    "Rum & Cachaça": "🍹",
    "Whisky & Bourbon": "🥃",
    "Sem Álcool": "🍹",
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroGradient}>
          <Text style={styles.heroEmoji}>
            {categoryEmojis[drink.category?.name] || "🍸"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.abvBadge}>
          <Text style={styles.abvText}>
            {drink.abv > 0 ? `${drink.abv}% ABV` : "Sem álcool"}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.name}>{drink.name}</Text>

        <View style={styles.metaRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{drink.category?.name}</Text>
          </View>
          {drink.avgRating !== null && (
            <View style={styles.ratingContainer}>
              <StarRating rating={drink.avgRating} size={18} showValue />
              <Text style={styles.reviewCount}>
                ({drink.reviewCount} avaliações)
              </Text>
            </View>
          )}
        </View>

        {/* Establishment */}
        <TouchableOpacity
          style={styles.establishmentCard}
          onPress={() =>
            navigation.navigate("EstablishmentDetail", {
              establishmentId: drink.establishment?.id,
            })
          }
        >
          <Ionicons name="location" size={20} color={COLORS.primary} />
          <View style={styles.establishmentInfo}>
            <Text style={styles.establishmentName}>
              {drink.establishment?.name}
            </Text>
            <Text style={styles.establishmentAddress}>
              {drink.establishment?.address}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Description */}
        {drink.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Descrição</Text>
            <Text style={styles.description}>{drink.description}</Text>
          </View>
        )}

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Ingredientes</Text>
          <View style={styles.ingredientsList}>
            {drink.ingredients?.map((ing) => (
              <View key={ing.id} style={styles.ingredientChip}>
                <Text style={styles.ingredientText}>{ing.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Sensory Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👅 Perfil Sensorial</Text>
          <View style={styles.sensoryCard}>
            <SensoryBar type="sweetness" value={drink.sweetness} />
            <SensoryBar type="bitterness" value={drink.bitterness} />
            <SensoryBar type="citrus" value={drink.citrus} />
            <SensoryBar type="strength" value={drink.strength} />
          </View>
        </View>

        {/* Average user sensory (if reviews exist) */}
        {drink.avgSensory?.sweetness && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              👥 Percepção dos usuários
            </Text>
            <View style={styles.sensoryCard}>
              <SensoryBar
                type="sweetness"
                value={drink.avgSensory.sweetness}
                size="sm"
              />
              <SensoryBar
                type="bitterness"
                value={drink.avgSensory.bitterness}
                size="sm"
              />
              <SensoryBar
                type="citrus"
                value={drink.avgSensory.citrus}
                size="sm"
              />
              <SensoryBar
                type="strength"
                value={drink.avgSensory.strength}
                size="sm"
              />
            </View>
          </View>
        )}

        {/* Review button */}
        {signed && !showReviewForm && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => setShowReviewForm(true)}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.background} />
            <Text style={styles.reviewButtonText}>Avaliar este drink</Text>
          </TouchableOpacity>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <View style={styles.reviewForm}>
            <Text style={styles.sectionTitle}>✍️ Sua avaliação</Text>

            {/* Star selector */}
            <Text style={styles.formLabel}>Nota geral</Text>
            <View style={styles.starSelector}>
              {[1, 2, 3, 4, 5].map((i) => (
                <TouchableOpacity key={i} onPress={() => setRating(i)}>
                  <Ionicons
                    name={i <= rating ? "star" : "star-outline"}
                    size={36}
                    color={i <= rating ? COLORS.star : COLORS.starEmpty}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Sensory sliders */}
            <Text style={styles.formLabel}>Sua percepção sensorial</Text>
            <View style={styles.sliderGroup}>
              {[
                {
                  label: "🍯 Doçura",
                  value: sweetness,
                  setter: setSweetness,
                  color: COLORS.sweet,
                },
                {
                  label: "🫒 Amargor",
                  value: bitterness,
                  setter: setBitterness,
                  color: COLORS.bitter,
                },
                {
                  label: "🍋 Cítrico",
                  value: citrus,
                  setter: setCitrus,
                  color: COLORS.citrus,
                },
                {
                  label: "🔥 Força",
                  value: strength,
                  setter: setStrength,
                  color: COLORS.strength,
                },
              ].map((item) => (
                <View key={item.label} style={styles.sliderRow}>
                  <Text style={styles.sliderLabel}>{item.label}</Text>
                  <View style={styles.sliderButtons}>
                    {[1, 2, 3, 4, 5].map((v) => (
                      <TouchableOpacity
                        key={v}
                        style={[
                          styles.sliderDot,
                          v === item.value && {
                            backgroundColor: item.color,
                            borderColor: item.color,
                          },
                        ]}
                        onPress={() => item.setter(v)}
                      >
                        <Text
                          style={[
                            styles.sliderDotText,
                            v === item.value && styles.sliderDotTextActive,
                          ]}
                        >
                          {v}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Comment */}
            <Text style={styles.formLabel}>Comentário (opcional)</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Conte sua experiência com este drink..."
              placeholderTextColor={COLORS.textMuted}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowReviewForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  submitting && { opacity: 0.7 },
                ]}
                onPress={handleSubmitReview}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.background} size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Reviews list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            💬 Avaliações ({drink.reviews?.length || 0})
          </Text>
          {drink.reviews?.length > 0 ? (
            drink.reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewUser}>
                    <Ionicons
                      name="person-circle"
                      size={32}
                      color={COLORS.primary}
                    />
                    <View>
                      <Text style={styles.reviewUserName}>
                        {review.user?.name}
                      </Text>
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                      </Text>
                    </View>
                  </View>
                  <StarRating rating={review.rating} size={14} />
                </View>
                {review.comment && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
                {/* Mini sensory from user */}
                <View style={styles.reviewSensory}>
                  {review.sweetness && (
                    <Text style={styles.reviewSensoryItem}>
                      🍯 {review.sweetness}
                    </Text>
                  )}
                  {review.bitterness && (
                    <Text style={styles.reviewSensoryItem}>
                      🫒 {review.bitterness}
                    </Text>
                  )}
                  {review.citrus && (
                    <Text style={styles.reviewSensoryItem}>
                      🍋 {review.citrus}
                    </Text>
                  )}
                  {review.strength && (
                    <Text style={styles.reviewSensoryItem}>
                      🔥 {review.strength}
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noReviews}>
              <Text style={styles.noReviewsEmoji}>📝</Text>
              <Text style={styles.noReviewsText}>
                Nenhuma avaliação ainda. Seja o primeiro!
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
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
  hero: {
    height: 200,
    position: "relative",
  },
  heroGradient: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
  },
  heroEmoji: {
    fontSize: 80,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: SPACING.base,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: RADIUS.full,
    padding: SPACING.sm,
  },
  abvBadge: {
    position: "absolute",
    bottom: SPACING.base,
    right: SPACING.base,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  abvText: {
    color: COLORS.text,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  content: {
    padding: SPACING.base,
    paddingBottom: SPACING.xxxl,
  },
  name: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.black,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary + "22",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary + "44",
  },
  categoryText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  reviewCount: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
  },
  establishmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  establishmentInfo: {
    flex: 1,
  },
  establishmentName: {
    color: COLORS.text,
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.bold,
  },
  establishmentAddress: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.base,
    lineHeight: 24,
  },
  ingredientsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  ingredientChip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ingredientText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
  },
  sensoryCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  reviewButtonText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.bold,
  },
  // Review form
  reviewForm: {
    backgroundColor: COLORS.card,
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + "44",
    marginBottom: SPACING.xl,
  },
  formLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  starSelector: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sliderGroup: {
    gap: SPACING.md,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sliderLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    width: 100,
  },
  sliderButtons: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  sliderDot: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderDotText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  sliderDotTextActive: {
    color: COLORS.text,
  },
  commentInput: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONTS.sizes.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 80,
  },
  formActions: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
  },
  submitButtonText: {
    color: COLORS.background,
    fontWeight: FONTS.weights.bold,
  },
  // Reviews list
  reviewCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  reviewUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  reviewUserName: {
    color: COLORS.text,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  reviewDate: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
  },
  reviewComment: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  reviewSensory: {
    flexDirection: "row",
    gap: SPACING.md,
    flexWrap: "wrap",
  },
  reviewSensoryItem: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
  },
  noReviews: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  noReviewsEmoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  noReviewsText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.md,
  },
});
