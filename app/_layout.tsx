import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { colors } from "@/src/constants/theme";
import { DatabaseProvider } from "@/src/db/database-provider";

export const RootLayout = () => (
  <>
    <StatusBar style="dark" />
    <DatabaseProvider><Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}
    /></DatabaseProvider>
  </>
);

export default RootLayout;
