import { useLocalSearchParams } from "expo-router";
import { BillDetailScreen } from "@/src/features/billing/bill-detail-screen";
export const BillRoute = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BillDetailScreen id={id} />;
};
export default BillRoute;
