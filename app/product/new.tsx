import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/src/components/ui/screen";
import { colors, spacing } from "@/src/constants/theme";
import { useDatabaseReady } from "@/src/db/database-provider";
import { createBusinessRepository } from "@/src/db/repositories/business-repository";
import { createProductRepository } from "@/src/db/repositories/product-repository";
import { ProductForm } from "@/src/features/inventory/product-form";
import type { ProductValues } from "@/src/features/inventory/product-schema";
export const NewProductScreen = () => {
  const { db } = useDatabaseReady();
  const save = async (values: ProductValues) => {
    const business = await createBusinessRepository(db).get();
    if (!business) throw new Error("Complete business setup first");
    const product = await createProductRepository(db).create(business.id, values);
    router.replace(`/product/${product.id}`);
  };
  return (
    <Screen scroll style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Add product</Text>
        <Text style={styles.body}>
          Prices are stored precisely in paise. Opening stock creates the first audit entry.
        </Text>
      </View>
      <ProductForm onSubmit={save} />
    </Screen>
  );
};
const styles = StyleSheet.create({
  screen: { gap: spacing.xl },
  header: { gap: spacing.xs },
  title: { color: colors.text, fontSize: 30, fontWeight: "800" },
  body: { color: colors.muted, fontSize: 15, lineHeight: 22 },
});
export default NewProductScreen;
