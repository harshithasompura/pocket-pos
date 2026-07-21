import { router, useFocusEffect } from "expo-router";
import { Minus, Plus, Search, Trash2 } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Field } from "@/src/components/ui/field";
import { Screen } from "@/src/components/ui/screen";
import { colors, radius, spacing } from "@/src/constants/theme";
import { useDatabaseReady } from "@/src/db/database-provider";
import { createBusinessRepository } from "@/src/db/repositories/business-repository";
import { createProductRepository } from "@/src/db/repositories/product-repository";
import { createNativeReceiptService } from "@/src/features/receipts/native-receipt-service";
import type { Business, Product } from "@/src/types/domain";
import { formatCurrency } from "@/src/utils/currency";
import { calculateBillTotals } from "./billing-calculations";
import { completeBill } from "./billing-service";
import type { Discount, PaymentMethod } from "./billing-types";
import { useCartStore } from "./cart-store";

const paymentMethods: PaymentMethod[] = ["cash", "upi", "card", "other"];

export const SellScreen = () => {
  const { db } = useDatabaseReady();
  const [products, setProducts] = useState<Product[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [query, setQuery] = useState("");
  const [savingMode, setSavingMode] = useState<"save" | "print" | null>(null);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customQuantity, setCustomQuantity] = useState("1");
  const [discountValue, setDiscountValue] = useState("");
  const cart = useCartStore();
  useFocusEffect(
    useCallback(() => {
      createProductRepository(db)
        .list()
        .then((items) => setProducts(items.filter((item) => item.isActive)));
      createBusinessRepository(db).get().then(setBusiness);
    }, [db]),
  );
  const visible = useMemo(
    () =>
      products.filter((product) =>
        `${product.name} ${product.sku ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [products, query],
  );
  const totals = calculateBillTotals(
    cart.lines,
    cart.discount,
    business?.taxEnabled ?? false,
    business?.defaultTaxPercentage ?? 0,
  );
  const setDiscountType = (type: Discount["type"]) => {
    setDiscountValue("");
    cart.setDiscount({ type: "none" });
    if (type !== "none") cart.setDiscount({ type, value: 0 });
  };
  const updateDiscount = (value: string) => {
    setDiscountValue(value);
    if (cart.discount.type === "fixed")
      cart.setDiscount({ type: "fixed", value: Math.round((Number(value) || 0) * 100) });
    if (cart.discount.type === "percentage")
      cart.setDiscount({ type: "percentage", value: Number(value) || 0 });
  };
  const addCustom = () => {
    const name = customName.trim();
    const unitPricePaise = Math.round(Number(customPrice) * 100);
    const quantity = Number(customQuantity);
    if (
      !name ||
      !Number.isFinite(unitPricePaise) ||
      unitPricePaise <= 0 ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    )
      return Alert.alert("Check custom item", "Enter a name, positive price, and whole quantity.");
    cart.addCustomItem({ name, unitPricePaise, quantity });
    setCustomName("");
    setCustomPrice("");
    setCustomQuantity("1");
  };
  const checkout = async (shouldPrint: boolean) => {
    if (!business || cart.lines.length === 0) return;
    setSavingMode(shouldPrint ? "print" : "save");
    let billId: string;
    try {
      const bill = await completeBill(db, {
        businessId: business.id,
        lines: cart.lines,
        discount: cart.discount,
        taxEnabled: business.taxEnabled,
        taxPercentage: business.defaultTaxPercentage,
        paymentMethod: cart.paymentMethod,
      });
      billId = bill.id;
      cart.clear();
      router.push(`/bill/${bill.id}`);
    } catch (reason) {
      Alert.alert("Bill not saved", reason instanceof Error ? reason.message : "Try again");
      setSavingMode(null);
      return;
    }
    if (shouldPrint) {
      try {
        await createNativeReceiptService(db).printBillReceipt(billId);
      } catch (reason) {
        Alert.alert(
          "Bill saved, printing failed",
          `${reason instanceof Error ? reason.message : "Try again."} Reprint it from bill details.`,
        );
      }
    }
    setSavingMode(null);
  };

  return (
    <Screen scroll style={styles.screen}>
      <View>
        <Text style={styles.title}>New bill</Text>
        <Text style={styles.body}>Tap products to add them to the cart.</Text>
      </View>
      <View style={styles.search}>
        <Search color={colors.muted} size={20} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search products or SKU"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
      </View>
      <View style={styles.catalogue}>
        {visible.map((product) => (
          <Pressable key={product.id} onPress={() => cart.addProduct(product)}>
            <Card style={styles.product}>
              <View style={styles.flex}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.meta}>
                  {product.sku ?? "No SKU"} · {formatCurrency(product.sellingPricePaise)}
                </Text>
              </View>
              <Plus color={colors.text} size={22} />
            </Card>
          </Pressable>
        ))}
      </View>
      <Text style={styles.section}>Current bill · {totals.totalUnits} units</Text>
      {cart.lines.length === 0 ? (
        <Card>
          <Text style={styles.meta}>Your cart is empty.</Text>
        </Card>
      ) : (
        <View style={styles.catalogue}>
          {cart.lines.map((line) => (
            <Card key={line.id} style={styles.cartLine}>
              <View style={styles.flex}>
                <Text style={styles.productName}>{line.name}</Text>
                <Text style={styles.meta}>
                  {formatCurrency(line.unitPricePaise)} each ·{" "}
                  {formatCurrency(line.unitPricePaise * line.quantity)}
                </Text>
              </View>
              <View style={styles.quantity}>
                <Pressable
                  accessibilityLabel={`Decrease ${line.name}`}
                  onPress={() => cart.decrement(line.id)}
                  style={styles.iconButton}
                >
                  <Minus size={18} color={colors.text} />
                </Pressable>
                <Text style={styles.quantityText}>{line.quantity}</Text>
                <Pressable
                  accessibilityLabel={`Increase ${line.name}`}
                  onPress={() => cart.increment(line.id)}
                  style={styles.iconButton}
                >
                  <Plus size={18} color={colors.text} />
                </Pressable>
                <Pressable
                  accessibilityLabel={`Remove ${line.name}`}
                  onPress={() => cart.remove(line.id)}
                  style={styles.iconButton}
                >
                  <Trash2 size={18} color={colors.danger} />
                </Pressable>
              </View>
            </Card>
          ))}
        </View>
      )}
      <Card style={styles.form}>
        <Text style={styles.section}>Custom item</Text>
        <Field label="Item name" value={customName} onChangeText={setCustomName} />
        <View style={styles.row}>
          <Field
            label="Price (₹)"
            value={customPrice}
            onChangeText={setCustomPrice}
            keyboardType="decimal-pad"
            style={styles.flex}
          />
          <Field
            label="Quantity"
            value={customQuantity}
            onChangeText={setCustomQuantity}
            keyboardType="number-pad"
            style={styles.flex}
          />
        </View>
        <Button label="Add custom item" variant="secondary" onPress={addCustom} />
      </Card>
      <Card style={styles.form}>
        <Text style={styles.section}>Discount</Text>
        <View style={styles.pills}>
          {(["none", "fixed", "percentage"] as const).map((type) => (
            <Pressable
              key={type}
              onPress={() => setDiscountType(type)}
              style={[styles.pill, cart.discount.type === type && styles.pillActive]}
            >
              <Text style={[styles.pillText, cart.discount.type === type && styles.pillTextActive]}>
                {type === "none" ? "None" : type === "fixed" ? "Fixed ₹" : "%"}
              </Text>
            </Pressable>
          ))}
        </View>
        {cart.discount.type !== "none" && (
          <Field
            label={cart.discount.type === "fixed" ? "Discount amount (₹)" : "Discount percentage"}
            value={discountValue}
            onChangeText={updateDiscount}
            keyboardType="decimal-pad"
          />
        )}
      </Card>
      <Card style={styles.form}>
        <Text style={styles.section}>Payment</Text>
        <View style={styles.pills}>
          {paymentMethods.map((method) => (
            <Pressable
              key={method}
              onPress={() => cart.setPaymentMethod(method)}
              style={[styles.pill, cart.paymentMethod === method && styles.pillActive]}
            >
              <Text
                style={[styles.pillText, cart.paymentMethod === method && styles.pillTextActive]}
              >
                {method.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>
      <Card style={styles.summary}>
        <View style={styles.totalRow}>
          <Text style={styles.meta}>Subtotal</Text>
          <Text>{formatCurrency(totals.subtotalPaise)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.meta}>Discount</Text>
          <Text>− {formatCurrency(totals.discountPaise)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.meta}>Tax</Text>
          <Text>{formatCurrency(totals.taxPaise)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.total}>{formatCurrency(totals.totalPaise)}</Text>
        </View>
        <Button
          label="Save bill"
          loading={savingMode === "save"}
          disabled={savingMode !== null || cart.lines.length === 0 || !business}
          onPress={() => checkout(false)}
        />
        <Button
          label="Save & print"
          variant="secondary"
          loading={savingMode === "print"}
          disabled={savingMode !== null || cart.lines.length === 0 || !business}
          onPress={() => checkout(true)}
        />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: { gap: spacing.xl },
  title: { color: colors.text, fontSize: 32, fontWeight: "800" },
  body: { color: colors.muted, fontSize: 15, marginTop: spacing.xs },
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
  searchInput: { flex: 1, minHeight: 52, fontSize: 16 },
  catalogue: { gap: spacing.md },
  product: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  productName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  flex: { flex: 1 },
  section: { color: colors.text, fontSize: 20, fontWeight: "800" },
  cartLine: { gap: spacing.md },
  quantity: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  iconButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  quantityText: { fontSize: 17, fontWeight: "800", minWidth: 24, textAlign: "center" },
  form: { gap: spacing.lg },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  pill: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pillActive: { backgroundColor: colors.text, borderColor: colors.text },
  pillText: { color: colors.text, fontWeight: "700" },
  pillTextActive: { color: colors.inverse },
  summary: { gap: spacing.md },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontSize: 18, fontWeight: "800" },
  total: { fontSize: 22, fontWeight: "800" },
});
