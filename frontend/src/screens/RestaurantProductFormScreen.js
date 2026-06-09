import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../theme";
import api from "../services/api";

const initialForm = {
  name: "",
  description: "",
  categoryId: "",
  abv: "0",
  sweetness: 3,
  bitterness: 1,
  citrus: 3,
  strength: 2,
  ingredients: "",
};

export default function RestaurantProductFormScreen({ route, navigation }) {
  const drinkId = route.params?.drinkId;
  const isEditing = !!drinkId;
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [categoriesRes, drinkRes] = await Promise.all([
        api.get("/categories"),
        isEditing ? api.get(`/restaurant/drinks/${drinkId}`) : Promise.resolve(null),
      ]);

      setCategories(categoriesRes.data);

      if (drinkRes?.data) {
        const drink = drinkRes.data;
        setForm({
          name: drink.name || "",
          description: drink.description || "",
          categoryId: String(drink.categoryId || ""),
          abv: String(drink.abv ?? 0),
          sweetness: drink.sweetness ?? 3,
          bitterness: drink.bitterness ?? 1,
          citrus: drink.citrus ?? 3,
          strength: drink.strength ?? 2,
          ingredients: drink.ingredients?.map((item) => item.name).join(", ") || "",
        });
      } else if (categoriesRes.data[0]) {
        setForm((current) => ({
          ...current,
          categoryId: String(categoriesRes.data[0].id),
        }));
      }
    } catch (error) {
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Não foi possível carregar o formulário"
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [drinkId, isEditing, navigation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validate() {
    if (!form.name.trim()) return "Nome do produto é obrigatório";
    if (!form.categoryId) return "Selecione uma categoria";
    if (!form.ingredients.trim()) return "Informe pelo menos um ingrediente";

    const abv = Number(form.abv);
    if (!Number.isFinite(abv) || abv < 0 || abv > 100) {
      return "Teor alcoólico deve estar entre 0 e 100";
    }

    return null;
  }

  async function handleSave() {
    const error = validate();
    if (error) {
      Alert.alert("Erro", error);
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      categoryId: Number(form.categoryId),
      abv: Number(form.abv),
      sweetness: form.sweetness,
      bitterness: form.bitterness,
      citrus: form.citrus,
      strength: form.strength,
      ingredients: form.ingredients,
    };

    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/restaurant/drinks/${drinkId}`, payload);
      } else {
        await api.post("/restaurant/drinks", payload);
      }
      navigation.goBack();
    } catch (requestError) {
      Alert.alert(
        "Erro",
        requestError.response?.data?.error || "Não foi possível salvar o produto"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{isEditing ? "Editar produto" : "Novo produto"}</Text>
          <Text style={styles.subtitle}>Cardápio do restaurante</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <Input
          label="Nome"
          value={form.name}
          onChangeText={(value) => setField("name", value)}
          placeholder="Ex.: Gin Tônica da Casa"
        />

        <Input
          label="Descrição"
          value={form.description}
          onChangeText={(value) => setField("description", value)}
          placeholder="Descrição curta do produto"
          multiline
        />

        <Text style={styles.inputLabel}>Categoria</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((category) => {
            const active = form.categoryId === String(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
                onPress={() => setField("categoryId", String(category.id))}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    active && styles.categoryChipTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Input
          label="Teor alcoólico (% ABV)"
          value={form.abv}
          onChangeText={(value) => setField("abv", value.replace(",", "."))}
          placeholder="0"
          keyboardType="numeric"
        />

        <Text style={styles.inputLabel}>Perfil sensorial</Text>
        <View style={styles.sensoryGroup}>
          <SensorySelector
            label="🍯 Doçura"
            value={form.sweetness}
            color={COLORS.sweet}
            onChange={(value) => setField("sweetness", value)}
          />
          <SensorySelector
            label="🫒 Amargor"
            value={form.bitterness}
            color={COLORS.bitter}
            onChange={(value) => setField("bitterness", value)}
          />
          <SensorySelector
            label="🍋 Cítrico"
            value={form.citrus}
            color={COLORS.citrus}
            onChange={(value) => setField("citrus", value)}
          />
          <SensorySelector
            label="🔥 Força"
            value={form.strength}
            color={COLORS.strength}
            onChange={(value) => setField("strength", value)}
          />
        </View>

        <Input
          label="Ingredientes"
          value={form.ingredients}
          onChangeText={(value) => setField("ingredients", value)}
          placeholder="Gin, água tônica, limão, gelo"
          multiline
        />

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color={COLORS.background} />
              <Text style={styles.saveButtonText}>Salvar produto</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Input({ label, multiline = false, ...props }) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholderTextColor={COLORS.textMuted}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        {...props}
      />
    </View>
  );
}

function SensorySelector({ label, value, color, onChange }) {
  return (
    <View style={styles.selectorRow}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <View style={styles.selectorDots}>
        {[0, 1, 2, 3, 4, 5].map((number) => {
          const active = number === value;
          return (
            <TouchableOpacity
              key={number}
              style={[
                styles.selectorDot,
                active && { backgroundColor: color, borderColor: color },
              ]}
              onPress={() => onChange(number)}
            >
              <Text
                style={[
                  styles.selectorDotText,
                  active && styles.selectorDotTextActive,
                ]}
              >
                {number}
              </Text>
            </TouchableOpacity>
          );
        })}
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
  content: {
    padding: SPACING.base,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerText: {
    flex: 1,
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
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputContainer: {
    marginBottom: SPACING.base,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    marginBottom: SPACING.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    color: COLORS.text,
    fontSize: FONTS.sizes.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 88,
  },
  categoryList: {
    gap: SPACING.sm,
    marginBottom: SPACING.base,
    paddingRight: SPACING.base,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  categoryChipTextActive: {
    color: COLORS.background,
    fontWeight: FONTS.weights.bold,
  },
  sensoryGroup: {
    gap: SPACING.md,
    marginBottom: SPACING.base,
  },
  selectorRow: {
    gap: SPACING.sm,
  },
  selectorLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  selectorDots: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  selectorDot: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
  },
  selectorDotText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  selectorDotTextActive: {
    color: COLORS.background,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  saveButtonText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.bold,
  },
  disabledButton: {
    opacity: 0.7,
  },
});
