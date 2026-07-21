import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Screen } from "@/src/components/ui/screen";
import { colors, radius, spacing } from "@/src/constants/theme";
import { useDatabaseReady } from "@/src/db/database-provider";
import { formatCurrency } from "@/src/utils/currency";
import { createAnalyticsRepository } from "./analytics-repository";
import type { DashboardAnalytics, DashboardRange } from "./analytics-types";
import { getDashboardRange } from "./dashboard-range";
const ranges: [DashboardRange, string][] = [
  ["today", "Today"],
  ["7d", "7 days"],
  ["30d", "30 days"],
];
export const DashboardScreen = () => {
  const { db } = useDatabaseReady();
  const [range, setRange] = useState<DashboardRange>("today"),
    [data, setData] = useState<DashboardAnalytics | null>(null),
    [error, setError] = useState("");
  const load = useCallback(() => {
    setError("");
    createAnalyticsRepository(db)
      .getDashboardAnalytics(getDashboardRange(range))
      .then(setData)
      .catch(() => setError("Dashboard could not be loaded."));
  }, [db, range]);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );
  if (error)
    return (
      <Screen style={styles.screen}>
        <Text>{error}</Text>
        <Button label="Retry" onPress={load} />
      </Screen>
    );
  if (!data)
    return (
      <Screen>
        <Text>Loading dashboard…</Text>
      </Screen>
    );
  const metrics = [
    ["Sales", formatCurrency(data.totalSalesPaise)],
    ["Bills", String(data.billCount)],
    ["Units", String(data.totalUnits)],
    ["Average", formatCurrency(data.averageBillPaise)],
    ["Low stock", String(data.lowStockCount)],
  ];
  const max = Math.max(1, ...data.salesByDay.map((x) => x.salesPaise));
  return (
    <Screen scroll style={styles.screen}>
      <View>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.meta}>Offline business overview</Text>
      </View>
      <View style={styles.pills}>
        {ranges.map(([r, l]) => (
          <Pressable
            key={r}
            onPress={() => setRange(r)}
            style={[styles.pill, range === r && styles.active]}
          >
            <Text style={[styles.pillText, range === r && styles.activeText]}>{l}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.grid}>
        {metrics.map(([l, v]) => (
          <Card key={l} style={styles.metric}>
            <Text style={styles.meta}>{l}</Text>
            <Text style={styles.value}>{v}</Text>
          </Card>
        ))}
      </View>
      <Text style={styles.section}>Sales trend</Text>
      <Card style={styles.list}>
        {data.salesByDay.map((x) => (
          <View key={x.date}>
            <View style={styles.row}>
              <Text>{x.date}</Text>
              <Text>{formatCurrency(x.salesPaise)}</Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${x.salesPaise ? Math.max(6, Math.round((x.salesPaise / max) * 100)) : 0}%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </Card>
      <Text style={styles.section}>Payments</Text>
      <Card style={styles.list}>
        {data.payments.map((x) => (
          <View style={styles.row} key={x.method}>
            <Text>{x.method.toUpperCase()}</Text>
            <Text>{formatCurrency(x.salesPaise)}</Text>
          </View>
        ))}
      </Card>
      <Text style={styles.section}>Top products</Text>
      <Card style={styles.list}>
        {data.topProducts.length ? (
          data.topProducts.map((x) => (
            <View style={styles.row} key={x.key}>
              <View>
                <Text style={styles.strong}>{x.name}</Text>
                <Text style={styles.meta}>{x.units} units</Text>
              </View>
              <Text>{formatCurrency(x.revenuePaise)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.meta}>No sales yet.</Text>
        )}
      </Card>
      <Text style={styles.section}>Recent bills</Text>
      <Card style={styles.list}>
        {data.recentBills.length ? (
          data.recentBills.map((x) => (
            <Pressable key={x.id} onPress={() => router.push(`/bill/${x.id}`)} style={styles.row}>
              <Text style={styles.strong}>{x.billNumber}</Text>
              <Text>{formatCurrency(x.totalPaise)}</Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.meta}>No bills in this range.</Text>
        )}
      </Card>
      <Text style={styles.section}>Low stock</Text>
      <Card style={styles.list}>
        {data.lowStockProducts.length ? (
          data.lowStockProducts.map((x) => (
            <Pressable
              key={x.id}
              onPress={() => router.push(`/product/${x.id}`)}
              style={styles.row}
            >
              <Text style={styles.strong}>{x.name}</Text>
              <Text>{x.stockQuantity} left</Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.meta}>Stock levels look good.</Text>
        )}
      </Card>
    </Screen>
  );
};
const styles = StyleSheet.create({
  screen: { gap: spacing.xl },
  title: { fontSize: 32, fontWeight: "800" },
  meta: { color: colors.muted, fontSize: 13 },
  pills: { flexDirection: "row", gap: spacing.sm },
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  active: { backgroundColor: colors.text },
  pillText: { fontWeight: "700" },
  activeText: { color: colors.inverse },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  metric: { flexBasis: "47%", flexGrow: 1 },
  value: { fontSize: 22, fontWeight: "800", marginTop: spacing.xs },
  section: { fontSize: 20, fontWeight: "800" },
  list: { gap: spacing.md },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  strong: { fontWeight: "700" },
  track: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
  },
  bar: { height: 8, backgroundColor: colors.text, borderRadius: radius.sm },
});
