"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useReducer,
  useCallback,
} from "react";
import { useUser } from "./UserContext";
import { CartItem } from "@/types/cart";

interface CartState {
  cart: CartItem[];
}

// Define actions
type CartAction =
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "REMOVE_FROM_CART"; payload: { productUuid: string } }
  | { type: "CLEAR_CART" }
  | {
      type: "UPDATE_CART_QUANTITY";
      payload: CartItem;
    };

export type CartContextType = {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
};

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Define reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "LOAD_CART": {
      return { ...state, cart: action.payload };
    }
    case "ADD_TO_CART": {
      const existingItem = state.cart.find(
        (item) => item.productUuid === action.payload.productUuid
      );
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.productUuid === action.payload.productUuid
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }

      return { ...state, cart: [...state.cart, action.payload] };
    }
    case "REMOVE_FROM_CART": {
      const updateCart = state.cart.filter(
        (item) => item.productUuid !== action.payload.productUuid
      );
      return { ...state, cart: updateCart };
    }
    case "CLEAR_CART": {
      return { ...state, cart: [] };
    }
    case "UPDATE_CART_QUANTITY": {
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.productUuid === action.payload.productUuid
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }
    default:
      return state;
  }
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { cart: [] });
  const [isCartInitialized, setCartInitialized] = useState(false);
  const { user, loadingUser } = useUser();

  // Load cart from local storage
  const loadLocalCart = () => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        return JSON.parse(storedCart);
      } catch (error) {
        console.error("Failed to parse stored cart:", error);
      }
    }
    return [];
  };

  // Merge local cart with API cart
  const mergeLocalAndApiCart = (localCart: CartItem[], apiCart: CartItem[]) => {
    const mergedCart = [...apiCart];
    localCart.forEach((localItem) => {
      const existingItem = mergedCart.find(
        (item) => item.productUuid === localItem.productUuid
      );
      existingItem
        ? (existingItem.quantity += localItem.quantity)
        : mergedCart.push(localItem);
    });

    return mergedCart;
  };

  // Load cart + set state
  const loadCart = useCallback(async () => {
    const localCart = loadLocalCart();

    if (user) {
      // If user is logged in, get cart items from API
      try {
        const response = await fetch(`/api/carts`);
        const data = await response.json();
        const apiCart = data?.items || [];

        const mergedCart = mergeLocalAndApiCart(localCart, apiCart);

        dispatch({ type: "LOAD_CART", payload: mergedCart });

        if (localCart.length > 0) {
          updateCart();
        }
      } catch (error) {
        // Fallback to local storage on error
        console.error("Failed to fetch cart from API:", error);
        dispatch({ type: "LOAD_CART", payload: localCart });
      }
    } else {
      // If user is not logged in, load cart items from local storage
      dispatch({ type: "LOAD_CART", payload: localCart });
    }
    setCartInitialized(true);
  }, [user]);

  // Update cart in API
  const updateCart = async () => {
    try {
      await fetch("/api/carts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: state.cart }),
      });
    } catch (error) {
      console.error("Error updating cart in API:", error);
    }
  };

  useEffect(() => {
    if (!loadingUser) {
      loadCart();
    }
  }, [loadCart, loadingUser]);

  useEffect(() => {
    if (isCartInitialized) {
      // Đảm bảo khi cart đã hoàn tất tải
      // Sync data to local storage
      localStorage.setItem("cart", JSON.stringify(state.cart));

      if (user) {
        // If user is logged in, save cart items to API
        updateCart();
      }
    }
  }, [state.cart, user]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);
