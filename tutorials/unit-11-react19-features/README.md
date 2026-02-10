# Unit 11: React 19 Features

> **Time**: ~3-4 hours | **Level**: Intermediate-Advanced
>
> Master the features that make React 19 a paradigm shift — Actions, `useOptimistic`, the `use()` hook, the React Compiler, and more.

---

## Prerequisites

- Completed Units 1-10 (especially Unit 4: Forms and Unit 8: Performance)
- Understanding of `useState`, `useEffect`, and `useReducer`
- Familiarity with async/await and Promises

## What You'll Learn

- ✅ Replace manual form state with **Actions** (`useActionState`, `useFormStatus`)
- ✅ Build instant-feedback UIs with **`useOptimistic`**
- ✅ Simplify data loading with the **`use()` hook**
- ✅ Understand why the **React Compiler** makes manual `useMemo`/`useCallback` unnecessary
- ✅ Use improved **ref** handling (no more `forwardRef`)
- ✅ Add **document metadata** (`<title>`, `<meta>`) from any component
- ✅ Preserve hidden UI state with **`<Activity />`** (React 19.2)
- ✅ Understand **Server Components** concepts and `'use client'` / `'use server'` directives

---

## 1. Actions and Form Handling

### The Problem Actions Solve

In React 18, handling a form submission required managing several pieces of state manually:

```typescript
// ❌ React 18 pattern — lots of boilerplate
function ContactForm() {
  const [name, setName] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      await submitContact(name);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Sent!</p>}
    </form>
  );
}
```

That's **4 state variables** and a lot of wiring just for one form. React 19's Actions fix this.

### `useActionState` — Manage Action Lifecycle

`useActionState` handles pending states, errors, and results automatically:

```typescript
import { useActionState } from 'react';

// The action function receives the previous state + form data
async function submitContactAction(
  previousState: { message: string } | null,
  formData: FormData
) {
  const name = formData.get('name') as string;

  if (!name.trim()) {
    return { message: 'Name is required' };
  }

  await fetch('/api/contact', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

  return { message: 'Message sent successfully!' };
}

// ✅ React 19 pattern — clean and simple
function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContactAction,
    null  // initial state
  );

  return (
    <form action={formAction}>
      <input name="name" required />
      <button disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
      {state?.message && <p>{state.message}</p>}
    </form>
  );
}
```

**What changed**:
- No `onSubmit` handler — use the `action` prop instead
- No manual `isPending` state — `useActionState` provides it
- No `try/catch` boilerplate — the action returns the result directly
- Form data is automatically collected via `FormData`

> **🔵 .NET Analogy**: Think of Actions like ASP.NET's `[HttpPost]` handlers. The form's `action` prop is the URL, `FormData` is the model binding, and `useActionState` is the `ModelState` — it manages validation and the response in one place.

### `useFormStatus` — Child Component Access

`useFormStatus` lets any child component know if its parent form is submitting — **no prop drilling needed**:

```typescript
import { useFormStatus } from 'react-dom';

// This component can be used in ANY form
function SubmitButton({ label = 'Submit' }: { label?: string }) {
  const { pending, data, method, action } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : label}
    </button>
  );
}

// Use it in any form — it automatically knows the form's status
function ProfileForm() {
  const [state, formAction] = useActionState(updateProfile, null);

  return (
    <form action={formAction}>
      <input name="displayName" />
      <input name="bio" />
      <SubmitButton label="Save Profile" />
      {/* SubmitButton knows when this form is pending! */}
    </form>
  );
}
```

> **⚠️ Important**: `useFormStatus` must be used in a component that is a **child** of a `<form>`. It won't work in the same component that renders the form.

### Forms with `action` Prop

React 19 extends `<form>` to accept functions as the `action` prop. Regular (non-async) functions work too:

```typescript
function SearchForm() {
  function handleSearch(formData: FormData) {
    const query = formData.get('query') as string;
    // Navigate, filter, etc.
    console.log('Searching for:', query);
  }

  return (
    <form action={handleSearch}>
      <input name="query" placeholder="Search..." />
      <button type="submit">Search</button>
    </form>
  );
}
```

---

## 2. `useOptimistic` — Instant UI Feedback

### The Concept

**Optimistic updates** show the expected result immediately, *before* the server confirms it. If the server request fails, React automatically rolls back to the real state.

> **🔵 .NET Analogy**: This is conceptually similar to **CQRS with Event Sourcing** — you project the expected state immediately (the "read model"), then reconcile when the actual event is processed. If the command fails, the projection is rolled back.

### Basic Usage

```typescript
import { useOptimistic, useActionState } from 'react';

interface Message {
  id: string;
  text: string;
  sending?: boolean;  // Optimistic flag
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);

  // Create an optimistic version of the messages list
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    // Updater: how to apply the optimistic update
    (currentMessages, newMessage: string) => [
      ...currentMessages,
      { id: crypto.randomUUID(), text: newMessage, sending: true },
    ]
  );

  async function sendAction(formData: FormData) {
    const text = formData.get('message') as string;

    // 1. Show the message immediately (optimistic)
    addOptimisticMessage(text);

    // 2. Actually send it to the server
    const savedMessage = await sendToServer(text);

    // 3. Update real state — optimistic version is replaced
    setMessages(prev => [...prev, savedMessage]);
  }

  return (
    <div>
      {optimisticMessages.map(msg => (
        <div key={msg.id} style={{ opacity: msg.sending ? 0.6 : 1 }}>
          {msg.text}
          {msg.sending && <span> ✈️ Sending...</span>}
        </div>
      ))}

      <form action={sendAction}>
        <input name="message" placeholder="Type a message..." />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

**How it works**:
1. User submits → `addOptimisticMessage` immediately adds to the UI (with `sending: true`)
2. The server request runs in the background
3. When the server responds, `setMessages` updates the real state
4. React replaces the optimistic entry with the real data
5. **If the request fails**: the optimistic entry disappears automatically (React rolls back)

### Optimistic Toggle Example

A common real-world pattern — like/unlike buttons:

```typescript
function LikeButton({ postId, isLiked, likeCount }: {
  postId: string;
  isLiked: boolean;
  likeCount: number;
}) {
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(isLiked);
  const [optimisticCount, setOptimisticCount] = useOptimistic(likeCount);

  async function toggleLike() {
    const newLiked = !optimisticLiked;
    setOptimisticLiked(newLiked);
    setOptimisticCount(newLiked ? likeCount + 1 : likeCount - 1);

    await fetch(`/api/posts/${postId}/like`, {
      method: newLiked ? 'POST' : 'DELETE',
    });
  }

  return (
    <button onClick={toggleLike}>
      {optimisticLiked ? '❤️' : '🤍'} {optimisticCount}
    </button>
  );
}
```

---

## 3. The `use()` Hook — Read Promises and Context

### Reading Promises

The `use()` hook lets you read the value of a Promise **directly in render** — without `useEffect` or state:

```typescript
import { use, Suspense } from 'react';

// Create the promise OUTSIDE the component (or in a parent)
const userPromise = fetch('/api/user').then(r => r.json());

function UserProfile() {
  // use() suspends until the promise resolves
  const user = use(userPromise);

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// Wrap in Suspense for the loading state
function App() {
  return (
    <Suspense fallback={<p>Loading user...</p>}>
      <UserProfile />
    </Suspense>
  );
}
```

**Comparison with the `useEffect` approach**:

```typescript
// ❌ React 18 pattern — lots of state management
function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/user')
      .then(r => r.json())
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  return <h1>{user.name}</h1>;
}

// ✅ React 19 pattern — let Suspense handle it
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <h1>{user.name}</h1>;
}
```

### Reading Context with `use()`

`use()` can also read Context — and unlike `useContext`, it works inside conditionals and loops:

```typescript
import { use, createContext } from 'react';

const ThemeContext = createContext<'light' | 'dark'>('light');

function ThemedButton({ showIcon }: { showIcon: boolean }) {
  // ✅ use() works in conditionals — useContext does NOT
  if (showIcon) {
    const theme = use(ThemeContext);
    return <button className={`btn-${theme}`}>🎨 Themed</button>;
  }

  return <button>Plain</button>;
}
```

> **🔵 .NET Analogy**: `use()` is like dependency injection's `IServiceProvider.GetRequiredService<T>()` — you can call it anywhere, not just in constructors. Meanwhile, `useContext` is like constructor injection — restricted to the top level.

---

## 4. React Compiler — Automatic Optimization

### What is the React Compiler?

The React Compiler (previously called "React Forget") is a **build-time tool** that automatically optimizes your components by adding memoization. It does what you previously had to do manually with `useMemo`, `useCallback`, and `React.memo`.

### Before vs After

```typescript
// ❌ React 18: Manual optimization
import { memo, useMemo, useCallback } from 'react';

const ExpensiveList = memo(function ExpensiveList({
  items,
  onSelect,
}: {
  items: Item[];
  onSelect: (id: string) => void;
}) {
  const sorted = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  return sorted.map(item => (
    <ItemRow key={item.id} item={item} onSelect={onSelect} />
  ));
});

function ParentComponent() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Must wrap in useCallback to prevent re-renders
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return <ExpensiveList items={items} onSelect={handleSelect} />;
}
```

```typescript
// ✅ React 19 with Compiler: Just write normal code
function ExpensiveList({
  items,
  onSelect,
}: {
  items: Item[];
  onSelect: (id: string) => void;
}) {
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));

  return sorted.map(item => (
    <ItemRow key={item.id} item={item} onSelect={onSelect} />
  ));
}

function ParentComponent() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // No useCallback needed — the compiler handles it
  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  return <ExpensiveList items={items} onSelect={handleSelect} />;
}
```

**The compiler automatically**:
- Memoizes component output (like `React.memo`)
- Memoizes expensive computations (like `useMemo`)
- Creates stable function references (like `useCallback`)
- Only re-renders what actually changed

### Enabling the React Compiler

For Vite projects:

```bash
npm install --save-dev babel-plugin-react-compiler
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
});
```

### When You Still Need Manual Optimization

The compiler handles **most** cases, but you may still want manual control for:

| Scenario | Compiler Handles? | Notes |
|----------|:-:|-------|
| Preventing child re-renders | ✅ | No `React.memo` needed |
| Stable callback references | ✅ | No `useCallback` needed |
| Expensive computations | ✅ | No `useMemo` needed |
| Web Workers | ❌ | Still need manual offloading |
| Virtualization (`react-window`) | ❌ | Layout-level optimization |
| Code splitting (`React.lazy`) | ❌ | Bundle-level optimization |

> **🔵 .NET Analogy**: The React Compiler is like the JIT compiler + PGO (Profile-Guided Optimization) in .NET. The JIT automatically optimizes hot paths without you writing manual cache code. You *can* still use `Span<T>` or `ArrayPool<T>` for extreme cases, but the runtime handles most optimization.

---

## 5. Ref Improvements

### Refs as Props (No More `forwardRef`)

In React 19, `ref` is just a regular prop — no need for the `forwardRef` wrapper:

```typescript
// ❌ React 18: Required forwardRef
import { forwardRef } from 'react';

const TextInput = forwardRef<HTMLInputElement, { label: string }>(
  function TextInput({ label }, ref) {
    return (
      <label>
        {label}
        <input ref={ref} />
      </label>
    );
  }
);

// ✅ React 19: ref is just a prop
function TextInput({ label, ref }: {
  label: string;
  ref?: React.Ref<HTMLInputElement>;
}) {
  return (
    <label>
      {label}
      <input ref={ref} />
    </label>
  );
}

// Usage is the same
function Form() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <TextInput label="Name" ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>
        Focus Input
      </button>
    </div>
  );
}
```

### Cleanup Functions in Refs

Refs can now return a cleanup function, similar to `useEffect`:

```typescript
function VideoPlayer({ src }: { src: string }) {
  return (
    <video
      ref={(element) => {
        if (element) {
          // Setup: called when the element mounts
          element.play();
        }

        // Cleanup: called when the element unmounts
        return () => {
          element?.pause();
          element?.removeAttribute('src');
        };
      }}
      src={src}
    />
  );
}
```

> **🔵 .NET Analogy**: Ref cleanup is like `IDisposable.Dispose()` — you set up a resource when it's created and clean it up when it's removed.

---

## 6. Document Metadata

React 19 lets you render `<title>`, `<meta>`, and `<link>` tags from **any component** — they're hoisted to `<head>` automatically:

```typescript
function BlogPost({ post }: { post: Post }) {
  return (
    <article>
      {/* These are hoisted to <head> automatically */}
      <title>{post.title} | My Blog</title>
      <meta name="description" content={post.excerpt} />
      <meta property="og:title" content={post.title} />
      <link rel="canonical" href={`https://myblog.com/posts/${post.slug}`} />

      {/* Normal content */}
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

**Before React 19**, you needed libraries like `react-helmet` or `react-helmet-async` for this. Now it's built-in.

> **🔵 .NET Analogy**: Like Blazor's `<PageTitle>` and `<HeadContent>` components in .NET 6+.

---

## 7. `<Activity />` Component (React 19.2)

### Preserving Hidden UI State

`<Activity />` lets you hide parts of your UI without destroying them. When content becomes hidden, its state is preserved and it can be quickly shown again.

```typescript
import { Activity, useState } from 'react';

function TabPanel() {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');

  return (
    <div>
      <nav>
        <button onClick={() => setActiveTab('profile')}>Profile</button>
        <button onClick={() => setActiveTab('settings')}>Settings</button>
      </nav>

      {/* Both tabs are always rendered — hidden ones preserve their state */}
      <Activity mode={activeTab === 'profile' ? 'visible' : 'hidden'}>
        <ProfileTab />
        {/* Form inputs, scroll position, etc. are preserved! */}
      </Activity>

      <Activity mode={activeTab === 'settings' ? 'visible' : 'hidden'}>
        <SettingsTab />
      </Activity>
    </div>
  );
}
```

### How `<Activity />` Works

| Mode | DOM | State | Effects | CSS |
|------|-----|-------|---------|-----|
| `'visible'` | Present, visible | ✅ Preserved | Running | Normal |
| `'hidden'` | Present, hidden via `display: none` | ✅ Preserved | Paused | `display: none !important` |

**Use cases**:
- **Tab panels**: Preserve form state when switching tabs
- **Routing**: Pre-render the next route in the background
- **Wizards/Steppers**: Keep previous steps' state intact
- **Modals**: Keep background content alive

### Before vs After

```typescript
// ❌ Without Activity — state is lost when switching tabs
{activeTab === 'profile' && <ProfileTab />}  // Unmounts when hidden!

// ✅ With Activity — state is preserved
<Activity mode={activeTab === 'profile' ? 'visible' : 'hidden'}>
  <ProfileTab />  {/* State survives tab switches */}
</Activity>
```

> **🔵 .NET Analogy**: Like a `ViewState` in ASP.NET WebForms — the component's state is preserved even when it's not actively displayed. Or in WPF, like `Visibility.Collapsed` vs removing the element entirely.

---

## 8. Server Components Overview

### What Are Server Components?

Server Components execute on the server and send HTML to the client. They can:
- Directly access databases and file systems
- Use `async/await` at the component level
- Reduce JavaScript bundle size (their code doesn't ship to the client)

```typescript
// ✅ Server Component (default in frameworks like Next.js)
// This code NEVER reaches the browser
async function UserList() {
  const users = await db.query('SELECT * FROM users');

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Directives: `'use client'` and `'use server'`

```typescript
// ---- server-component.tsx (default) ----
// Runs on the server. Can fetch data, access DB, etc.
// Cannot use hooks like useState, useEffect, event handlers

import { ClientButton } from './client-button';

async function Dashboard() {
  const stats = await fetchDashboardStats();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Total Users: {stats.userCount}</p>

      {/* Client component — handles interactivity */}
      <ClientButton label="Refresh" />
    </div>
  );
}

// ---- client-button.tsx ----
'use client';  // ← This directive marks it as a client component

import { useState } from 'react';

export function ClientButton({ label }: { label: string }) {
  const [clicked, setClicked] = useState(false);

  return (
    <button onClick={() => setClicked(true)}>
      {clicked ? '✓ Done' : label}
    </button>
  );
}
```

### `'use server'` — Server Actions

```typescript
// ---- actions.ts ----
'use server';

// This function runs on the server but can be called from client components
export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  // Direct database access — this code doesn't ship to the client
  await db.insert('users', { name, email });

  return { success: true };
}

// ---- client form ----
'use client';

import { createUser } from './actions';

function CreateUserForm() {
  return (
    <form action={createUser}>
      <input name="name" />
      <input name="email" type="email" />
      <button type="submit">Create User</button>
    </form>
  );
}
```

### When to Use What

| Feature | Server Component | Client Component |
|---------|:---:|:---:|
| Fetch data | ✅ | ⚠️ Use hooks |
| Access backend (DB, filesystem) | ✅ | ❌ |
| Use hooks (`useState`, `useEffect`) | ❌ | ✅ |
| Event handlers (`onClick`, etc.) | ❌ | ✅ |
| Reduces JS bundle | ✅ | ❌ |
| SEO-friendly rendering | ✅ | Needs SSR |

> **🔵 .NET Analogy**: Server Components are like **Razor Pages** or **Blazor Server** — rendering happens on the server, and only HTML goes to the client. Client Components are like **Blazor WebAssembly** — interactive code that runs in the browser.

> **📝 Note for this tutorial**: Server Components require a framework like **Next.js** or a custom server setup. In our Vite-based SPA, all components are client components by default. This section is conceptual — you'll use Server Components when adopting a full-stack React framework.

---

## Summary

### React 19 Feature Quick Reference

| Feature | What It Does | Replaces |
|---------|-------------|----------|
| `useActionState` | Manages form action state (pending, result) | Manual `useState` + `useEffect` |
| `useFormStatus` | Gives child components form status | Prop drilling `isPending` |
| `useOptimistic` | Optimistic UI with auto-rollback | Manual optimistic state |
| `use()` | Reads Promises/Context in render | `useEffect` + `useState` for data |
| React Compiler | Auto-memoization at build time | `useMemo`, `useCallback`, `React.memo` |
| Ref as props | Pass `ref` like any prop | `forwardRef` |
| Ref cleanup | Return cleanup from ref callbacks | `useEffect` for ref cleanup |
| Document metadata | Native `<title>`, `<meta>` in components | `react-helmet` |
| `<Activity />` | Preserve hidden component state | Conditional rendering |
| Server Components | Server-rendered, zero JS shipped | SSR + hydration |

---

## Exercises

### Exercise 1: Feedback Form with Actions ⭐
Convert a traditional form (with `useState` + `onSubmit`) to use `useActionState` and `useFormStatus`.

**Requirements**:
- Form fields: name, email, message
- Show loading state in the submit button
- Display success/error messages from the action
- Create a reusable `SubmitButton` component using `useFormStatus`

### Exercise 2: Optimistic Todo List ⭐⭐
Build a todo list with optimistic updates.

**Requirements**:
- Add todos with optimistic insertion (show immediately, with a "sending" indicator)
- Toggle todo completion with optimistic update
- Delete todos with optimistic removal
- Handle server errors gracefully (auto-rollback)

### Exercise 3: Data Dashboard with `use()` ⭐⭐
Build a dashboard that loads data from multiple endpoints using `use()` and Suspense.

**Requirements**:
- Fetch user data and activity stats in parallel
- Show individual loading skeletons per section
- Use nested `<Suspense>` boundaries for progressive loading
- Compare the code with a `useEffect`-based version

### Exercise 4: Remove Manual Memoization ⭐⭐⭐
Take the performance-optimized components from Unit 8 and strip out all manual `React.memo`, `useMemo`, and `useCallback`. Verify the React Compiler handles it.

**Requirements**:
- Set up `babel-plugin-react-compiler` in `vite.config.ts`
- Remove all `React.memo` wrappers
- Remove all `useMemo` and `useCallback` calls
- Use React DevTools Profiler to verify no unnecessary re-renders

---

## Common Pitfalls

### 1. Calling `useFormStatus` in the Form Component

```typescript
// ❌ This doesn't work — must be a CHILD of <form>
function Form() {
  const { pending } = useFormStatus(); // Always returns pending: false!

  return (
    <form action={myAction}>
      <button disabled={pending}>Submit</button>
    </form>
  );
}

// ✅ Extract button into a child component
function SubmitButton() {
  const { pending } = useFormStatus(); // Works!
  return <button disabled={pending}>Submit</button>;
}
```

### 2. Creating Promises Inside Components

```typescript
// ❌ Creates a new promise every render — infinite suspend loop!
function UserProfile() {
  const user = use(fetch('/api/user').then(r => r.json()));
  return <h1>{user.name}</h1>;
}

// ✅ Create the promise outside or in a parent
const userPromise = fetch('/api/user').then(r => r.json());

function UserProfile() {
  const user = use(userPromise);
  return <h1>{user.name}</h1>;
}
```

### 3. Optimistic State and Error Handling

```typescript
// ❌ Forgetting that optimistic state auto-reverts on error
// Don't try to manually revert — React does it for you
async function deleteItem(id: string) {
  removeOptimistic(id);
  try {
    await api.delete(id);
  } catch {
    // DON'T manually add the item back — React handles this
    // Just show an error notification
    showToast('Failed to delete');
  }
}
```

### 4. Mixing Server and Client Component Patterns

```typescript
// ❌ Can't use hooks in Server Components
async function ServerComponent() {
  const [count, setCount] = useState(0); // ERROR!
  const data = await fetchData();
  return <div>{data}</div>;
}

// ✅ Extract interactivity into Client Components
'use client';
function InteractiveCounter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

---

## Further Reading

- [React 19 Blog Post](https://react.dev/blog/2024/12/05/react-19)
- [React Compiler Documentation](https://react.dev/learn/react-compiler)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [useActionState API Reference](https://react.dev/reference/react/useActionState)
- [useOptimistic API Reference](https://react.dev/reference/react/useOptimistic)
- [use() API Reference](https://react.dev/reference/react/use)

---

**Next Unit**: [Unit 12: Enterprise Third-Party Libraries →](../unit-12-enterprise-libraries/README.md)
