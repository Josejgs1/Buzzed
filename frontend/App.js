import React from "react";
import { StatusBar, ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { COLORS, FONTS } from "./src/theme";

// Screens
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import DrinkDetailScreen from "./src/screens/DrinkDetailScreen";
import EstablishmentsScreen from "./src/screens/EstablishmentsScreen";
import EstablishmentDetailScreen from "./src/screens/EstablishmentDetailScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="DrinkDetail" component={DrinkDetailScreen} />
      <Stack.Screen
        name="EstablishmentDetail"
        component={EstablishmentDetailScreen}
      />
    </Stack.Navigator>
  );
}

function EstablishmentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="EstablishmentsMain"
        component={EstablishmentsScreen}
      />
      <Stack.Screen
        name="EstablishmentDetail"
        component={EstablishmentDetailScreen}
      />
      <Stack.Screen name="DrinkDetail" component={DrinkDetailScreen} />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HistoryMain" component={HistoryScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: FONTS.sizes.xs,
          fontWeight: FONTS.weights.medium,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "HomeTab") {
            iconName = focused ? "beer" : "beer-outline";
          } else if (route.name === "EstablishmentsTab") {
            iconName = focused ? "location" : "location-outline";
          } else if (route.name === "HistoryTab") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "ProfileTab") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ tabBarLabel: "Explorar" }}
      />
      <Tab.Screen
        name="EstablishmentsTab"
        component={EstablishmentStack}
        options={{ tabBarLabel: "Locais" }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStack}
        options={{ tabBarLabel: "Histórico" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ tabBarLabel: "Perfil" }}
      />
    </Tab.Navigator>
  );
}

function Routes() {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {signed ? <AppTabs /> : <LoginScreen />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <Routes />
    </AuthProvider>
  );
}
