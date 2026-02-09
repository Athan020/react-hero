# React + TypeScript Cheatsheet for .NET Developers

A quick reference for common React patterns with TypeScript.

---

## Component Patterns

```typescript
// Function Component
interface Props {
  name: string;
  age?: number;  // Optional
}

function UserCard({ name, age = 0 }: Props) {
  return <div>{name}, {age}</div>;
}

// With children
interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return <main>{children}</main>;
}
```

---

## Hooks Quick Reference

```typescript
// State
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);

// Effect (componentDidMount/componentDidUpdate)
useEffect(() => {
  fetchData();
  return () => cleanup();  // componentWillUnmount
}, [dependency]);

// Ref
const inputRef = useRef<HTMLInputElement>(null);
inputRef.current?.focus();

// Memo (cache expensive calculation)
const filtered = useMemo(() => 
  items.filter(i => i.active), 
  [items]
);

// Callback (stable function reference)
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Context
const value = useContext(MyContext);

// Reducer
const [state, dispatch] = useReducer(reducer, initialState);
```

---

## Event Types

```typescript
// Click
onClick: (e: React.MouseEvent<HTMLButtonElement>) => void

// Change (input/select)
onChange: (e: React.ChangeEvent<HTMLInputElement>) => void

// Form submit
onSubmit: (e: React.FormEvent<HTMLFormElement>) => void

// Keyboard
onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void

// Focus
onFocus: (e: React.FocusEvent<HTMLInputElement>) => void
onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
```

---

## Conditional Rendering

```typescript
// If-else
{isLoggedIn ? <Dashboard /> : <Login />}

// If only
{isVisible && <Modal />}

// Switch-like
{status === 'loading' && <Spinner />}
{status === 'error' && <Error />}
{status === 'success' && <Data />}
```

---

## List Rendering

```typescript
// Basic list
{items.map(item => (
  <li key={item.id}>{item.name}</li>
))}

// With index (avoid as key!)
{items.map((item, index) => (
  <li key={item.id}>{index + 1}. {item.name}</li>
))}
```

---

## Forms

```typescript
// Controlled input
const [value, setValue] = useState('');
<input value={value} onChange={e => setValue(e.target.value)} />

// React Hook Form
const { register, handleSubmit } = useForm<FormData>();
<input {...register('email', { required: true })} />
```

---

## .NET ↔ React Mapping

| .NET Concept | React Equivalent |
|--------------|------------------|
| Class | Function Component |
| Properties | Props |
| Private fields | State (useState) |
| Constructor | Initial state / useEffect |
| Interface | TypeScript interface |
| DI Container | Context API |
| Service | Custom Hook / Store |
| async/await | Same syntax |
| LINQ .Where() | Array .filter() |
| LINQ .Select() | Array .map() |
| LINQ .First() | Array .find() |
| [Authorize] | ProtectedRoute component |
| ModelState | Form validation |

---

## Common Patterns

```typescript
// API fetch
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.get('/items');
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

// Context Provider
const MyContext = createContext<ContextType | null>(null);
export const useMyContext = () => {
  const ctx = useContext(MyContext);
  if (!ctx) throw new Error('Must be in provider');
  return ctx;
};
```

---

## Performance Tips

```typescript
// Memo component (skip re-render if props same)
const MemoizedComponent = memo(MyComponent);

// Stable callback for child props
const handleClick = useCallback(() => action(id), [id]);

// Expensive calculation cache
const result = useMemo(() => compute(data), [data]);

// Code split routes
const Page = lazy(() => import('./Page'));
```
