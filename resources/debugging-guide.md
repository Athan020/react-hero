# React Debugging Guide

A practical guide to debugging React applications, tailored for backend developers.

---

## Quick Troubleshooting

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Component not updating | State mutation | Create new object/array |
| Infinite re-renders | Missing deps in useEffect | Add deps or use useCallback |
| State is stale | Closure captures old value | Use functional update |
| Props undefined | Async data not loaded | Add loading check |
| useEffect runs twice | React Strict Mode | Normal in dev, OK |

---

## Common Errors & Fixes

### 1. "Cannot read property of undefined"

**Cause**: Accessing nested data before it's loaded.

```typescript
// ❌ Crashes if user is undefined
<h1>{user.name}</h1>

// ✅ Optional chaining
<h1>{user?.name}</h1>

// ✅ Conditional render
{user && <h1>{user.name}</h1>}

// ✅ Loading state
if (!user) return <Loading />;
return <h1>{user.name}</h1>;
```

---

### 2. "Objects are not valid as a React child"

**Cause**: Rendering an object directly instead of its properties.

```typescript
// ❌ Error
<p>{user}</p>

// ✅ Render specific properties
<p>{user.name}</p>

// ✅ Or stringify for debugging
<pre>{JSON.stringify(user, null, 2)}</pre>
```

---

### 3. "Each child should have a unique key"

**Cause**: Missing or non-unique keys in lists.

```typescript
// ❌ Using index as key (problematic for reordering)
{items.map((item, i) => <li key={i}>{item.name}</li>)}

// ✅ Use unique, stable ID
{items.map(item => <li key={item.id}>{item.name}</li>)}
```

---

### 4. "Maximum update depth exceeded"

**Cause**: Infinite loop from state update triggering re-render which updates state.

```typescript
// ❌ Updates every render
useEffect(() => {
  setCount(count + 1);
});

// ❌ Object/function in deps (new every render)
useEffect(() => {
  doSomething();
}, [{ value: 1 }]);

// ✅ Correct dependencies
useEffect(() => {
  setCount(c => c + 1);
}, []); // Run once

// ✅ Stable dependency
const config = useMemo(() => ({ value: 1 }), []);
useEffect(() => {
  doSomething();
}, [config]);
```

---

### 5. "Can't perform state update on unmounted component"

**Cause**: Async operation completes after component unmounts.

```typescript
// ✅ Cleanup with AbortController
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    });

  return () => controller.abort();
}, []);

// ✅ Or use a mounted flag
useEffect(() => {
  let mounted = true;
  
  fetchData().then(data => {
    if (mounted) setData(data);
  });

  return () => { mounted = false; };
}, []);
```

---

## Debugging Tools

### React DevTools

1. Install browser extension
2. Components tab: Inspect component tree, props, state
3. Profiler tab: Record and analyze render performance

**Key features**:
- Click component to see props/state
- Edit state live to test
- "Highlight updates" to see re-renders
- Search for components by name

---

### Console Debugging

```typescript
// Log current state
console.log('Current state:', state);

// Log with label
console.log('%c Render', 'color: green', { props, state });

// Table for arrays
console.table(items);

// Group related logs
console.group('API Call');
console.log('Request:', config);
console.log('Response:', data);
console.groupEnd();

// Trace where something was called
console.trace('How did we get here?');
```

---

### useDebugValue

```typescript
function useCustomHook(value: string) {
  const [state, setState] = useState(value);
  
  // Shows in React DevTools
  useDebugValue(state ? 'Has value' : 'Empty');
  
  return [state, setState] as const;
}
```

---

## State Issues

### Stale Closures

```typescript
// ❌ Stale closure - always logs initial count
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const id = setInterval(() => {
      console.log(`Count is: ${count}`);  // Always 0!
    }, 1000);
    return () => clearInterval(id);
  }, []);  // Empty deps = captures initial count
}

// ✅ Use ref for mutable value
function Counter() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  countRef.current = count;
  
  useEffect(() => {
    const id = setInterval(() => {
      console.log(`Count is: ${countRef.current}`);  // Current value!
    }, 1000);
    return () => clearInterval(id);
  }, []);
}

// ✅ Or include in deps and handle cleanup
useEffect(() => {
  console.log(`Count changed to: ${count}`);
}, [count]);
```

---

### State Not Updating

```typescript
// ❌ Mutating state directly
const [items, setItems] = useState([1, 2, 3]);
items.push(4);  // This doesn't trigger re-render!
setItems(items);  // Same reference, React skips update

// ✅ Create new array
setItems([...items, 4]);

// ❌ Mutating object
const [user, setUser] = useState({ name: 'John' });
user.name = 'Jane';  // Mutation!
setUser(user);  // Same reference

// ✅ Create new object
setUser({ ...user, name: 'Jane' });
```

---

## Effect Issues

### Effect Running Twice

In React 18 Strict Mode, effects run twice in development. This is intentional to catch bugs.

```typescript
// If this causes issues, your effect isn't properly cleaning up
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
```

---

### Infinite Effect Loop

```typescript
// ❌ Object in deps - new object every render
useEffect(() => {
  fetchData(options);
}, [{ page: 1 }]);  // New object reference every time!

// ✅ Primitive values
const page = 1;
useEffect(() => {
  fetchData({ page });
}, [page]);

// ✅ Or memoize the object
const options = useMemo(() => ({ page: 1 }), []);
useEffect(() => {
  fetchData(options);
}, [options]);
```

---

## Network Debugging

### Inspect API Calls

1. Open browser DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Click request to see:
   - Headers (including auth tokens)
   - Request payload
   - Response body
   - Timing

### Log API Calls

```typescript
// Axios interceptor
api.interceptors.request.use(config => {
  console.log('🚀 Request:', config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  response => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  error => {
    console.log('❌ Error:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);
```

---

## Performance Debugging

### Identify Slow Renders

1. React DevTools → Profiler → Record
2. Perform actions
3. Stop recording
4. Look for:
   - Long bars (slow renders)
   - Frequent renders (unnecessary re-renders)

### Why Did You Render?

```bash
npm install @welldone-software/why-did-you-render
```

```typescript
// wdyr.ts - import BEFORE React
import React from 'react';

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}

// Mark components to track
MyComponent.whyDidYouRender = true;
```

---

## .NET Developer Tips

| .NET Debugging | React Equivalent |
|----------------|------------------|
| Breakpoints in VS | `debugger;` statement or browser breakpoints |
| Watch window | Console.log or React DevTools |
| Call stack | console.trace() |
| Exception logging | Error boundaries + console.error |
| Fiddler/Charles | Browser Network tab |
| Profiler | React Profiler |

---

## Debugging Checklist

1. **Check the console** - Most errors appear here
2. **Check React DevTools** - Inspect component state/props
3. **Check Network tab** - Verify API calls
4. **Add console.logs** - Trace execution flow
5. **Check dependencies** - useEffect/useMemo deps correct?
6. **Check for mutations** - Always create new objects/arrays
7. **Simplify and isolate** - Remove code until bug disappears
