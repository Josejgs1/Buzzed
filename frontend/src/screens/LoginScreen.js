import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { COLORS, FONTS, SPACING, RADIUS } from "../theme";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen() {
  const { signIn, signUp, signUpRestaurant } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [establishmentName, setEstablishmentName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";
  const isRestaurant = mode === "restaurant";

  async function handleSubmit() {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha email e senha");
      return;
    }

    if (!isLogin && !name) {
      Alert.alert("Erro", "Preencha seu nome");
      return;
    }

    if (isRestaurant && (!establishmentName || !address)) {
      Alert.alert("Erro", "Preencha nome e endereço do restaurante");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else if (isRestaurant) {
        await signUpRestaurant({
          ownerName: name,
          email,
          password,
          establishmentName,
          address,
          phone,
          description,
        });
      } else {
        await signUp(name, email, password);
      }
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        "Erro de conexão. Verifique se o servidor está rodando.";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoArea}>
          <Text style={styles.logoEmoji}>🍸</Text>
          <Text style={styles.logoText}>Buzzed</Text>
          <Text style={styles.tagline}>Drink Explorer & Feedback</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {isLogin
              ? "Entrar"
              : isRestaurant
                ? "Cadastrar restaurante"
                : "Criar conta"}
          </Text>
          <Text style={styles.formSubtitle}>
            {isLogin
              ? "Acesse sua conta de cliente ou restaurante"
              : isRestaurant
                ? "Publique seu cardápio e acompanhe avaliações"
                : "Explore drinks e registre suas experiências"}
          </Text>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {isRestaurant ? "Responsável" : "Nome"}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={isRestaurant ? "Nome do responsável" : "Seu nome"}
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {isRestaurant && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Restaurante</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome do restaurante"
                  placeholderTextColor={COLORS.textMuted}
                  value={establishmentName}
                  onChangeText={setEstablishmentName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Endereço</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Rua, número, cidade"
                  placeholderTextColor={COLORS.textMuted}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Telefone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="(11) 99999-9999"
                  placeholderTextColor={COLORS.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Descrição</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Resumo do espaço, proposta e especialidades"
                  placeholderTextColor={COLORS.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin
                  ? "Entrar"
                  : isRestaurant
                    ? "Cadastrar restaurante"
                    : "Criar conta"}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.modeActions}>
            {isLogin ? (
              <>
                <TouchableOpacity onPress={() => switchMode("customer")}>
                  <Text style={styles.switchText}>
                    Não tem conta?{" "}
                    <Text style={styles.switchTextBold}>Cadastre-se</Text>
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => switchMode("restaurant")}>
                  <Text style={styles.switchText}>
                    É restaurante?{" "}
                    <Text style={styles.switchTextBold}>Cadastrar espaço</Text>
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => switchMode("login")}>
                  <Text style={styles.switchText}>
                    Já tem conta?{" "}
                    <Text style={styles.switchTextBold}>Entrar</Text>
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    switchMode(isRestaurant ? "customer" : "restaurant")
                  }
                >
                  <Text style={styles.switchText}>
                    {isRestaurant ? "Sou cliente" : "Sou restaurante"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {isLogin && (
            <View style={styles.hintBox}>
              <Text style={styles.hintTitle}>🔑 Contas de teste</Text>
              <Text style={styles.hintText}>Cliente: maria@buzzed.com / 123456</Text>
              <Text style={styles.hintText}>Restaurante: bar@buzzed.com / 123456</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: SPACING.xl,
  },
  logoArea: {
    alignItems: "center",
    marginBottom: SPACING.xxl,
    marginTop: SPACING.xl,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  logoText: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.black,
    color: COLORS.primary,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    letterSpacing: 1,
  },
  form: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  formSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
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
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
  },
  modeActions: {
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  switchText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
  },
  switchTextBold: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },
  hintBox: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  hintTitle: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    marginBottom: 4,
  },
  hintText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
});
