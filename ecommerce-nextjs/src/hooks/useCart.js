import { useSelector } from "react-redux";

export const useCart = () => {
  return useSelector((state) => state.cart);
};