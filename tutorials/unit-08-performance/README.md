# Unit 8: Performance Optimization

**Time**: 2-3 hours | **Level**: Intermediate-Advanced

## 🎯 Learning Objectives

By the end of this unit, you will:
- Understand React's rendering behavior
- Use React.memo, useMemo, and useCallback effectively
- Implement code splitting with React.lazy
- Optimize large lists with virtualization
- Use the React DevTools Profiler
- Identify and fix common performance issues
- Apply performance best practices

## 📚 Table of Contents

1. [How React Renders](#how-react-renders)
2. [React.memo](#reactmemo)
3. [useMemo](#usememo)
4. [useCallback](#usecallback)
5. [Code Splitting](#code-splitting)
6. [List Virtualization](#list-virtualization)
7. [Profiling and Debugging](#profiling-and-debugging)
8. [Best Practices](#best-practices)
9. [Exercises](#exercises)
10. [Common Pitfalls](#common-pitfalls)
11. [Further Reading](#further-reading)

---

## How React Renders

### The Rendering Process

```
State/Props Change → Render Phase → Commit Phase → Browser Paint
                     (Virtual DOM)   (Real DOM)
```

1. **Render Phase**: React calls component functions and creates Virtual DOM
2. **Commit Phase**: React updates the real DOM with changes
3. **Browser Paint**: Browser paints the screen

### Why Components Re-render

A component re-renders when:
1. Its state changes
2. Its parent re-renders (props may be new)
3. Context it consumes changes

```typescript
function Parent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      {/* Child re-renders even though it doesn't use count! */}
      <Child name="Alice" />
    </div>
  );
}

function Child({ name }: { name: string }) {
  console.log('Child rendered');
  return <p>Hello, {name}</p>;
}
```

**Backend Analogy**: Like running a database query every time a request comes in vs. caching:
```csharp
// Uncached - runs every time
public User GetUser(int id) => _db.Users.Find(id);

// Cached - only runs when cache expires
public User GetUser(int id) => _cache.GetOrCreate(id, () => _db.Users.Find(id));
```

---

## React.memo

### What is React.memo?

`React.memo` is a higher-order component that memoizes the component, preventing re-renders if props haven't changed.

```typescript
import { memo } from 'react';

interface UserCardProps {
  user: { id: number; name: string; email: string };
}

// Without memo - re-renders on every parent render
function UserCard({ user }: UserCardProps) {
  console.log('UserCard rendered');
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}

// With memo - only re-renders when props change
const MemoizedUserCard = memo(function UserCard({ user }: UserCardProps) {
  console.log('UserCard rendered');
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});
```

### Custom Comparison Function

```typescript
interface ExpensiveListProps {
  items: Item[];
  selectedId: number;
}

const ExpensiveList = memo(
  function ExpensiveList({ items, selectedId }: ExpensiveListProps) {
    return (
      <ul>
        {items.map(item => (
          <li 
            key={item.id}
            className={item.id === selectedId ? 'selected' : ''}
          >
            {item.name}
          </li>
        ))}
      </ul>
    );
  },
  // Custom comparison - only re-render if items or selectedId changed
  (prevProps, nextProps) => {
    return (
      prevProps.items === nextProps.items &&
      prevProps.selectedId === nextProps.selectedId
    );
  }
);
```

### When to Use React.memo

| Use React.memo | Don't Use React.memo |
|----------------|----------------------|
| Expensive render work | Simple components |
| Pure components | Components that always re-render |
| Frequently re-rendering parents | Rarely rendered components |
| Stable props | Constantly changing props |

---

## useMemo

### What is useMemo?

`useMemo` memoizes the result of a calculation, only recomputing when dependencies change.

```typescript
import { useMemo, useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

function ProductList({ products }: { products: Product[] }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');

  // ✅ Only recalculates when products, search, or sortBy changes
  const filteredAndSorted = useMemo(() => {
    console.log('Filtering and sorting...');
    
    return products
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        return a.name.localeCompare(b.name);
      });
  }, [products, search, sortBy]);

  // ❌ Recalculates on every render
  const filteredAndSortedBad = products
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      return a.name.localeCompare(b.name);
    });

  return (
    <div>
      <input 
        value={search} 
        onChange={e => setSearch(e.target.value)}
        placeholder="Search..."
      />
      <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
        <option value="name">Sort by Name</option>
        <option value="price">Sort by Price</option>
      </select>
      
      <ul>
        {filteredAndSorted.map(product => (
          <li key={product.id}>
            {product.name} - ${product.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Preserving Referential Equality

```typescript
function Parent() {
  const [count, setCount] = useState(0);
  
  // ❌ New object every render - Child re-renders
  const style = { color: 'blue', fontSize: 16 };
  
  // ✅ Same object reference if nothing changed
  const memoizedStyle = useMemo(() => ({
    color: 'blue',
    fontSize: 16
  }), []);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <MemoizedChild style={memoizedStyle} />
    </div>
  );
}
```

---

## useCallback

### What is useCallback?

`useCallback` memoizes a function, returning the same function reference between renders.

```typescript
import { useCallback, useState, memo } from 'react';

// Child component - memoized
const Button = memo(function Button({ 
  onClick, 
  children 
}: { 
  onClick: () => void; 
  children: React.ReactNode;
}) {
  console.log('Button rendered:', children);
  return <button onClick={onClick}>{children}</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // ❌ New function every render - Button always re-renders
  const handleClick = () => {
    setCount(c => c + 1);
  };

  // ✅ Same function between renders - Button doesn't re-render unnecessarily
  const memoizedHandleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // No dependencies - function never changes

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <p>Count: {count}</p>
      <Button onClick={memoizedHandleClick}>Increment</Button>
    </div>
  );
}
```

### useCallback with Dependencies

```typescript
function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState('all');

  // Depends on filter - recreated when filter changes
  const handleFilter = useCallback((todo: Todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  }, [filter]);

  // Depends on nothing - never recreated
  const handleAdd = useCallback((text: string) => {
    setTodos(prev => [...prev, { id: Date.now(), text, completed: false }]);
  }, []);

  // Depends on nothing - uses functional update
  const handleToggle = useCallback((id: number) => {
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const filteredTodos = useMemo(
    () => todos.filter(handleFilter),
    [todos, handleFilter]
  );

  return (/* ... */);
}
```

---

## Code Splitting

### React.lazy and Suspense

```typescript
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// Loading component
function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
}
```

### Named Exports

```typescript
// For named exports, wrap in an object
const DashboardAnalytics = lazy(() =>
  import('./pages/Dashboard').then(module => ({
    default: module.Analytics
  }))
);
```

### Preloading Components

```typescript
// Preload on hover
const Dashboard = lazy(() => import('./pages/Dashboard'));

function Navbar() {
  const preloadDashboard = () => {
    import('./pages/Dashboard');
  };

  return (
    <nav>
      <Link 
        to="/dashboard" 
        onMouseEnter={preloadDashboard}
      >
        Dashboard
      </Link>
    </nav>
  );
}
```

---

## List Virtualization

For large lists, only render visible items.

### Using react-window

```bash
npm install react-window
```

```typescript
import { FixedSizeList as List } from 'react-window';

interface Item {
  id: number;
  name: string;
}

interface ItemRowProps {
  index: number;
  style: React.CSSProperties;
  data: Item[];
}

function ItemRow({ index, style, data }: ItemRowProps) {
  const item = data[index];
  
  return (
    <div style={style} className="list-item">
      {item.name}
    </div>
  );
}

function VirtualizedList({ items }: { items: Item[] }) {
  return (
    <List
      height={400}        // Container height
      width="100%"        // Container width
      itemCount={items.length}
      itemSize={50}       // Row height
      itemData={items}    // Data passed to each row
    >
      {ItemRow}
    </List>
  );
}
```

### Variable Height List

```typescript
import { VariableSizeList as List } from 'react-window';

function VariableHeightList({ items }: { items: Item[] }) {
  const getItemSize = (index: number) => {
    // Return height based on content
    return items[index].content.length > 100 ? 100 : 50;
  };

  return (
    <List
      height={400}
      width="100%"
      itemCount={items.length}
      itemSize={getItemSize}
    >
      {ItemRow}
    </List>
  );
}
```

---

## Profiling and Debugging

### React DevTools Profiler

1. Install React DevTools browser extension
2. Open DevTools → Profiler tab
3. Click Record → Interact with app → Stop recording
4. Analyze render times and re-renders

### Identifying Re-renders

```typescript
// Add logging to see when components render
function MyComponent({ data }: Props) {
  console.log('MyComponent rendered');
  // ...
}

// Or use React DevTools settings:
// Components → Settings → Highlight updates when components render
```

### why-did-you-render Library

```bash
npm install @welldone-software/why-did-you-render
```

```typescript
// wdyr.ts (import before React!)
import React from 'react';

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}

// In component
MyComponent.whyDidYouRender = true;
```

---

## Best Practices

### 1. Measure Before Optimizing

Don't optimize prematurely. Use the Profiler to identify actual bottlenecks.

### 2. Keep State Close

Move state down to where it's needed to reduce re-render scope.

```typescript
// ❌ State too high - entire app re-renders
function App() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <Header />
      <Sidebar />
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

// ✅ State contained - only Modal re-renders
function ModalContainer() {
  const [isOpen, setIsOpen] = useState(false);
  return <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
```

### 3. Avoid Inline Objects/Functions in JSX

```typescript
// ❌ New object/function every render
<Component style={{ color: 'blue' }} onClick={() => handleClick(id)} />

// ✅ Define outside or memoize
const style = useMemo(() => ({ color: 'blue' }), []);
const handleClickMemo = useCallback(() => handleClick(id), [id]);

<Component style={style} onClick={handleClickMemo} />
```

### 4. Use Keys Properly

```typescript
// ❌ Using index as key - bad for reordering
{items.map((item, index) => <Item key={index} {...item} />)}

// ✅ Use unique, stable ID
{items.map(item => <Item key={item.id} {...item} />)}
```

---

## Exercises

### Exercise 1: Optimize Re-renders

**Task**: Fix a component that re-renders unnecessarily.

Given code has performance issues. Identify and fix them using React.memo, useMemo, and useCallback.

---

### Exercise 2: Implement Virtualization

**Task**: Create a list of 10,000 items that renders smoothly.

**Requirements**:
- Use react-window
- Search filter
- Maintain smooth 60fps scrolling

---

### Exercise 3: Code Splitting

**Task**: Implement code splitting for a dashboard app.

**Requirements**:
- Lazy load each dashboard section
- Show loading skeleton during load
- Preload on hover

---

### Exercise 4: Profile and Optimize

**Task**: Use React DevTools to profile an app and fix issues.

**Requirements**:
- Record a session
- Identify top 3 performance issues
- Fix and verify improvement

---

## Common Pitfalls

### 1. Over-memoizing

```typescript
// ❌ Memoizing everything - adds overhead without benefit
const value = useMemo(() => 1 + 1, []);

// ✅ Only memoize expensive calculations
const value = useMemo(() => 
  items.filter(...).sort(...).map(...),
  [items]
);
```

### 2. Wrong Dependencies

```typescript
// ❌ Missing dependency - stale closure
const [count, setCount] = useState(0);
const increment = useCallback(() => {
  setCount(count + 1);  // Uses stale count!
}, []);

// ✅ Use functional update
const increment = useCallback(() => {
  setCount(c => c + 1);
}, []);
```

### 3. Breaking Memoization

```typescript
// Parent
function Parent() {
  // ❌ New object every render breaks child memo
  return <MemoizedChild config={{ theme: 'dark' }} />;
  
  // ✅ Memoize the prop
  const config = useMemo(() => ({ theme: 'dark' }), []);
  return <MemoizedChild config={config} />;
}
```

---

## Further Reading

- [React Docs: Optimizing Performance](https://react.dev/learn/render-and-commit)
- [React Profiler](https://react.dev/reference/react/Profiler)
- [react-window Documentation](https://react-window.vercel.app/)
- [useMemo and useCallback Guide](https://kentcdodds.com/blog/usememo-and-usecallback)

---

## Next Steps

Continue to [Unit 9: Testing](../unit-09-testing/README.md)!
