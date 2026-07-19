import { Tabs } from "expo-router";
import { Boxes, ChartNoAxesColumn, FileText, Settings, ShoppingBasket } from "lucide-react-native";
import { colors } from "@/src/constants/theme";

export const TabLayout = () => <Tabs screenOptions={{ tabBarActiveTintColor: colors.text, tabBarInactiveTintColor: colors.muted, headerShown: false, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 66, paddingBottom: 8, paddingTop: 6 } }}>
  <Tabs.Screen name="index" options={{ title: "Sell", tabBarIcon: ({ color, size }) => <ShoppingBasket color={color} size={size} /> }} />
  <Tabs.Screen name="bills" options={{ title: "Bills", tabBarIcon: ({ color, size }) => <FileText color={color} size={size} /> }} />
  <Tabs.Screen name="inventory" options={{ title: "Inventory", tabBarIcon: ({ color, size }) => <Boxes color={color} size={size} /> }} />
  <Tabs.Screen name="dashboard" options={{ title: "Dashboard", tabBarIcon: ({ color, size }) => <ChartNoAxesColumn color={color} size={size} /> }} />
  <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />
</Tabs>;
export default TabLayout;
