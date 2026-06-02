import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Automatically detect the right API URL based on platform
let API_URL;
if (Platform.OS === "web") {
  API_URL = "http://localhost:3333";
} else {
  // Expo Go / dispositivo físico — usa o IP da rede local
  API_URL = "http://192.168.18.10:3333";
}

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
