// Unit 7 Example: Zustand Store
// Modern state management with Zustand

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================
// Types
// ============================================

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;

    // Actions
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;

    // Computed (getters)
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

// ============================================
// Zustand Store (with persistence)
// ============================================

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (item) =>
                set((state) => {
                    const existing = state.items.find((i) => i.id === item.id);
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                            ),
                        };
                    }
                    return { items: [...state.items, { ...item, quantity: 1 }] };
                }),

            removeItem: (id) =>
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id),
                })),

            updateQuantity: (id, quantity) =>
                set((state) => ({
                    items:
                        quantity <= 0
                            ? state.items.filter((i) => i.id !== id)
                            : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
                })),

            clearCart: () => set({ items: [] }),

            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

            getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

            getTotalPrice: () =>
                get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// ============================================
// Usage Examples
// ============================================

// Bad: Subscribes to entire store (re-renders on any change)
function BadCartIcon() {
    const store = useCartStore(); // ❌
    return <span>{store.getTotalItems()}</span>;
}

// Good: Subscribes to specific selector (only re-renders when totalItems changes)
function GoodCartIcon() {
    const totalItems = useCartStore((state) => state.getTotalItems());
    const toggleCart = useCartStore((state) => state.toggleCart);

    return (
        <button onClick={toggleCart}>
            🛒 {totalItems > 0 && <span>{totalItems}</span>}
        </button>
    );
}

function ProductCard({ product }: { product: { id: number; name: string; price: number } }) {
    const addItem = useCartStore((state) => state.addItem);

    return (
        <div className="product-card">
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <button onClick={() => addItem(product)}>Add to Cart</button>
        </div>
    );
}

function Cart() {
    const items = useCartStore((state) => state.items);
    const isOpen = useCartStore((state) => state.isOpen);
    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const clearCart = useCartStore((state) => state.clearCart);
    const totalPrice = useCartStore((state) => state.getTotalPrice());

    if (!isOpen) return null;

    return (
        <aside className="cart">
            <h2>Cart</h2>
            {items.length === 0 ? (
                <p>Empty cart</p>
            ) : (
                <>
                    {items.map((item) => (
                        <div key={item.id}>
                            <span>{item.name}</span>
                            <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                    updateQuantity(item.id, parseInt(e.target.value) || 0)
                                }
                            />
                            <button onClick={() => removeItem(item.id)}>Remove</button>
                        </div>
                    ))}
                    <p>Total: ${totalPrice.toFixed(2)}</p>
                    <button onClick={clearCart}>Clear</button>
                </>
            )}
        </aside>
    );
}

// ============================================
// Full Example App
// ============================================

const PRODUCTS = [
    { id: 1, name: 'React Guide', price: 29.99 },
    { id: 2, name: 'TypeScript Tips', price: 19.99 },
];

export function ZustandExample() {
    return (
        <div>
            <header>
                <h1>Store</h1>
                <GoodCartIcon />
            </header>
            <main>
                {PRODUCTS.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </main>
            <Cart />
        </div>
    );
}

export default ZustandExample;
