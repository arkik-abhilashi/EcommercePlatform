import { create } from "zustand";
import axios from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  total: 0,
  subtotal: 0,
  coupon: null,
  isCouponApplied: false,
  clearCart: () =>
    set({
      cart: [],
      total: 0,
      subtotal: 0,
      coupon: null,
      isCouponApplied: false,
    }),

  getCartItems: async () => {
    try {
      const res = await axios.get("/cart");
      set({ cart: res.data });
      get().calculateTotals();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch cart items",
      );
    }
  },

  addToCart: async (product) => {
    try {
      await axios.post("/cart", { productId: product._id });

      set((prevState) => {
        const existingItem = prevState.cart.find(
          (item) => item._id === product._id,
        );

        const newCart = existingItem
          ? prevState.cart.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            )
          : [...prevState.cart, { ...product, quantity: 1 }];
        return { cart: newCart };
      });
      get().calculateTotals();
      toast.success("Item added to cart");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add item to cart",
      );
    }
  },

  calculateTotals: () => {
    const { cart, coupon, isCouponApplied } = get();
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    if (coupon && isCouponApplied) {
      const discount = (coupon.discountPercentage / 100) * subtotal;
      const total = subtotal - discount;
      set({ subtotal, total });
    } else {
      set({ subtotal, total: subtotal });
    }
  },

  removeFromCart: async (productId) => {
    try {
      await axios.delete(`/cart`, { data: { productId } });
      set((prevState) => ({
        cart: prevState.cart.filter((item) => item._id !== productId),
      }));
      get().calculateTotals();
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to remove item from cart",
      );
    }
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity < 1) {
      get().removeFromCart(productId);
      return;
    }

    try {
      await axios.put(`/cart/${productId}`, { quantity });
      set((prevState) => ({
        cart: prevState.cart.map((item) =>
          item._id === productId ? { ...item, quantity } : item,
        ),
      }));
      get().calculateTotals();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update item quantity",
      );
    }
  },

  getMyCoupon: async () => {
    try {
      const res = await axios.get("/coupons");
      const coupon = Array.isArray(res.data) ? res.data[0] : res.data;
      set({ coupon: coupon || null, isCouponApplied: false });
      get().calculateTotals();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch coupon");
    }
  },

  applyCoupon: async (code) => {
    try {
      const res = await axios.post("/coupons/validate", { code });
      set({ coupon: res.data, isCouponApplied: true });
      get().calculateTotals();
      toast.success("Coupon applied successfully");
    } catch (error) {
      set({ isCouponApplied: false });
      get().calculateTotals();
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    }
  },

  removeCoupon: () => {
    set({ isCouponApplied: false });
    get().calculateTotals();
    toast.success("Coupon removed");
  },
}));
