import { router, useFocusEffect } from "expo-router";
import { Search } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Card } from "@/src/components/ui/card";
import { EmptyState } from "@/src/components/ui/empty-state";
import { Screen } from "@/src/components/ui/screen";
import { colors, radius, spacing } from "@/src/constants/theme";
import { useDatabaseReady } from "@/src/db/database-provider";
import { createBillRepository } from "@/src/db/repositories/bill-repository";
import type { Bill } from "@/src/types/domain";
import { formatCurrency } from "@/src/utils/currency";
import { formatDateTime } from "@/src/utils/dates";

export const BillsScreen = () => {
  const { db } = useDatabaseReady();
  const [bills, setBills] = useState<Bill[]>([]);
  const [query, setQuery] = useState("");
  useFocusEffect(
    useCallback(() => {
      createBillRepository(db).list().then(setBills);
    }, [db]),
  );
  const visible = useMemo(
    () =>
      bills.filter((bill) => bill.billNumber.toLowerCase().includes(query.trim().toLowerCase())),
    [bills, query],
  );
  return (
    <Screen scroll style={styles.screen}>
      <View>
        <Text style={styles.title}>Bills</Text>
        <Text style={styles.body}>{bills.length} saved offline</Text>
      </View>
      <View style={styles.search}>
        <Search color={colors.muted} size={20} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search bill number"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
      </View>
      {visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title={bills.length ? "No matching bills" : "No bills yet"}
          body={bills.length ? "Try a different bill number." : "Completed bills will appear here."}
        />
      ) : (
        <View style={styles.list}>
          {visible.map((bill) => (
            <Pressable key={bill.id} onPress={() => router.push(`/bill/${bill.id}`)}>
              <Card style={styles.row}>
                <View style={styles.flex}>
                  <View style={styles.labelRow}>
                    <Text style={styles.billNumber}>{bill.billNumber}</Text>
                    {bill.status === "void" && <Text style={styles.voidLabel}>VOID</Text>}
                  </View>
                  <Text style={styles.meta}>
                    {formatDateTime(bill.createdAt)} · {bill.paymentMethod.toUpperCase()}
                  </Text>
                  <Text style={styles.meta}>
                    {bill.totalUnits} units · {bill.status}
                  </Text>
                </View>
                <Text style={styles.total}>{formatCurrency(bill.totalPaise)}</Text>
              </Card>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
};
const styles = StyleSheet.create({
  screen: { gap: spacing.xl },
  title: { color: colors.text, fontSize: 32, fontWeight: "800" },
  body: { color: colors.muted, marginTop: spacing.xs },
  search: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  searchInput: { flex: 1, fontSize: 16, minHeight: 52 },
  list: { gap: spacing.md },
  row: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
  labelRow: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  billNumber: { color: colors.text, fontSize: 17, fontWeight: "800" },
  voidLabel: { color: colors.danger, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  meta: { color: colors.muted, fontSize: 13, marginTop: spacing.xs },
  total: { fontSize: 19, fontWeight: "800" },
});
