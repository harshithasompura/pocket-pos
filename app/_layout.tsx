import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { colors } from "@/src/constants/theme";
import { DatabaseProvider } from "@/src/db/database-provider";

export const RootLayout = () => (
  <>
    <StatusBar style="dark" />
    <DatabaseProvider>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="setup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/new" options={{ title: "Add product" }} />
        <Stack.Screen name="product/[id]" options={{ title: "Product details" }} />
        <Stack.Screen name="product/[id]/edit" options={{ title: "Edit product" }} />
        <Stack.Screen name="bill/[id]" options={{ title: "Bill details" }} />
      </Stack>
    </DatabaseProvider>
  </>
);

export default RootLayout;
