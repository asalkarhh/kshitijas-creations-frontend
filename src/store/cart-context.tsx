import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type { CartItem, Product } from '../types';
import { trackEvent } from '../utils/analytics';

export const CART_STORAGE_KEY = 'kshitijas-creations-cart';
export const MAX_ITEM_QUANTITY = 20;

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'add'; item: CartItem }
  | { type: 'remove'; productId: string }
  | { type: 'update_quantity'; productId: string; quantity: number }
  | { type: 'increase'; productId: string }
  | { type: 'decrease'; productId: string }
  | { type: 'clear' };

export const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'add': {
      const existing = state.items.find((item) => item.productId === action.item.productId);
      const addedQuantity = action.item.quantity || 1;
      if (!existing) return { items: [...state.items, action.item] };
      return {
        items: state.items.map((item) =>
          item.productId === action.item.productId
            ? { ...item, quantity: Math.min(item.quantity + addedQuantity, MAX_ITEM_QUANTITY) }
            : item,
        ),
      };
    }
    case 'remove':
      return { items: state.items.filter((item) => item.productId !== action.productId) };
    case 'update_quantity': {
      const newQty = Math.min(Math.max(1, action.quantity), MAX_ITEM_QUANTITY);
      return {
        items: state.items.map((item) =>
          item.productId === action.productId ? { ...item, quantity: newQty } : item,
        ),
      };
    }
    case 'increase':
      return {
        items: state.items.map((item) =>
          item.productId === action.productId
            ? { ...item, quantity: Math.min(item.quantity + 1, MAX_ITEM_QUANTITY) }
            : item,
        ),
      };
    case 'decrease':
      return {
        items: state.items
          .map((item) =>
            item.productId === action.productId ? { ...item, quantity: item.quantity - 1 } : item,
          )
          .filter((item) => item.quantity > 0),
      };
    case 'clear':
      return { items: [] };
  }
};

const loadCart = (): CartState => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return { items: [] };
    const parsed: unknown = JSON.parse(stored);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('items' in parsed) ||
      !Array.isArray(parsed.items)
    ) {
      return { items: [] };
    }
    return {
      items: parsed.items
        .filter(
          (item): item is Record<string, unknown> =>
            typeof item === 'object' &&
            item !== null &&
            typeof item.productId === 'string' &&
            typeof item.slug === 'string' &&
            typeof item.name === 'string' &&
            typeof item.price === 'number' &&
            !isNaN(item.price) &&
            typeof item.quantity === 'number' &&
            !isNaN(item.quantity) &&
            item.quantity > 0,
        )
        .map((item) => ({
          productId: String(item.productId),
          slug: String(item.slug),
          name: String(item.name),
          productCode: typeof item.productCode === 'string' ? item.productCode : undefined,
          price: Number(item.price),
          primaryImageUrl: typeof item.primaryImageUrl === 'string' ? item.primaryImageUrl : typeof item.image === 'string' ? item.image : '',
          image: typeof item.image === 'string' ? item.image : typeof item.primaryImageUrl === 'string' ? item.primaryImageUrl : '',
          imageAlt: typeof item.imageAlt === 'string' ? item.imageAlt : String(item.name),
          quantity: Math.min(Math.max(1, Math.floor(Number(item.quantity))), MAX_ITEM_QUANTITY),
          available: item.available !== false,
        })),
    };
  } catch {
    return { items: [] };
  }
};

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  totalItems: number;
  subtotal: number;
  addProduct: (product: Product, quantity?: number) => boolean;
  addItem: (product: Product, quantity?: number) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  increaseQuantity: (productId: string) => void;
  incrementQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  clearCart: () => void;
  hasItem: (productId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable or full
    }
  }, [state]);

  const addProduct = useCallback((product: Product, quantity: number = 1) => {
    const isAvailable = product.isAvailable ?? product.available ?? true;
    if (!isAvailable) return false;
    const primaryImage = product.media?.find((media) => media.isPrimary) ?? product.media?.[0];
    const imageUrl = primaryImage?.url ?? '';
    const imageAlt = primaryImage?.altText ?? product.name;
    const validQuantity = Math.min(Math.max(1, quantity), MAX_ITEM_QUANTITY);
    const productCode = product.productCode ?? (product.id ? product.id.replace(/^prod-/, '').toUpperCase() : undefined);

    dispatch({
      type: 'add',
      item: {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        productCode,
        price: product.price,
        primaryImageUrl: imageUrl,
        image: imageUrl,
        imageAlt,
        quantity: validQuantity,
        available: true,
      },
    });

    trackEvent('product_added_to_cart', {
      productId: product.id,
      productName: product.name,
      quantity: validQuantity,
    });

    return true;
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'remove', productId });
    trackEvent('product_removed_from_cart', { productId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'update_quantity', productId, quantity });
  }, []);

  const increaseQuantity = useCallback((productId: string) => {
    dispatch({ type: 'increase', productId });
  }, []);

  const decreaseQuantity = useCallback((productId: string) => {
    dispatch({ type: 'decrease', productId });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'clear' });
  }, []);

  const hasItem = useCallback(
    (productId: string) => state.items.some((item) => item.productId === productId),
    [state.items],
  );

  const totalCount = useMemo(
    () => state.items.reduce((total, item) => total + item.quantity, 0),
    [state.items],
  );

  const calculatedSubtotal = useMemo(
    () => state.items.reduce((total, item) => total + item.price * item.quantity, 0),
    [state.items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      itemCount: totalCount,
      totalItems: totalCount,
      subtotal: calculatedSubtotal,
      addProduct,
      addItem: addProduct,
      removeItem,
      updateQuantity,
      increaseQuantity,
      incrementQuantity: increaseQuantity,
      decreaseQuantity,
      decrementQuantity: decreaseQuantity,
      clearCart,
      hasItem,
    }),
    [
      addProduct,
      clearCart,
      decreaseQuantity,
      hasItem,
      increaseQuantity,
      removeItem,
      state.items,
      calculatedSubtotal,
      totalCount,
      updateQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
