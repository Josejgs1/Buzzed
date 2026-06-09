import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const LOCAL_API_URL = "http://localhost:3333";
const MOBILE_API_URL = "http://192.168.18.10:3333";
const PRODUCTION_API_URL = "https://buzzed-5umx.onrender.com";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "web"
    ? __DEV__
      ? LOCAL_API_URL
      : PRODUCTION_API_URL
    : MOBILE_API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Intercept requests to add auth token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("@buzzed:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
