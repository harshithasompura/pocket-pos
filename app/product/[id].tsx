import { useLocalSearchParams } from "expo-router"; import { ProductDetailScreen } from "@/src/features/inventory/product-detail-screen";
export const ProductRoute = () => { const { id } = useLocalSearchParams<{ id: string }>(); return <ProductDetailScreen id={id} />; }; export default ProductRoute;
