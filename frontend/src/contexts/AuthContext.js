import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  async function loadStoredData() {
    try {
      const storedToken = await AsyncStorage.getItem("@buzzed:token");
      const storedUser = await AsyncStorage.getItem("@buzzed:user");

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.log("Error loading stored data:", e);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    const response = await api.post("/auth/login", { email, password });
    const { user: userData, token } = response.data;

    await AsyncStorage.setItem("@buzzed:token", token);
    await AsyncStorage.setItem("@buzzed:user", JSON.stringify(userData));

    setUser(userData);
    return userData;
  }

  async function signUp(name, email, password) {
    const response = await api.post("/auth/register", { name, email, password });
    const { user: userData, token } = response.data;

    await AsyncStorage.setItem("@buzzed:token", token);
    await AsyncStorage.setItem("@buzzed:user", JSON.stringify(userData));

    setUser(userData);
    return userData;
  }

  async function signOut() {
    await AsyncStorage.removeItem("@buzzed:token");
    await AsyncStorage.removeItem("@buzzed:user");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
