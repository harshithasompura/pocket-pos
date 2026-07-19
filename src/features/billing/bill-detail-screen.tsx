import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Screen } from "@/src/components/ui/screen";
import { colors, spacing } from "@/src/constants/theme";
import { useDatabaseReady } from "@/src/db/database-provider";
import { createBillRepository } from "@/src/db/repositories/bill-repository";
import { createNativeReceiptService } from "@/src/features/receipts/native-receipt-service";
import type { Bill, BillItem } from "@/src/types/domain";
import { formatCurrency } from "@/src/utils/currency";
import { formatDateTime } from "@/src/utils/dates";

const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Please try again.";

export const BillDetailScreen = ({ id }: { id: string }) => {
  const { db } = useDatabaseReady();
  const [bill, setBill] = useState<Bill | null>(null);
  const [items, setItems] = useState<BillItem[]>([]);
  const [printing, setPrinting] = useState(false);
  const [sharing, setSharing] = useState(false);

  const load = useCallback(async () => {
    const repository = createBillRepository(db);
    const [nextBill, nextItems] = await Promise.all([repository.get(id), repository.listItems(id)]);
    setBill(nextBill);
    setItems(nextItems);
  }, [db, id]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const print = async () => {
    setPrinting(true);
    try {
      await createNativeReceiptService(db).printBillReceipt(id);
      await load();
    } catch (error) {
      await load();
      Alert.alert("Printing failed", `${errorMessage(error)} Your bill remains saved and can be retried here.`);
    } finally {
      setPrinting(false);
    }
  };

  const share = async () => {
    setSharing(true);
    try {
      await createNativeReceiptService(db).shareBillPdf(id);
      await load();
    } catch (error) {
      await load();
      Alert.alert("PDF not shared", `${errorMessage(error)} Your bill remains saved.`);
    } finally {
      setSharing(false);
    }
  };

  if (!bill) return <Screen><Text style={styles.meta}>Loading bill…</Text></Screen>;

  const outputStatus = [
    bill.printStatus === "printed" ? "PRINTED" : bill.printStatus === "failed" ? "PRINT FAILED" : "NOT PRINTED",
    bill.pdfUri ? "PDF READY" : null,
  ].filter(Boolean).join(" · ");

  return (
    <Screen scroll style={styles.screen}>
      <View>
        <Text style={styles.title}>{bill.billNumber}</Text>
        <Text style={styles.meta}>{formatDateTime(bill.createdAt)} · {bill.paymentMethod.toUpperCase()}</Text>
      </View>
      <Card style={styles.items}>
        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.flex}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.meta}>{item.quantity} × {formatCurrency(item.unitPricePaise)}{item.sku ? ` · ${item.sku}` : ""}</Text>
            </View>
            <Text style={styles.itemTotal}>{formatCurrency(item.lineTotalPaise)}</Text>
          </View>
        ))}
      </Card>
      <Card style={styles.summary}>
        <View style={styles.totalRow}><Text style={styles.meta}>Subtotal</Text><Text>{formatCurrency(bill.subtotalPaise)}</Text></View>
        <View style={styles.totalRow}><Text style={styles.meta}>Discount</Text><Text>− {formatCurrency(bill.discountPaise)}</Text></View>
        <View style={styles.totalRow}><Text style={styles.meta}>Tax</Text><Text>{formatCurrency(bill.taxPaise)}</Text></View>
        <View style={styles.totalRow}><Text style={styles.totalLabel}>Grand total</Text><Text style={styles.total}>{formatCurrency(bill.totalPaise)}</Text></View>
        <Text style={styles.status}>SAVED OFFLINE · {bill.status.toUpperCase()}</Text>
        <Text style={styles.outputStatus}>{outputStatus}</Text>
        <Button label="Print receipt" loading={printing} disabled={sharing} onPress={print} />
        <Button label={bill.pdfUri ? "Share PDF" : "Create & share PDF"} variant="secondary" loading={sharing} disabled={printing} onPress={share} />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: { gap: spacing.lg },
  title: { color: colors.text, fontSize: 32, fontWeight: "800" },
  meta: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: spacing.xs },
  items: { gap: spacing.lg },
  item: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: "700" },
  itemTotal: { fontSize: 16, fontWeight: "800" },
  summary: { gap: spacing.md },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontSize: 18, fontWeight: "800" },
  total: { fontSize: 22, fontWeight: "800" },
  status: { borderTopColor: colors.border, borderTopWidth: 1, color: colors.muted, fontSize: 12, fontWeight: "700", letterSpacing: 1, paddingTop: spacing.md },
  outputStatus: { color: colors.text, fontSize: 12, fontWeight: "800", letterSpacing: 1 },
});
