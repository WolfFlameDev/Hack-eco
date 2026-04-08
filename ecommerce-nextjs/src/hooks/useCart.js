import { useSelector, useDispatch } from "react-redux";
import { useMemo } from "react";
import { clearCart } from "@/redux/slices/cartSlice";

export const useCart = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);

  // Calculate totals using useMemo for performance
  const cartTotals = useMemo(() => {
    const totalPrice = items.reduce((total, item) => total + (item?.price || 0) * (item?.quantity || 0), 0);
    const itemCount = items.reduce((count, item) => count + (item?.quantity || 0), 0);
    const uniqueItems = items.length;

    return {
      totalPrice,
      itemCount,
      uniqueItems,
      shippingCost: totalPrice > 1000 ? 0 : 50,
      finalTotal: totalPrice + (totalPrice > 1000 ? 0 : 50),
    };
  }, [items]);

  return {
    cartItems: items,
    items,
    cartCount: cartTotals.itemCount,
    totalPrice: cartTotals.totalPrice,
    shippingCost: cartTotals.shippingCost,
    finalTotal: cartTotals.finalTotal,
    uniqueItems: cartTotals.uniqueItems,
    isEmpty: items.length === 0,
    clearCartItems: () => dispatch(clearCart()),
  };
};