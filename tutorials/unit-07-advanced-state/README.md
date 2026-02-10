# Unit 7: Advanced State Management

**Time**: 3-4 hours | **Level**: Intermediate-Advanced

## 🎯 Learning Objectives

By the end of this unit, you will:
- Master the Context API for global state
- Understand and use useReducer for complex state
- Combine Context + useReducer for scalable state management
- Learn Zustand as a modern state management alternative
- Know when to use each approach
- Implement common patterns (auth, theme, shopping cart)
- Avoid performance pitfalls with context

## 📚 Table of Contents

1. [Understanding State Management](#understanding-state-management)
2. [Context API Deep Dive](#context-api-deep-dive)
3. [useReducer](#usereducer)
4. [Context + useReducer Pattern](#context--usereducer-pattern)
5. [Zustand](#zustand)
6. [Choosing the Right Approach](#choosing-the-right-approach)
7. [Common Patterns](#common-patterns)
8. [Performance Optimization](#performance-optimization)
9. [Exercises](#exercises)
10. [Common Pitfalls](#common-pitfalls)
11. [Further Reading](#further-reading)

---

## Understanding State Management

### Types of State

| Type | Description | Examples | Solution |
|------|-------------|----------|----------|
| **Local State** | Single component | Form input, toggle | `useState` |
| **Lifted State** | Shared by siblings | Selected tab | Props |
| **Global State** | App-wide | User auth, theme | Context, Zustand |
| **Server State** | From API | User data, posts | React Query |
| **URL State** | In URL | Filters, pagination | React Router |

### Backend Analogy

```
React State Management          .NET Equivalent
----------------------          ---------------
useState                    ≈   Local variable
Props drilling              ≈   Passing parameters through layers
Context API                 ≈   Dependency Injection container
useReducer                  ≈   State machine / MediatR handler
Zustand/Redux              ≈   Service Locator / Application State
```

---

## Context API Deep Dive

### What is Context?

Context provides a way to pass data through the component tree without manually passing props at every level.

**Backend Analogy**: Like Dependency Injection in ASP.NET Core:
```csharp
// .NET DI
services.AddScoped<IUserService, UserService>();

// In controller - injected automatically
public class UserController(IUserService userService) { }
```

### Creating a Context

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

// 1. Define the context shape
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// 2. Create context with default (or null with type guard)
const ThemeContext = createContext<ThemeContextType | null>(null);

// 3. Create a custom hook for easy consumption
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// 4. Create the Provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 5. Use in your app
function App() {
  return (
    <ThemeProvider>
      <Header />
      <Main />
      <Footer />
    </ThemeProvider>
  );
}

// 6. Consume anywhere in the tree
function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`header-${theme}`}>
      <button onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'dark' : 'light'} mode
      </button>
    </header>
  );
}
```

### Multiple Contexts

```typescript
// Compose multiple providers
function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

function App() {
  return (
    <AppProviders>
      <Router />
    </AppProviders>
  );
}
```

### Context with Default Values

```typescript
// When you can provide sensible defaults
const defaultTheme: ThemeContextType = {
  theme: 'light',
  toggleTheme: () => console.warn('No ThemeProvider'),
};

const ThemeContext = createContext<ThemeContextType>(defaultTheme);

// Now useContext never returns null
export function useTheme() {
  return useContext(ThemeContext);  // No null check needed
}
```

---

## useReducer

### What is useReducer?

`useReducer` is an alternative to `useState` for complex state logic. It's similar to Redux reducers.

**Backend Analogy**: Like a state machine or MediatR handler:
```csharp
// MediatR pattern
public class UpdateUserHandler : IRequestHandler<UpdateUserCommand, User>
{
    public Task<User> Handle(UpdateUserCommand command, CancellationToken ct)
    {
        // Apply the update based on the command
    }
}
```

### Basic useReducer

```typescript
import { useReducer } from 'react';

// State type
interface CounterState {
  count: number;
}

// Action types
type CounterAction =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'RESET' }
  | { type: 'SET'; payload: number };

// Reducer function
function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'RESET':
      return { count: 0 };
    case 'SET':
      return { count: action.payload };
    default:
      return state;
  }
}

// Component
function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
      <button onClick={() => dispatch({ type: 'SET', payload: 100 })}>
        Set to 100
      </button>
    </div>
  );
}
```

### Complex State with useReducer

```typescript
// Todo list example
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  nextId: number;
}

type TodoAction =
  | { type: 'ADD_TODO'; payload: string }
  | { type: 'TOGGLE_TODO'; payload: number }
  | { type: 'DELETE_TODO'; payload: number }
  | { type: 'SET_FILTER'; payload: 'all' | 'active' | 'completed' }
  | { type: 'CLEAR_COMPLETED' };

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [
          ...state.todos,
          { id: state.nextId, text: action.payload, completed: false }
        ],
        nextId: state.nextId + 1,
      };

    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };

    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload),
      };

    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload,
      };

    case 'CLEAR_COMPLETED':
      return {
        ...state,
        todos: state.todos.filter(todo => !todo.completed),
      };

    default:
      return state;
  }
}

function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: 'all',
    nextId: 1,
  });

  const filteredTodos = state.todos.filter(todo => {
    if (state.filter === 'active') return !todo.completed;
    if (state.filter === 'completed') return todo.completed;
    return true;
  });

  // ... render
}
```

### When to Use useReducer vs useState

| Use `useState` | Use `useReducer` |
|----------------|------------------|
| Simple primitives | Complex objects/arrays |
| Independent values | Interdependent values |
| Few state transitions | Many state transitions |
| Simple logic | Complex update logic |
| Single component | Shared across components |

---

## Context + useReducer Pattern

Combining Context with useReducer creates a Redux-like pattern without external dependencies.

### Shopping Cart Example

```typescript
// types/cart.ts
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' };

// context/CartContext.tsx
import { createContext, useContext, useReducer, ReactNode } from 'react';

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

const CartContext = createContext<CartContextType | null>(null);

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

    case 'UPDATE_QUANTITY':
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

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });

  // Action creators
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
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Usage in components
function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => addItem(product)}>Add to Cart</button>
    </div>
  );
}

function CartIcon() {
  const { totalItems, toggleCart } = useCart();

  return (
    <button onClick={toggleCart} className="cart-icon">
      🛒 {totalItems > 0 && <span className="badge">{totalItems}</span>}
    </button>
  );
}

function CartSidebar() {
  const { state, removeItem, updateQuantity, clearCart, totalPrice } = useCart();

  if (!state.isOpen) return null;

  return (
    <aside className="cart-sidebar">
      <h2>Your Cart</h2>
      {state.items.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          {state.items.map(item => (
            <div key={item.id} className="cart-item">
              <span>{item.name}</span>
              <input
                type="number"
                min="0"
                value={item.quantity}
                onChange={e => updateQuantity(item.id, parseInt(e.target.value))}
              />
              <span>${(item.price * item.quantity).toFixed(2)}</span>
              <button onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          ))}
          <div className="cart-total">
            <strong>Total: ${totalPrice.toFixed(2)}</strong>
          </div>
          <button onClick={clearCart}>Clear Cart</button>
        </>
      )}
    </aside>
  );
}
```

---

## Zustand

Zustand is a small, fast, and scalable state management solution.

### Installation

```bash
npm install zustand
```

### Basic Zustand Store

```typescript
import { create } from 'zustand';

interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setCount: (value: number) => void;
}

const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  setCount: (value) => set({ count: value }),
}));

// Usage - no provider needed!
function Counter() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

### Shopping Cart with Zustand

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.id === item.id);
        if (existing) {
          return {
            items: state.items.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        return { items: [...state.items, { ...item, quantity: 1 }] };
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id),
      })),

      updateQuantity: (id, quantity) => set((state) => ({
        items: quantity <= 0
          ? state.items.filter(i => i.id !== id)
          : state.items.map(i => i.id === id ? { ...i, quantity } : i),
      })),

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      // Computed values using get()
      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getTotalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'cart-storage',  // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Usage
function CartIcon() {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const toggleCart = useCartStore((state) => state.toggleCart);

  return (
    <button onClick={toggleCart}>
      🛒 {totalItems > 0 && <span>{totalItems}</span>}
    </button>
  );
}
```

### Zustand with Async Actions

```typescript
import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      const { user, token } = await response.json();
      localStorage.setItem('token', token);
      set({ user, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false 
      });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null });
  },

  fetchUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    set({ isLoading: true });
    
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Not authenticated');
      
      const user = await response.json();
      set({ user, isLoading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, isLoading: false });
    }
  },
}));
```

### Zustand Selectors for Performance

```typescript
// ❌ Re-renders on ANY store change
function CartTotal() {
  const store = useCartStore();  // Subscribes to entire store
  return <p>Total: ${store.getTotalPrice()}</p>;
}

// ✅ Only re-renders when getTotalPrice changes
function CartTotal() {
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  return <p>Total: ${totalPrice.toFixed(2)}</p>;
}

// ✅ Multiple selectors
function CartSummary() {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  
  return (
    <div>
      <p>{totalItems} items</p>
      <p>${totalPrice.toFixed(2)}</p>
    </div>
  );
}
```

---

## Choosing the Right Approach

### Decision Matrix

| Scenario | Solution |
|----------|----------|
| Simple component state | `useState` |
| Complex component state | `useReducer` |
| Share state with children | Props |
| Share state across tree | Context |
| Complex shared state | Context + useReducer |
| Large app, many stores | Zustand |
| Server state | React Query |

### Comparison Table

| Feature | Context | Context + useReducer | Zustand |
|---------|---------|---------------------|---------|
| **Setup** | Moderate | Complex | Simple |
| **Boilerplate** | Low | High | Very Low |
| **Performance** | Careful | Careful | Good |
| **DevTools** | None | Redux DevTools | Zustand DevTools |
| **Persistence** | Manual | Manual | Built-in middleware |
| **Async** | Manual | Manual (middleware) | Built-in |
| **Learning curve** | Low | Medium | Low |
| **Bundle size** | 0 KB | 0 KB | ~1.5 KB |

---

## Common Patterns

### Authentication State

```typescript
// Using Zustand
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        const { user, accessToken } = response.data;
        
        set({ 
          user, 
          token: accessToken, 
          isAuthenticated: true 
        });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) return;
        
        try {
          const response = await apiClient.get('/auth/me');
          set({ user: response.data, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },
    }),
    { name: 'auth-storage' }
  )
);
```

### Theme State with System Preference

```typescript
type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
};

const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: getSystemTheme(),

      setTheme: (theme) => {
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        set({ theme, resolvedTheme: resolved });
        document.documentElement.classList.toggle('dark', resolved === 'dark');
      },
    }),
    { name: 'theme-storage' }
  )
);
```

---

## Performance Optimization

### Splitting Context

```typescript
// ❌ All consumers re-render on any change
const AppContext = createContext({ user: null, theme: 'light', cart: [] });

// ✅ Separate contexts for different domains
const UserContext = createContext({ user: null });
const ThemeContext = createContext({ theme: 'light' });
const CartContext = createContext({ items: [] });
```

### Memoizing Context Values

```typescript
function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // ❌ New object every render = all consumers re-render
  return (
    <CartContext.Provider value={{ items, setItems }}>
      {children}
    </CartContext.Provider>
  );

  // ✅ Memoize the value
  const value = useMemo(() => ({ items, setItems }), [items]);
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
```

### Zustand Shallow Comparison

```typescript
import { shallow } from 'zustand/shallow';

// ❌ Re-renders on any store change
const { items, addItem } = useCartStore();

// ✅ Only re-renders when items or addItem changes
const { items, addItem } = useCartStore(
  (state) => ({ items: state.items, addItem: state.addItem }),
  shallow
);
```

---

## Exercises

### Exercise 1: Theme Switcher

**Task**: Create a theme context with light, dark, and system modes.

**Requirements**:
- Persist theme preference in localStorage
- Detect system preference changes
- Apply theme class to document
- Toggle button component

---

### Exercise 2: Shopping Cart

**Task**: Build a complete shopping cart with Context + useReducer.

**Requirements**:
- Add, remove, update quantity
- Persist cart in localStorage
- Calculate totals
- Checkout flow

---

### Exercise 3: Multi-Language Support

**Task**: Create an i18n (internationalization) context.

**Requirements**:
- Support multiple languages (en, es, fr)
- Persist language preference
- Translate function: `t('hello.world')`
- Language switcher component

---

### Exercise 4: Notification System

**Task**: Create a notification/toast system with Zustand.

**Requirements**:
- Add notifications with type (success, error, warning)
- Auto-dismiss after timeout
- Dismiss manually
- Stack multiple notifications

---

## Common Pitfalls

### 1. Unnecessary Re-renders with Context

```typescript
// ❌ Every consumer re-renders when count changes
const MyContext = createContext({ count: 0, user: null });

function Provider({ children }) {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState(null);
  
  return (
    <MyContext.Provider value={{ count, user, setCount, setUser }}>
      {children}
    </MyContext.Provider>
  );
}

// ✅ Split into separate contexts
const CountContext = createContext({ count: 0, setCount: () => {} });
const UserContext = createContext({ user: null, setUser: () => {} });
```

### 2. Forgetting to Memoize Context Value

```typescript
// ❌ New object every render
<Context.Provider value={{ user, setUser }}>

// ✅ Memoized
const value = useMemo(() => ({ user, setUser }), [user]);
<Context.Provider value={value}>
```

### 3. Mutating State in Reducer

```typescript
// ❌ Mutating state directly
case 'ADD_ITEM':
  state.items.push(action.payload);  // WRONG!
  return state;

// ✅ Return new state
case 'ADD_ITEM':
  return {
    ...state,
    items: [...state.items, action.payload],
  };
```

### 4. Using Context for Frequently Changing Data

```typescript
// ❌ Mouse position updates 60fps - all consumers re-render
const MouseContext = createContext({ x: 0, y: 0 });

// ✅ Use Zustand with selectors, or lift state locally
const useMouseStore = create((set) => ({
  x: 0,
  y: 0,
  setPosition: (x, y) => set({ x, y }),
}));

// Only subscribe to what you need
const x = useMouseStore((state) => state.x);
```

---

## Further Reading

- [React Context Documentation](https://react.dev/reference/react/useContext)
- [useReducer Documentation](https://react.dev/reference/react/useReducer)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/updating-state)
- [When to Use Context](https://kentcdodds.com/blog/application-state-management-with-react)

---

## Next Steps

Continue to [Unit 8: Performance Optimization](../unit-08-performance/README.md)!
