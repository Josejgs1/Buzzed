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
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha email e senha");
      return;
    }
    if (!isLogin && !name) {
      Alert.alert("Erro", "Preencha seu nome");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(name, email, password);
      }
    } catch (error) {
      const msg =
        error.response?.data?.error || "Erro de conexão. Verifique se o servidor está rodando.";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
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
        {/* Logo area */}
        <View style={styles.logoArea}>
          <Text style={styles.logoEmoji}>🍸</Text>
          <Text style={styles.logoText}>Buzzed</Text>
          <Text style={styles.tagline}>Drink Explorer & Feedback</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
          </Text>
          <Text style={styles.formSubtitle}>
            {isLogin
              ? "Faça login para explorar drinks"
              : "Comece sua jornada de exploração"}
          </Text>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu nome"
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
                {isLogin ? "Entrar" : "Criar conta"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchText}>
              {isLogin
                ? "Não tem conta? "
                : "Já tem conta? "}
              <Text style={styles.switchTextBold}>
                {isLogin ? "Cadastre-se" : "Faça login"}
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Quick login hint */}
          {isLogin && (
            <View style={styles.hintBox}>
              <Text style={styles.hintTitle}>🔑 Conta de teste:</Text>
              <Text style={styles.hintText}>maria@buzzed.com / 123456</Text>
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
    marginBottom: SPACING.xxxl,
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
  switchButton: {
    alignItems: "center",
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
  },
});
