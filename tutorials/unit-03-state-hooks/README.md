# Unit 3: State Management and Hooks

**Time**: 3 hours | **Level**: Beginner-Intermediate

## 🎯 Learning Objectives

By the end of this unit, you will:
- Understand what state is and why it's essential in React
- Master the `useState` hook for managing component state
- Use the `useEffect` hook for side effects and lifecycle management
- Handle events in React components
- Understand controlled vs uncontrolled components
- Create custom hooks to reuse stateful logic
- Follow hook rules and best practices

## 📚 Table of Contents

1. [Understanding State](#understanding-state)
2. [The useState Hook](#the-usestate-hook)
3. [Event Handling](#event-handling)
4. [The useEffect Hook](#the-useeffect-hook)
5. [Controlled vs Uncontrolled Components](#controlled-vs-uncontrolled-components)
6. [Custom Hooks](#custom-hooks)
7. [Hook Rules](#hook-rules)
8. [Exercises](#exercises)
9. [Common Pitfalls](#common-pitfalls)
10. [Further Reading](#further-reading)

---

## Understanding State

### What is State?

**State** is data that changes over time and triggers re-renders when updated.

**Backend Analogy**: 
- **Props** = Method parameters (passed from outside, read-only)
- **State** = Instance variables (owned by the component, can change)

### Props vs State

| Props | State |
|-------|-------|
| Passed from parent | Owned by component |
| Read-only (immutable) | Can be updated |
| Like function parameters | Like instance variables |
| External data | Internal data |

### Example: Counter

```typescript
// Without state (doesn't work!)
function Counter() {
  let count = 0;  // ❌ This won't trigger re-render
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => count++}>Increment</button>
    </div>
  );
}

// With state (works!)
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);  // ✅ This triggers re-render
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

---

## The useState Hook

### Basic Syntax

```typescript
import { useState } from 'react';

function Component() {
  const [state, setState] = useState(initialValue);
  //     ^       ^                    ^
  //     |       |                    |
  //  current  setter              initial value
  //  value    function
}
```

**Backend Analogy**: Like a property with a setter in C#:
```csharp
// C#
private int count = 0;
public int Count 
{ 
  get => count; 
  set { count = value; OnPropertyChanged(); }  // Triggers UI update
}

// React
const [count, setCount] = useState(0);
setCount(5);  // Triggers re-render
```

### useState with Different Types

```typescript
// Number
const [count, setCount] = useState<number>(0);

// String
const [name, setName] = useState<string>('');

// Boolean
const [isOpen, setIsOpen] = useState<boolean>(false);

// Array
const [items, setItems] = useState<string[]>([]);

// Object
interface User {
  name: string;
  email: string;
}
const [user, setUser] = useState<User>({ name: '', email: '' });

// Null/Undefined (common for async data)
const [data, setData] = useState<User | null>(null);
```

### Updating State

```typescript
function Counter() {
  const [count, setCount] = useState(0);

  // ✅ Correct: Set new value
  const increment = () => setCount(count + 1);

  // ✅ Also correct: Functional update (preferred for updates based on previous state)
  const incrementFunctional = () => setCount(prev => prev + 1);

  // ❌ Wrong: Never mutate state directly
  const incrementWrong = () => count++;  // Doesn't work!

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={incrementFunctional}>+1 (Functional)</button>
    </div>
  );
}
```

### Why Functional Updates?

```typescript
function Counter() {
  const [count, setCount] = useState(0);

  // ❌ Problem: Multiple updates in quick succession
  const incrementThreeTimes = () => {
    setCount(count + 1);  // count is 0, sets to 1
    setCount(count + 1);  // count is still 0, sets to 1
    setCount(count + 1);  // count is still 0, sets to 1
    // Result: count is 1, not 3!
  };

  // ✅ Solution: Functional updates
  const incrementThreeTimesFunctional = () => {
    setCount(prev => prev + 1);  // prev is 0, returns 1
    setCount(prev => prev + 1);  // prev is 1, returns 2
    setCount(prev => prev + 1);  // prev is 2, returns 3
    // Result: count is 3 ✅
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={incrementThreeTimes}>+3 (Wrong)</button>
      <button onClick={incrementThreeTimesFunctional}>+3 (Correct)</button>
    </div>
  );
}
```

### Updating Objects

```typescript
interface User {
  name: string;
  email: string;
  age: number;
}

function UserProfile() {
  const [user, setUser] = useState<User>({
    name: 'John',
    email: 'john@example.com',
    age: 30
  });

  // ❌ Wrong: Mutating state
  const updateNameWrong = () => {
    user.name = 'Jane';  // Don't mutate!
    setUser(user);       // React won't detect the change
  };

  // ✅ Correct: Create new object
  const updateName = (newName: string) => {
    setUser({ ...user, name: newName });  // Spread operator creates new object
  };

  // ✅ Also correct: Functional update
  const updateEmail = (newEmail: string) => {
    setUser(prev => ({ ...prev, email: newEmail }));
  };

  return (
    <div>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <button onClick={() => updateName('Jane')}>Change Name</button>
      <button onClick={() => updateEmail('jane@example.com')}>Change Email</button>
    </div>
  );
}
```

### Updating Arrays

```typescript
function TodoList() {
  const [todos, setTodos] = useState<string[]>(['Learn React', 'Build app']);

  // Add item
  const addTodo = (todo: string) => {
    setTodos([...todos, todo]);  // Spread creates new array
    // Or: setTodos(prev => [...prev, todo]);
  };

  // Remove item
  const removeTodo = (index: number) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  // Update item
  const updateTodo = (index: number, newValue: string) => {
    setTodos(todos.map((todo, i) => i === index ? newValue : todo));
  };

  // Clear all
  const clearTodos = () => {
    setTodos([]);
  };

  return (
    <div>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            {todo}
            <button onClick={() => removeTodo(index)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={() => addTodo('New todo')}>Add Todo</button>
      <button onClick={clearTodos}>Clear All</button>
    </div>
  );
}
```

---

## Event Handling

### Basic Event Handling

```typescript
function Button() {
  const handleClick = () => {
    console.log('Button clicked!');
  };

  return <button onClick={handleClick}>Click Me</button>;
}

// Or inline
function Button() {
  return (
    <button onClick={() => console.log('Clicked!')}>
      Click Me
    </button>
  );
}
```

### Event Types

```typescript
function EventExamples() {
  // Click event
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Clicked at:', event.clientX, event.clientY);
  };

  // Change event (input)
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('New value:', event.target.value);
  };

  // Submit event (form)
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();  // Prevent page reload
    console.log('Form submitted');
  };

  // Keyboard event
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      console.log('Enter pressed');
    }
  };

  return (
    <div>
      <button onClick={handleClick}>Click</button>
      <input onChange={handleChange} onKeyPress={handleKeyPress} />
      <form onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
```

### Passing Arguments to Event Handlers

```typescript
function ItemList() {
  const items = ['Apple', 'Banana', 'Cherry'];

  const handleItemClick = (item: string, index: number) => {
    console.log(`Clicked ${item} at index ${index}`);
  };

  return (
    <ul>
      {items.map((item, index) => (
        <li key={index} onClick={() => handleItemClick(item, index)}>
          {item}
        </li>
      ))}
    </ul>
  );
}
```

---

## The useEffect Hook

### What is useEffect?

**useEffect** lets you perform **side effects** in your components.

**Side effects** include:
- Fetching data from an API
- Setting up subscriptions
- Manually changing the DOM
- Setting timers
- Logging

**Backend Analogy**: Like lifecycle methods in C# (OnInitialized, OnAfterRender in Blazor) or constructor/dispose patterns.

### Basic Syntax

```typescript
import { useEffect } from 'react';

useEffect(() => {
  // Code to run (side effect)
  
  return () => {
    // Cleanup code (optional)
  };
}, [dependencies]);  // Dependency array
```

### useEffect Patterns

#### 1. Run Once (on Mount)

```typescript
function Component() {
  useEffect(() => {
    console.log('Component mounted');
    // Like componentDidMount in class components
  }, []);  // Empty array = run once
}
```

#### 2. Run on Every Render

```typescript
function Component() {
  useEffect(() => {
    console.log('Component rendered');
  });  // No dependency array = run on every render
}
```

#### 3. Run When Dependencies Change

```typescript
function Component() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Count changed to:', count);
  }, [count]);  // Run when count changes
}
```

#### 4. Cleanup Function

```typescript
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Setup: Start interval
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // Cleanup: Clear interval when component unmounts
    return () => {
      clearInterval(interval);
    };
  }, []);  // Run once on mount

  return <p>Seconds: {seconds}</p>;
}
```

### Common useEffect Use Cases

#### Fetching Data

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when userId changes
    setLoading(true);
    setError(null);

    // Fetch user data
    fetch(`https://api.example.com/users/${userId}`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);  // Re-fetch when userId changes

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return <p>No user found</p>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

#### Document Title

```typescript
function PageTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return <h1>{title}</h1>;
}
```

#### Event Listeners

```typescript
function WindowSize() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup: Remove event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <p>Window width: {width}px</p>;
}
```

---

## Controlled vs Uncontrolled Components

### Controlled Components

**Controlled**: React state controls the input value.

```typescript
function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <div>
      <input
        type="text"
        value={value}  // Controlled by state
        onChange={e => setValue(e.target.value)}
      />
      <p>You typed: {value}</p>
    </div>
  );
}
```

**Backend Analogy**: Like two-way data binding in WPF or Blazor.

### Uncontrolled Components

**Uncontrolled**: DOM controls the input value (use refs to access).

```typescript
import { useRef } from 'react';

function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    console.log('Value:', inputRef.current?.value);
  };

  return (
    <div>
      <input type="text" ref={inputRef} />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

### When to Use Each

| Controlled | Uncontrolled |
|------------|--------------|
| Form validation | Simple forms |
| Conditional rendering | File inputs |
| Dynamic inputs | Integration with non-React code |
| **Recommended** | Use sparingly |

---

## Custom Hooks

### What are Custom Hooks?

**Custom hooks** let you extract and reuse stateful logic.

**Backend Analogy**: Like extension methods or helper classes in C#.

### Creating a Custom Hook

```typescript
// useCounter.ts
import { useState } from 'react';

function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}

export default useCounter;
```

**Usage**:
```typescript
import useCounter from './useCounter';

function Counter() {
  const { count, increment, decrement, reset } = useCounter(0);

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

### More Custom Hook Examples

#### useToggle

```typescript
function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = () => setValue(prev => !prev);
  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);

  return { value, toggle, setTrue, setFalse };
}

// Usage
function Modal() {
  const { value: isOpen, toggle, setFalse } = useToggle(false);

  return (
    <div>
      <button onClick={toggle}>Toggle Modal</button>
      {isOpen && (
        <div className="modal">
          <p>Modal Content</p>
          <button onClick={setFalse}>Close</button>
        </div>
      )}
    </div>
  );
}
```

#### useLocalStorage

```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    window.localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setStoredValue] as const;
}

// Usage
function App() {
  const [name, setName] = useLocalStorage('name', '');

  return (
    <input
      value={name}
      onChange={e => setName(e.target.value)}
      placeholder="Your name (saved to localStorage)"
    />
  );
}
```

---

## Hook Rules

### The Two Rules of Hooks

1. **Only call hooks at the top level**
   - Don't call hooks inside loops, conditions, or nested functions
   
2. **Only call hooks from React functions**
   - Call from functional components
   - Call from custom hooks

### Examples

```typescript
// ❌ Wrong: Hook in condition
function Component({ condition }: { condition: boolean }) {
  if (condition) {
    const [state, setState] = useState(0);  // Error!
  }
}

// ✅ Correct: Condition inside hook
function Component({ condition }: { condition: boolean }) {
  const [state, setState] = useState(condition ? 0 : 10);
}

// ❌ Wrong: Hook in loop
function Component({ items }: { items: string[] }) {
  items.forEach(item => {
    const [state, setState] = useState(item);  // Error!
  });
}

// ✅ Correct: Single hook for array
function Component({ items }: { items: string[] }) {
  const [states, setStates] = useState(items);
}
```

---

## Exercises

### Exercise 1: Interactive Todo List

**Task**: Create a todo list with add, delete, and toggle complete functionality.

**Requirements**:
- Input to add new todos
- Display list of todos
- Click to toggle complete (strikethrough)
- Delete button for each todo
- Show count of active todos

---

### Exercise 2: Form with Validation

**Task**: Create a registration form with real-time validation.

**Requirements**:
- Fields: name, email, password
- Validation: name (min 3 chars), email (valid format), password (min 8 chars)
- Show error messages
- Disable submit if invalid
- Clear form after submit

---

### Exercise 3: Data Fetching Component

**Task**: Create a component that fetches and displays user data.

**Requirements**:
- Fetch from `https://jsonplaceholder.typicode.com/users/1`
- Show loading state
- Show error state
- Display user data when loaded
- Refetch button

---

### Exercise 4: Custom Hook

**Task**: Create a `useDebounce` custom hook.

**Requirements**:
- Accept value and delay
- Return debounced value
- Use in a search input (log debounced value)

---

## Solutions

Solutions are available in the `solutions/` folder.

---

## Common Pitfalls

### 1. Mutating State

```typescript
// ❌ Wrong
const [user, setUser] = useState({ name: 'John' });
user.name = 'Jane';  // Mutation!

// ✅ Correct
setUser({ ...user, name: 'Jane' });
```

### 2. Stale Closures

```typescript
// ❌ Problem
const [count, setCount] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setCount(count + 1);  // count is always 0!
  }, 1000);
  return () => clearInterval(interval);
}, []);

// ✅ Solution: Functional update
setCount(prev => prev + 1);
```

### 3. Missing Dependencies

```typescript
// ❌ Warning: missing dependency
useEffect(() => {
  console.log(count);
}, []);  // Should include 'count'

// ✅ Correct
useEffect(() => {
  console.log(count);
}, [count]);
```

### 4. Infinite Loops

```typescript
// ❌ Infinite loop
const [data, setData] = useState([]);

useEffect(() => {
  setData([...data, 'item']);  // Triggers re-render, runs again!
}, [data]);

// ✅ Correct: Only run once
useEffect(() => {
  setData(['item']);
}, []);
```

---

## Testing Your Knowledge

1. What's the difference between props and state?
2. Why use functional updates with setState?
3. What does useEffect do?
4. When does the cleanup function run?
5. What's the difference between controlled and uncontrolled components?
6. What are the two rules of hooks?
7. When should you create a custom hook?

---

## Further Reading

- [React Docs: State](https://react.dev/learn/state-a-components-memory)
- [React Docs: useEffect](https://react.dev/reference/react/useEffect)
- [React Docs: Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

## Next Steps

Excellent! 🎉 You now understand:
- ✅ State management with useState
- ✅ Side effects with useEffect
- ✅ Event handling
- ✅ Custom hooks

**Ready for more?** Head to [Unit 4: Forms and User Input](../unit-04-forms/README.md) to master form handling!

---

*Happy coding! 🚀*
