import { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { Button } from "@/src/components/ui/button";
import { Field } from "@/src/components/ui/field";
import { colors, spacing } from "@/src/constants/theme";
import type { Product } from "@/src/types/domain";
import { productSchema, type ProductValues } from "./product-schema";

type ProductFormProps = { product?: Product; onSubmit: (values: ProductValues) => Promise<void> };

export const ProductForm = ({ product, onSubmit }: ProductFormProps) => {
  const [name, setName] = useState(product?.name ?? ""); const [sku, setSku] = useState(product?.sku ?? "");
  const [category, setCategory] = useState(product?.category ?? ""); const [price, setPrice] = useState(product ? String(product.sellingPricePaise / 100) : "");
  const [stock, setStock] = useState(String(product?.stockQuantity ?? 0)); const [threshold, setThreshold] = useState(String(product?.lowStockThreshold ?? 0));
  const [tracked, setTracked] = useState(product?.trackInventory ?? true); const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  const submit = async () => {
    const parsed = productSchema.safeParse({ name, sku, category, sellingPricePaise: Math.round(Number(price) * 100), stockQuantity: Number(stock), lowStockThreshold: Number(threshold), trackInventory: tracked, isActive: product?.isActive ?? true });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check the product details"); return; }
    setSaving(true); setError(null); try { await onSubmit(parsed.data); } catch (reason) { setError(reason instanceof Error ? reason.message : "Product could not be saved"); } finally { setSaving(false); }
  };
  return <View style={styles.form}>
    <Field label="Product name" value={name} onChangeText={setName} placeholder="Masala tea" />
    <View style={styles.row}><Field label="SKU (optional)" value={sku} onChangeText={setSku} style={styles.flex} autoCapitalize="characters" /><Field label="Category (optional)" value={category} onChangeText={setCategory} style={styles.flex} /></View>
    <View style={styles.row}><Field label="Selling price (₹)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" style={styles.flex} />{!product && <Field label="Opening stock" value={stock} onChangeText={setStock} keyboardType="number-pad" style={styles.flex} />}</View>
    <Field label="Low-stock threshold" value={threshold} onChangeText={setThreshold} keyboardType="number-pad" />
    <View style={styles.toggle}><View style={styles.flex}><Text style={styles.label}>Track inventory</Text><Text style={styles.hint}>Stock changes will always create an audit entry.</Text></View><Switch value={tracked} onValueChange={setTracked} trackColor={{ false: colors.border, true: colors.text }} /></View>
    {!!error && <Text style={styles.error}>{error}</Text>}<Button label={product ? "Save product" : "Add product"} loading={saving} onPress={submit} />
  </View>;
};

const styles = StyleSheet.create({ form: { gap: spacing.lg }, row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md }, flex: { flex: 1, minWidth: 150 }, toggle: { alignItems: "center", flexDirection: "row", gap: spacing.md }, label: { color: colors.text, fontSize: 15, fontWeight: "700" }, hint: { color: colors.muted, fontSize: 13, marginTop: spacing.xs }, error: { color: colors.danger, fontSize: 14 } });
