import { createSlice } from '@reduxjs/toolkit';

const getSavedCartItems = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem('cartItems') || '[]');
  } catch (error) {
    console.error(error);
    return [];
  }
};

const persistCartItems = (cartItems) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }
};

const initialState = {
  cartItems: getSavedCartItems(),
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x.productId === item.productId);
      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.productId === existItem.productId ? { ...item, qty: Math.min(item.qty, item.stock) } : x
        );
      } else {
        state.cartItems.push({ ...item, qty: Math.min(item.qty, item.stock) });
      }
      persistCartItems(state.cartItems);
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x.productId !== action.payload);
      persistCartItems(state.cartItems);
    },
    clearCart: (state) => {
      state.cartItems = [];
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('cartItems');
      }
    }
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
