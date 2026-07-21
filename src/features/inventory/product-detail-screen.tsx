import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Field } from "@/src/components/ui/field";
import { Screen } from "@/src/components/ui/screen";
import { colors, spacing } from "@/src/constants/theme";
import { useDatabaseReady } from "@/src/db/database-provider";
import { createInventoryRepository } from "@/src/db/repositories/inventory-repository";
import { createProductRepository } from "@/src/db/repositories/product-repository";
import type { InventoryMovement, Product } from "@/src/types/domain";
import { formatCurrency } from "@/src/utils/currency";
import { formatDateTime } from "@/src/utils/dates";

export const ProductDetailScreen = ({ id }: { id: string }) => {
  const { db } = useDatabaseReady();
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [change, setChange] = useState("");
  const [note, setNote] = useState("");
  const load = useCallback(async () => {
    setProduct(await createProductRepository(db).get(id));
    setMovements(await createInventoryRepository(db).listForProduct(id));
  }, [db, id]);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );
  if (!product)
    return (
      <Screen>
        <Text>Loading product…</Text>
      </Screen>
    );
  const adjust = async () => {
    const quantityChange = Number(change);
    if (!Number.isInteger(quantityChange) || quantityChange === 0)
      return Alert.alert("Enter a whole non-zero quantity");
    await createProductRepository(db).adjustStock(id, {
      movementType: quantityChange > 0 ? "stock_added" : "manual_correction",
      quantityChange,
      note,
    });
    setChange("");
    setNote("");
    await load();
  };
  const toggle = () =>
    Alert.alert(
      product.isActive ? "Disable product?" : "Enable product?",
      "Completed bills and movement history are preserved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: product.isActive ? "Disable" : "Enable",
          style: product.isActive ? "destructive" : "default",
          onPress: async () => {
            await createProductRepository(db).setActive(id, !product.isActive);
            await load();
          },
        },
      ],
    );
  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.heading}>
        <View>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.meta}>
            {product.sku || "No SKU"} · {product.isActive ? "Active" : "Inactive"}
          </Text>
        </View>
        <Button
          label="Edit"
          variant="secondary"
          onPress={() => router.push(`/product/${id}/edit`)}
        />
      </View>
      <Card style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.kicker}>SELLING PRICE</Text>
          <Text style={styles.value}>{formatCurrency(product.sellingPricePaise)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.kicker}>CURRENT STOCK</Text>
          <Text style={styles.value}>
            {product.trackInventory ? product.stockQuantity : "Not tracked"}
          </Text>
        </View>
      </Card>
      {product.trackInventory && (
        <Card style={styles.form}>
          <Text style={styles.section}>Adjust stock</Text>
          <Field
            label="Quantity change"
            value={change}
            onChangeText={setChange}
            keyboardType="numbers-and-punctuation"
            hint="Use + for stock added and − for stock removed."
          />
          <Field label="Note (optional)" value={note} onChangeText={setNote} />
          <Button label="Save adjustment" onPress={adjust} />
        </Card>
      )}
      <View style={styles.history}>
        <Text style={styles.section}>Movement history</Text>
        {movements.length === 0 ? (
          <Text style={styles.meta}>No stock movements yet.</Text>
        ) : (
          <View style={styles.movementList}>
            {movements.map((movement) => (
              <Card key={movement.id}>
                <View style={styles.movement}>
                  <View style={styles.flex}>
                    <Text style={styles.movementTitle}>
                      {movement.movementType.replaceAll("_", " ")}
                    </Text>
                    <Text style={styles.meta}>
                      {formatDateTime(movement.createdAt)}
                      {movement.note ? ` · ${movement.note}` : ""}
                    </Text>
                  </View>
                  <Text style={styles.change}>
                    {movement.quantityChange > 0 ? "+" : ""}
                    {movement.quantityChange}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>
      <Pressable onPress={toggle}>
        <Text style={styles.danger}>{product.isActive ? "Disable product" : "Enable product"}</Text>
      </Pressable>
    </Screen>
  );
};
const styles = StyleSheet.create({
  screen: { gap: spacing.xl },
  heading: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  title: { color: colors.text, fontSize: 30, fontWeight: "800" },
  meta: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: spacing.xs },
  stats: { gap: spacing.lg },
  stat: { gap: spacing.xs },
  kicker: { color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  value: { color: colors.text, fontSize: 26, fontWeight: "800" },
  form: { gap: spacing.lg },
  history: { gap: spacing.md },
  section: { color: colors.text, fontSize: 20, fontWeight: "800" },
  movementList: { gap: spacing.md },
  movement: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
  movementTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  change: { color: colors.text, fontSize: 18, fontWeight: "800" },
  danger: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: "700",
    paddingVertical: spacing.lg,
    textAlign: "center",
  },
});
