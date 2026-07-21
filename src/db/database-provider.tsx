import type { SQLiteDatabase } from "expo-sqlite";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/ui/button";
import { colors, spacing } from "@/src/constants/theme";
import { openPocketPosDatabase } from "./database";

type DatabaseState = { db: SQLiteDatabase; ready: true };
const DatabaseContext = createContext<DatabaseState | null>(null);

export const DatabaseProvider = ({ children }: PropsWithChildren) => {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    openPocketPosDatabase()
      .then((database) => active && setDb(database))
      .catch(
        (reason: unknown) =>
          active &&
          setError(reason instanceof Error ? reason.message : "Database could not be opened"),
      );
    return () => {
      active = false;
    };
  }, [attempt]);

  const value = useMemo(() => (db ? { db, ready: true as const } : null), [db]);
  if (error)
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Local data could not start</Text>
        <Text style={styles.body}>{error}</Text>
        <Button
          label="Try again"
          onPress={() => {
            setError(null);
            setDb(null);
            setAttempt((value) => value + 1);
          }}
        />
      </View>
    );
  if (!value)
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.text} />
        <Text style={styles.body}>Preparing offline data…</Text>
      </View>
    );
  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
};

export const useDatabaseReady = () => {
  const value = useContext(DatabaseContext);
  if (!value) throw new Error("useDatabaseReady must be used inside DatabaseProvider");
  return value;
};

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: "center",
    padding: spacing.xl,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: "800", textAlign: "center" },
  body: { color: colors.muted, fontSize: 15, textAlign: "center" },
});
