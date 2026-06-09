import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionVersion, setSessionVersion] = useState(0);

  useEffect(() => {
    loadStoredData();
  }, []);

  async function loadStoredData() {
    try {
      const storedToken = await AsyncStorage.getItem("@buzzed:token");
      const storedUser = await AsyncStorage.getItem("@buzzed:user");

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser({ role: "CUSTOMER", ...parsedUser });
      }
    } catch (e) {
      console.log("Error loading stored data:", e);
    } finally {
      setLoading(false);
    }
  }

  async function persistSession(userData, token) {
    const normalizedUser = { role: "CUSTOMER", ...userData };

    await AsyncStorage.setItem("@buzzed:token", token);
    await AsyncStorage.setItem("@buzzed:user", JSON.stringify(normalizedUser));

    setUser(normalizedUser);
    setSessionVersion((current) => current + 1);
    return normalizedUser;
  }

  async function signIn(email, password) {
    const response = await api.post("/auth/login", { email, password });
    const { user: userData, token } = response.data;

    return persistSession(userData, token);
  }

  async function signUp(name, email, password) {
    const response = await api.post("/auth/register", { name, email, password });
    const { user: userData, token } = response.data;

    return persistSession(userData, token);
  }

  async function signUpRestaurant(data) {
    const response = await api.post("/restaurant/register", data);
    const { user: userData, token } = response.data;

    return persistSession(userData, token);
  }

  async function signOut() {
    setUser(null);
    setSessionVersion((current) => current + 1);

    await AsyncStorage.multiRemove(["@buzzed:token", "@buzzed:user"]);
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        sessionVersion,
        signIn,
        signUp,
        signUpRestaurant,
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
