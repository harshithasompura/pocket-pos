import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { Button } from "@/src/components/ui/button";
import { Field } from "@/src/components/ui/field";
import { colors, radius, spacing } from "@/src/constants/theme";
import { businessSchema, type BusinessInput, type BusinessValues } from "./business-schema";

type BusinessFormProps = {
  initial?: Partial<BusinessValues>;
  submitLabel: string;
  onSubmit: (values: BusinessValues) => Promise<void>;
};

const defaults: BusinessValues = {
  name: "",
  address: "",
  phone: "",
  gstNumber: "",
  currency: "INR",
  receiptWidth: 58,
  receiptFooter: "Thank you for your business",
  taxEnabled: false,
  defaultTaxPercentage: 0,
  inventoryTrackingEnabled: true,
};

export const BusinessForm = ({ initial, submitLabel, onSubmit }: BusinessFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessInput, unknown, BusinessValues>({
    defaultValues: { ...defaults, ...initial },
    resolver: zodResolver(businessSchema),
  });
  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <Field
            label="Business name"
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            error={errors.name?.message}
            placeholder="Som Stores"
          />
        )}
      />
      <Controller
        control={control}
        name="address"
        render={({ field }) => (
          <Field
            label="Address"
            value={field.value}
            onChangeText={field.onChange}
            multiline
            placeholder="Shop address"
          />
        )}
      />
      <View style={styles.row}>
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <Field
              label="Phone"
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="phone-pad"
              style={styles.flex}
            />
          )}
        />
        <Controller
          control={control}
          name="gstNumber"
          render={({ field }) => (
            <Field
              label="GST number (optional)"
              value={field.value}
              onChangeText={field.onChange}
              autoCapitalize="characters"
              style={styles.flex}
            />
          )}
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Receipt width</Text>
        <Controller
          control={control}
          name="receiptWidth"
          render={({ field }) => (
            <View style={styles.segmented}>
              {([58, 80] as const).map((width) => (
                <Pressable
                  key={width}
                  onPress={() => field.onChange(width)}
                  style={[styles.segment, field.value === width && styles.segmentActive]}
                >
                  <Text
                    style={[styles.segmentText, field.value === width && styles.segmentTextActive]}
                  >
                    {width} mm
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        />
      </View>
      <Controller
        control={control}
        name="receiptFooter"
        render={({ field }) => (
          <Field label="Receipt footer" value={field.value} onChangeText={field.onChange} />
        )}
      />
      <Controller
        control={control}
        name="inventoryTrackingEnabled"
        render={({ field }) => (
          <View style={styles.toggle}>
            <View style={styles.flex}>
              <Text style={styles.label}>Track inventory</Text>
              <Text style={styles.hint}>Create movement logs for every stock change.</Text>
            </View>
            <Switch
              value={field.value}
              onValueChange={field.onChange}
              trackColor={{ false: colors.border, true: colors.text }}
            />
          </View>
        )}
      />
      <Controller
        control={control}
        name="taxEnabled"
        render={({ field }) => (
          <View style={styles.toggle}>
            <View style={styles.flex}>
              <Text style={styles.label}>Enable tax</Text>
              <Text style={styles.hint}>Add a default tax percentage to future bills.</Text>
            </View>
            <Switch
              value={field.value}
              onValueChange={field.onChange}
              trackColor={{ false: colors.border, true: colors.text }}
            />
          </View>
        )}
      />
      <Controller
        control={control}
        name="defaultTaxPercentage"
        render={({ field }) => (
          <Field
            label="Default tax %"
            value={String(field.value)}
            onChangeText={(value) => field.onChange(Number(value) || 0)}
            keyboardType="decimal-pad"
            error={errors.defaultTaxPercentage?.message}
          />
        )}
      />
      <Button label={submitLabel} loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
    </View>
  );
};

const styles = StyleSheet.create({
  form: { gap: spacing.xl },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.lg },
  flex: { flex: 1, minWidth: 180 },
  fieldGroup: { gap: spacing.sm },
  label: { color: colors.text, fontSize: 14, fontWeight: "700" },
  hint: { color: colors.muted, fontSize: 13, marginTop: spacing.xs },
  segmented: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    padding: spacing.xs,
  },
  segment: {
    alignItems: "center",
    borderRadius: radius.sm,
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
  },
  segmentActive: { backgroundColor: colors.text },
  segmentText: { color: colors.text, fontWeight: "700" },
  segmentTextActive: { color: colors.inverse },
  toggle: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.lg,
    padding: spacing.lg,
  },
});
