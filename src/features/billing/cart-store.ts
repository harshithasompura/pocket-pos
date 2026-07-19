import { create } from "zustand/react";
import { createId } from "@/src/utils/id";
import { createCartState, type CartState } from "./cart-store-core";

export const useCartStore = create<CartState>(createCartState(createId));
