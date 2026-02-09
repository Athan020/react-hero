// Unit 7 Example: State Management with Context + useReducer
// Shopping cart implementation matching .NET patterns

import { createContext, useContext, useReducer, ReactNode, useMemo } from 'react';

// ============================================
// Types
// ============================================

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
}

type CartAction =
    | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
    | { type: 'REMOVE_ITEM'; payload: number }
    | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'TOGGLE_CART' };

interface CartContextType {
    state: CartState;
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    totalItems: number;
    totalPrice: number;
}

// ============================================
// Reducer
// ============================================

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItem = state.items.find(item => item.id === action.payload.id);

            if (existingItem) {
                return {
                    ...state,
                    items: state.items.map(item =>
                        item.id === action.payload.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    ),
                };
            }

            return {
                ...state,
                items: [...state.items, { ...action.payload, quantity: 1 }],
            };
        }

        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload),
            };

        case 'UPDATE_QUANTITY': {
            if (action.payload.quantity <= 0) {
                return {
                    ...state,
                    items: state.items.filter(item => item.id !== action.payload.id),
                };
            }
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ),
            };
        }

        case 'CLEAR_CART':
            return { ...state, items: [] };

        case 'TOGGLE_CART':
            return { ...state, isOpen: !state.isOpen };

        default:
            return state;
    }
}

// ============================================
// Context & Provider
// ============================================

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, {
        items: [],
        isOpen: false,
    });

    // Actions
    const addItem = (item: Omit<CartItem, 'quantity'>) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
    };

    const removeItem = (id: number) => {
        dispatch({ type: 'REMOVE_ITEM', payload: id });
    };

    const updateQuantity = (id: number, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const toggleCart = () => {
        dispatch({ type: 'TOGGLE_CART' });
    };

    // Computed values
    const totalItems = useMemo(
        () => state.items.reduce((sum, item) => sum + item.quantity, 0),
        [state.items]
    );

    const totalPrice = useMemo(
        () => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [state.items]
    );

    const value = useMemo(
        () => ({
            state,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            toggleCart,
            totalItems,
            totalPrice,
        }),
        [state, totalItems, totalPrice]
    );

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

// ============================================
// Components
// ============================================

interface Product {
    id: number;
    name: string;
    price: number;
}

const PRODUCTS: Product[] = [
    { id: 1, name: 'React Handbook', price: 29.99 },
    { id: 2, name: 'TypeScript Guide', price: 24.99 },
    { id: 3, name: 'Testing Masterclass', price: 34.99 },
];

function ProductCard({ product }: { product: Product }) {
    const { addItem } = useCart();

    return (
        <div className="product-card">
            <h3>{product.name}</h3>
            <p>${product.price.toFixed(2)}</p>
            <button onClick={() => addItem(product)}>Add to Cart</button>
        </div>
    );
}

function ProductList() {
    return (
        <div className="products">
            <h2>Products</h2>
            <div className="product-grid">
                {PRODUCTS.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}

function CartIcon() {
    const { totalItems, toggleCart } = useCart();

    return (
        <button onClick={toggleCart} className="cart-icon">
            🛒 Cart {totalItems > 0 && <span className="badge">{totalItems}</span>}
        </button>
    );
}

function CartSidebar() {
    const { state, removeItem, updateQuantity, clearCart, totalPrice } = useCart();

    if (!state.isOpen) return null;

    return (
        <aside className="cart-sidebar">
            <h2>Shopping Cart</h2>

            {state.items.length === 0 ? (
                <p>Your cart is empty</p>
            ) : (
                <>
                    <ul className="cart-items">
                        {state.items.map(item => (
                            <li key={item.id} className="cart-item">
                                <span>{item.name}</span>
                                <div className="quantity-controls">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                        +
                                    </button>
                                </div>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                                <button onClick={() => removeItem(item.id)}>×</button>
                            </li>
                        ))}
                    </ul>

                    <div className="cart-total">
                        <strong>Total: ${totalPrice.toFixed(2)}</strong>
                    </div>

                    <div className="cart-actions">
                        <button onClick={clearCart}>Clear Cart</button>
                        <button className="checkout-btn">Checkout</button>
                    </div>
                </>
            )}
        </aside>
    );
}

// ============================================
// Main Example
// ============================================

export function ShoppingCartExample() {
    return (
        <CartProvider>
            <div className="app">
                <header>
                    <h1>Shop</h1>
                    <CartIcon />
                </header>
                <ProductList />
                <CartSidebar />
            </div>
        </CartProvider>
    );
}

export default ShoppingCartExample;
