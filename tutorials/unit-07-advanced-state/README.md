# Unit 7: Advanced State Management

**Time**: 3-4 hours | **Level**: Intermediate-Advanced

## 🎯 Learning Objectives

- Understand when local state isn't enough
- Use Context API for global state
- Master useReducer for complex state logic
- Explore state management libraries (Zustand, Redux)
- Choose the right state management solution

## Key Topics

### 1. Context API

```typescript
import { createContext, useContext, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (user: User) => setUser(user);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Usage
function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 2. useReducer

```typescript
interface State {
  count: number;
  history: number[];
}

type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'RESET' }
  | { type: 'SET'; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT':
      return {
        count: state.count + 1,
        history: [...state.history, state.count + 1]
      };
    case 'DECREMENT':
      return {
        count: state.count - 1,
        history: [...state.history, state.count - 1]
      };
    case 'RESET':
      return { count: 0, history: [0] };
    case 'SET':
      return {
        count: action.payload,
        history: [...state.history, action.payload]
      };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, {
    count: 0,
    history: [0]
  });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
      <p>History: {state.history.join(', ')}</p>
    </div>
  );
}
```

### 3. Zustand (Simple State Management)

```bash
npm install zustand
```

```typescript
import { create } from 'zustand';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.id === item.id);
    if (existing) {
      return {
        items: state.items.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      };
    }
    return { items: [...state.items, { ...item, quantity: 1 }] };
  }),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),
  
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map(i =>
      i.id === id ? { ...i, quantity } : i
    )
  })),
  
  clearCart: () => set({ items: [] }),
  
  total: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}));

// Usage
function ShoppingCart() {
  const { items, addItem, removeItem, total } = useCartStore();

  return (
    <div>
      <h2>Cart</h2>
      {items.map(item => (
        <div key={item.id}>
          <span>{item.name} x {item.quantity}</span>
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
      <p>Total: ${total()}</p>
    </div>
  );
}
```

### 4. When to Use What

| Solution | Use When |
|----------|----------|
| **useState** | Local component state |
| **Context** | Shared state (theme, auth, language) |
| **useReducer** | Complex state logic, multiple related values |
| **Zustand** | Global state, simple API, TypeScript support |
| **Redux** | Very large apps, time-travel debugging, middleware |

## Exercises

1. **Theme Switcher**: Context for dark/light theme
2. **Shopping Cart**: Zustand store for cart management
3. **Todo App with useReducer**: Complex state logic
4. **Multi-Step Form**: Context + useReducer combination

## Next Steps

Continue to [Unit 8: Performance Optimization](../unit-08-performance/README.md)!
