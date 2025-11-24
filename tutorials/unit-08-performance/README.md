# Unit 8: Performance Optimization

**Time**: 2-3 hours | **Level**: Advanced

## 🎯 Learning Objectives

- Understand React rendering behavior
- Use React.memo for component memoization
- Master useMemo and useCallback hooks
- Implement code splitting and lazy loading
- Optimize bundle size
- Profile and measure performance

## Key Topics

### 1. React.memo

```typescript
interface UserCardProps {
  user: User;
}

// Without memo: re-renders even if props haven't changed
function UserCard({ user }: UserCardProps) {
  console.log('UserCard rendered');
  return <div>{user.name}</div>;
}

// With memo: only re-renders if props change
const UserCard = React.memo(({ user }: UserCardProps) => {
  console.log('UserCard rendered');
  return <div>{user.name}</div>;
});
```

### 2. useMemo

```typescript
function ExpensiveComponent({ items }: { items: number[] }) {
  // ❌ Recalculates on every render
  const sum = items.reduce((a, b) => a + b, 0);

  // ✅ Only recalculates when items change
  const sum = useMemo(() => {
    console.log('Calculating sum...');
    return items.reduce((a, b) => a + b, 0);
  }, [items]);

  return <div>Sum: {sum}</div>;
}
```

### 3. useCallback

```typescript
function Parent() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);

  // ❌ New function on every render
  const handleClick = () => {
    console.log('Clicked');
  };

  // ✅ Same function reference unless dependencies change
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  return (
    <div>
      <button onClick={() => setOther(other + 1)}>Other: {other}</button>
      <ExpensiveChild onClick={handleClick} />
    </div>
  );
}

const ExpensiveChild = React.memo(({ onClick }: { onClick: () => void }) => {
  console.log('ExpensiveChild rendered');
  return <button onClick={onClick}>Click</button>;
});
```

### 4. Code Splitting

```typescript
import { lazy, Suspense } from 'react';

// ❌ Imported immediately (increases initial bundle size)
import AdminPanel from './AdminPanel';

// ✅ Loaded only when needed
const AdminPanel = lazy(() => import('./AdminPanel'));

function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div>
      <button onClick={() => setShowAdmin(true)}>Show Admin</button>
      
      {showAdmin && (
        <Suspense fallback={<div>Loading...</div>}>
          <AdminPanel />
        </Suspense>
      )}
    </div>
  );
}
```

### 5. Route-Based Code Splitting

```typescript
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}
```

### 6. Virtualization (Large Lists)

```bash
npm install react-window
```

```typescript
import { FixedSizeList } from 'react-window';

function LargeList({ items }: { items: string[] }) {
  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={35}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {items[index]}
        </div>
      )}
    </FixedSizeList>
  );
}
```

### 7. Bundle Analysis

```bash
npm run build
npx vite-bundle-visualizer
```

## Performance Checklist

- ✅ Use React.memo for expensive components
- ✅ Use useMemo for expensive calculations
- ✅ Use useCallback for functions passed to memoized children
- ✅ Implement code splitting for routes
- ✅ Lazy load heavy components
- ✅ Virtualize long lists
- ✅ Optimize images (use WebP, lazy loading)
- ✅ Minimize bundle size
- ✅ Use production build for deployment

## Exercises

1. **Optimize Todo List**: Add memoization to prevent unnecessary renders
2. **Lazy Load Routes**: Implement code splitting for all routes
3. **Virtual Scroll**: Create virtualized list for 10,000 items
4. **Bundle Optimization**: Analyze and reduce bundle size

## Next Steps

Continue to [Unit 9: Testing](../unit-09-testing/README.md)!
