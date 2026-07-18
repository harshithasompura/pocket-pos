import type { LucideIcon } from "lucide-react-native";

import { EmptyState } from "@/src/components/ui/empty-state";
import { Screen } from "@/src/components/ui/screen";

type FoundationScreenProps = { icon: LucideIcon; title: string; body: string };
export const FoundationScreen = (props: FoundationScreenProps) => <Screen><EmptyState {...props} /></Screen>;
