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
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../theme";
import { useAuth } from "../contexts/AuthContext";
import StarRating from "../components/StarRating";
import api from "../services/api";

export default function RestaurantDashboardScreen() {
  const { user, signOut } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    description: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const response = await api.get("/restaurant/dashboard");
      setDashboard(response.data);
      setForm({
        name: response.data.establishment?.name || "",
        address: response.data.establishment?.address || "",
        phone: response.data.establishment?.phone || "",
        description: response.data.establishment?.description || "",
      });
    } catch (error) {
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Não foi possível carregar o painel"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    if (!form.name || !form.address) {
      Alert.alert("Erro", "Nome e endereço são obrigatórios");
      return;
    }

    setSaving(true);
    try {
      await api.put("/restaurant/establishment", form);
      setEditing(false);
      loadDashboard();
    } catch (error) {
      Alert.alert(
        "Erro",
        error.response?.data?.error || "Não foi possível salvar os dados"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const establishment = dashboard?.establishment;
  const stats = dashboard?.stats || {};

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadDashboard();
          }}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Painel do restaurante</Text>
          <Text style={styles.subtitle}>Olá, {user?.name?.split(" ")[0]}</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.drinkCount || 0}</Text>
          <Text style={styles.statLabel}>Produtos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.reviewCount || 0}</Text>
          <Text style={styles.statLabel}>Avaliações</Text>
        </View>
      </View>

      <View style={styles.ratingCard}>
        <Text style={styles.sectionTitle}>Média geral</Text>
        {stats.avgRating ? (
          <StarRating rating={stats.avgRating} size={22} showValue />
        ) : (
          <Text style={styles.mutedText}>Ainda sem avaliações</Text>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Dados do espaço</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setEditing((current) => !current)}
          >
            <Ionicons
              name={editing ? "close" : "create-outline"}
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.secondaryButtonText}>
              {editing ? "Cancelar" : "Editar"}
            </Text>
          </TouchableOpacity>
        </View>

        {editing ? (
          <>
            <Input
              label="Nome"
              value={form.name}
              onChangeText={(value) => setField("name", value)}
            />
            <Input
              label="Endereço"
              value={form.address}
              onChangeText={(value) => setField("address", value)}
            />
            <Input
              label="Telefone"
              value={form.phone}
              onChangeText={(value) => setField("phone", value)}
              keyboardType="phone-pad"
            />
            <Input
              label="Descrição"
              value={form.description}
              onChangeText={(value) => setField("description", value)}
              multiline
            />

            <TouchableOpacity
              style={[styles.primaryButton, saving && styles.disabledButton]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <Text style={styles.primaryButtonText}>Salvar alterações</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.establishmentName}>{establishment?.name}</Text>
            <InfoRow icon="location-outline" text={establishment?.address} />
            {establishment?.phone && (
              <InfoRow icon="call-outline" text={establishment.phone} />
            )}
            {establishment?.description && (
              <Text style={styles.description}>{establishment.description}</Text>
            )}
          </>
        )}
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

function InfoRow({ icon, text }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={COLORS.primary} />
      <Text style={styles.infoText}>{text}</Text>
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
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.black,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  ratingCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
  mutedText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.md,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
  },
  establishmentName: {
    color: COLORS.text,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  infoText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    lineHeight: 22,
    marginTop: SPACING.sm,
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
    minHeight: 90,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  primaryButtonText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.bold,
  },
  disabledButton: {
    opacity: 0.7,
  },
});
