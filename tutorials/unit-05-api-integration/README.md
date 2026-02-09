# Unit 5: API Integration and Data Fetching

**Time**: 3 hours | **Level**: Intermediate

## 🎯 Learning Objectives

By the end of this unit, you will:
- Fetch data from REST APIs using Fetch and Axios
- Handle loading, error, and success states properly
- Understand and implement async/await patterns in React
- Use React Query (TanStack Query) for advanced data fetching
- Create reusable data fetching hooks
- Implement authentication with JWT tokens
- Build a type-safe API client layer
- Handle CORS and environment variables

## 📚 Table of Contents

1. [Understanding Data Fetching in React](#understanding-data-fetching-in-react)
2. [The Fetch API](#the-fetch-api)
3. [Axios](#axios)
4. [Loading, Error, and Success States](#loading-error-and-success-states)
5. [Custom Data Fetching Hooks](#custom-data-fetching-hooks)
6. [React Query / TanStack Query](#react-query--tanstack-query)
7. [API Service Layer](#api-service-layer)
8. [Authentication](#authentication)
9. [Environment Variables](#environment-variables)
10. [Error Handling Patterns](#error-handling-patterns)
11. [Exercises](#exercises)
12. [Common Pitfalls](#common-pitfalls)
13. [Further Reading](#further-reading)

---

## Understanding Data Fetching in React

### The Mental Model

In React, data fetching is a **side effect** that typically happens in:
- `useEffect` hook (for basic fetching)
- Custom hooks (for reusable patterns)
- Data fetching libraries (React Query, SWR)

**Backend Analogy**:
Think of React components as ASP.NET Razor views, and the data fetching layer as your Service/Repository layer:

```
React                          ASP.NET
------                         -------
Component → useEffect      ≈   Controller → Service → Repository
fetch/axios                ≈   HttpClient
React Query                ≈   Repository Pattern + Caching
```

### When to Fetch Data

```
Component Mount → Fetch Data → Update State → Re-render
     ↑                                           |
     |___________________________________________|
                 (if dependencies change)
```

---

## The Fetch API

### Basic GET Request

```typescript
import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: User[] = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // Empty array = run once on mount

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name} - {user.email}</li>
      ))}
    </ul>
  );
}
```

### POST Request

```typescript
interface CreateUserDto {
  name: string;
  email: string;
}

async function createUser(userData: CreateUserDto): Promise<User> {
  const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Usage in component
function CreateUserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newUser = await createUser({ name, email });
      console.log('Created:', newUser);
      // Reset form or redirect
      setName('');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Name"
        disabled={loading}
      />
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

### Cancelling Requests with AbortController

```typescript
function SearchUsers() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Create abort controller for this effect
    const abortController = new AbortController();

    const searchUsers = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(
          `https://api.example.com/users/search?q=${encodeURIComponent(query)}`,
          { signal: abortController.signal }
        );
        
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        setResults(data);
      } catch (err) {
        // Don't update state if request was aborted
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Request aborted');
          return;
        }
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce: wait 300ms before searching
    const timeoutId = setTimeout(searchUsers, 300);

    // Cleanup: cancel request and clear timeout
    return () => {
      abortController.abort();
      clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search users..."
      />
      {loading && <p>Searching...</p>}
      <ul>
        {results.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Axios

Axios provides a more feature-rich HTTP client with interceptors, automatic JSON parsing, and better error handling.

### Installation

```bash
npm install axios
```

### Basic Usage

```typescript
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
}

// GET request
async function getUsers(): Promise<User[]> {
  const response = await axios.get<User[]>(
    'https://jsonplaceholder.typicode.com/users'
  );
  return response.data;  // Axios automatically parses JSON
}

// POST request
async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  const response = await axios.post<User>(
    'https://api.example.com/users',
    userData
  );
  return response.data;
}

// PUT request
async function updateUser(id: number, userData: Partial<User>): Promise<User> {
  const response = await axios.put<User>(
    `https://api.example.com/users/${id}`,
    userData
  );
  return response.data;
}

// DELETE request
async function deleteUser(id: number): Promise<void> {
  await axios.delete(`https://api.example.com/users/${id}`);
}
```

### Creating an Axios Instance

```typescript
// api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/auth/refresh', { refreshToken });
        const { accessToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

**Backend Analogy**: Axios interceptors are like `DelegatingHandler` in .NET HttpClient:

```csharp
// .NET equivalent of interceptors
public class AuthHandler : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, 
        CancellationToken cancellationToken)
    {
        var token = GetAccessToken();
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        
        var response = await base.SendAsync(request, cancellationToken);
        
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            // Handle token refresh
        }
        
        return response;
    }
}
```

---

## Loading, Error, and Success States

### State Machine Pattern

```typescript
type Status = 'idle' | 'loading' | 'success' | 'error';

interface FetchState<T> {
  status: Status;
  data: T | null;
  error: string | null;
}

function UserProfile({ userId }: { userId: string }) {
  const [state, setState] = useState<FetchState<User>>({
    status: 'idle',
    data: null,
    error: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      setState({ status: 'loading', data: null, error: null });

      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user');
        
        const user = await response.json();
        setState({ status: 'success', data: user, error: null });
      } catch (err) {
        setState({
          status: 'error',
          data: null,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    };

    fetchUser();
  }, [userId]);

  // Render based on state
  switch (state.status) {
    case 'idle':
      return null;
    case 'loading':
      return <LoadingSpinner />;
    case 'error':
      return <ErrorMessage message={state.error!} />;
    case 'success':
      return <UserCard user={state.data!} />;
  }
}
```

### Skeleton Loading

```typescript
function UserListWithSkeleton() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="user-list">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton-avatar" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text short" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="user-list">
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

```css
/* Skeleton animation */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.skeleton-text {
  height: 16px;
  margin: 8px 0;
}

.skeleton-text.short {
  width: 60%;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## Custom Data Fetching Hooks

### Generic useFetch Hook

```typescript
// hooks/useFetch.ts
import { useState, useEffect, useCallback } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useFetch<T>(url: string, options?: RequestInit): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const abortController = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        ...options,
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      setData(json);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }

    return () => abortController.abort();
  }, [url, JSON.stringify(options)]);

  useEffect(() => {
    const cleanup = fetchData();
    return cleanup;
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

export default useFetch;

// Usage
function UserList() {
  const { data: users, loading, error, refetch } = useFetch<User[]>(
    'https://api.example.com/users'
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error} <button onClick={refetch}>Retry</button></p>;

  return (
    <ul>
      {users?.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

### useMutation Hook

```typescript
// hooks/useMutation.ts
import { useState, useCallback } from 'react';

interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
): UseMutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setLoading(true);
      setError(null);

      try {
        const result = await mutationFn(variables);
        setData(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { mutate, data, loading, error, reset };
}

export default useMutation;

// Usage
function CreateUserForm() {
  const { mutate, loading, error } = useMutation<User, CreateUserDto>(
    (data) => apiClient.post('/users', data).then(res => res.data)
  );

  const handleSubmit = async (formData: CreateUserDto) => {
    try {
      const newUser = await mutate(formData);
      console.log('Created user:', newUser);
    } catch {
      // Error already set in hook
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      {/* form fields */}
      {error && <p className="error">{error}</p>}
      <button disabled={loading}>
        {loading ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

---

## React Query / TanStack Query

React Query is the gold standard for data fetching in React applications.

### Installation

```bash
npm install @tanstack/react-query
```

### Setup

```typescript
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes (formerly cacheTime)
      retry: 3,
      refetchOnWindowFocus: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### useQuery for Fetching Data

```typescript
import { useQuery } from '@tanstack/react-query';
import apiClient from './api/client';

interface User {
  id: number;
  name: string;
  email: string;
}

// Query function
const fetchUsers = async (): Promise<User[]> => {
  const response = await apiClient.get('/users');
  return response.data;
};

function UserList() {
  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,  // True when refetching in background
  } = useQuery({
    queryKey: ['users'],  // Cache key
    queryFn: fetchUsers,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error.message} />;

  return (
    <div>
      <button onClick={() => refetch()} disabled={isFetching}>
        {isFetching ? 'Refreshing...' : 'Refresh'}
      </button>
      <ul>
        {users?.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### useQuery with Parameters

```typescript
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user', userId],  // Include userId in cache key
    queryFn: () => apiClient.get(`/users/${userId}`).then(res => res.data),
    enabled: !!userId,  // Only fetch if userId exists
  });

  if (isLoading) return <p>Loading user...</p>;
  if (isError) return <p>Failed to load user</p>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### useMutation for Creating/Updating/Deleting

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreateUserForm() {
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: (newUser: CreateUserDto) =>
      apiClient.post('/users', newUser).then(res => res.data),
    
    onSuccess: (newUser) => {
      // Option 1: Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Option 2: Update cache directly (optimistic-like)
      queryClient.setQueryData(['users'], (old: User[] | undefined) => {
        return old ? [...old, newUser] : [newUser];
      });
    },
    
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });

  const handleSubmit = (data: CreateUserDto) => {
    createUserMutation.mutate(data);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      {/* form fields */}
      {createUserMutation.isError && (
        <p className="error">Failed to create user</p>
      )}
      <button disabled={createUserMutation.isPending}>
        {createUserMutation.isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

### Optimistic Updates

```typescript
function TodoItem({ todo }: { todo: Todo }) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: (completed: boolean) =>
      apiClient.patch(`/todos/${todo.id}`, { completed }).then(res => res.data),
    
    // Optimistically update the cache
    onMutate: async (completed) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      
      // Snapshot previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);
      
      // Optimistically update
      queryClient.setQueryData(['todos'], (old: Todo[] | undefined) =>
        old?.map(t => t.id === todo.id ? { ...t, completed } : t)
      );
      
      // Return context with snapshot
      return { previousTodos };
    },
    
    // On error, roll back
    onError: (err, completed, context) => {
      queryClient.setQueryData(['todos'], context?.previousTodos);
    },
    
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return (
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => toggleMutation.mutate(e.target.checked)}
        disabled={toggleMutation.isPending}
      />
      <span className={todo.completed ? 'completed' : ''}>
        {todo.text}
      </span>
    </li>
  );
}
```

**Backend Analogy**: React Query is like combining:
- **Repository Pattern** - Abstracts data access
- **Caching Layer** - Like Redis/MemoryCache in .NET
- **CQRS** - Separate queries (useQuery) and commands (useMutation)

---

## API Service Layer

### Type-Safe API Client

```typescript
// api/types.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// api/users.ts
import apiClient from './client';
import { User, CreateUserDto, UpdateUserDto, PaginatedResponse } from './types';

export const userApi = {
  getAll: async (page = 1, pageSize = 10): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get('/users', {
      params: { page, pageSize },
    });
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  update: async (id: number, data: UpdateUserDto): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  search: async (query: string): Promise<User[]> => {
    const response = await apiClient.get('/users/search', {
      params: { q: query },
    });
    return response.data;
  },
};

// Usage with React Query
function UserList() {
  const { data, isLoading } = useQuery({
    queryKey: ['users', { page: 1 }],
    queryFn: () => userApi.getAll(1, 10),
  });

  // ...
}
```

---

## Authentication

### Auth Context with Token Management

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/client';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/auth/me');
        setUser(response.data);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = response.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const register = async (name: string, email: string, password: string) => {
    await apiClient.post('/auth/register', { name, email, password });
    await login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Usage
function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // Redirect happens automatically via router
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

---

## Environment Variables

### Setting Up Environment Variables

```bash
# .env (local development)
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=My React App

# .env.production (production)
VITE_API_URL=https://api.production.com
VITE_APP_NAME=My React App

# .env.local (local overrides, gitignored)
VITE_API_KEY=my-secret-key
```

### Using Environment Variables

```typescript
// config.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  appName: import.meta.env.VITE_APP_NAME || 'React App',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Usage
import { config } from './config';

const apiClient = axios.create({
  baseURL: config.apiUrl,
});
```

### Type Safety for Environment Variables

```typescript
// vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## Error Handling Patterns

### Custom Error Classes

```typescript
// api/errors.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network error. Please check your connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends ApiError {
  constructor(details: Record<string, string[]>) {
    super(400, 'Validation failed', 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}
```

### Error Boundary Component

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Usage
function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Router />
    </ErrorBoundary>
  );
}
```

---

## Exercises

### Exercise 1: User Dashboard

**Task**: Build a dashboard that displays users with search and pagination.

**Requirements**:
- Fetch users from `https://jsonplaceholder.typicode.com/users`
- Implement search by name
- Add pagination (5 users per page)
- Show loading skeleton while fetching
- Handle errors gracefully

---

### Exercise 2: CRUD Application

**Task**: Build a complete todo application with CRUD operations.

**Requirements**:
- Use React Query for data fetching
- Create, read, update, delete todos
- Implement optimistic updates
- Show loading states for each operation
- Handle offline scenarios

---

### Exercise 3: Infinite Scroll

**Task**: Implement infinite scroll for a list of posts.

**Requirements**:
- Fetch posts in batches of 10
- Load more when scrolling near bottom
- Use Intersection Observer API
- Show loading indicator at bottom
- Handle end of list

---

### Exercise 4: Authentication Flow

**Task**: Implement a complete authentication flow.

**Requirements**:
- Login and register forms
- JWT token storage and refresh
- Protected routes
- Auto-logout on token expiry
- "Remember me" functionality

---

## Common Pitfalls

### 1. Fetching in useEffect Without Cleanup

```typescript
// ❌ Memory leak if component unmounts during fetch
useEffect(() => {
  fetch('/api/data').then(res => res.json()).then(setData);
}, []);

// ✅ Cancel request on unmount
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') throw err;
    });
    
  return () => controller.abort();
}, []);
```

### 2. Not Handling All States

```typescript
// ❌ Missing loading and error states
function UserList() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(setUsers);
  }, []);
  
  return <ul>{users.map(u => <li>{u.name}</li>)}</ul>;
}

// ✅ Handle all states
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ... proper fetch with state handling
  
  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  if (users.length === 0) return <Empty />;
  
  return <ul>{users.map(u => <li>{u.name}</li>)}</ul>;
}
```

### 3. Stale Closures in useEffect

```typescript
// ❌ count is stale inside the effect
const [count, setCount] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setCount(count + 1);  // Always uses initial count (0)
  }, 1000);
  return () => clearInterval(interval);
}, []);  // Empty deps, count is captured once

// ✅ Use functional update
useEffect(() => {
  const interval = setInterval(() => {
    setCount(prev => prev + 1);  // Uses latest count
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

### 4. Race Conditions

```typescript
// ❌ Race condition with multiple rapid requests
useEffect(() => {
  fetch(`/api/users/${userId}`).then(r => r.json()).then(setUser);
}, [userId]);  // If userId changes rapidly, older response may arrive last

// ✅ Cancel previous request or check if still valid
useEffect(() => {
  let isActive = true;
  
  fetch(`/api/users/${userId}`)
    .then(r => r.json())
    .then(user => {
      if (isActive) setUser(user);  // Only update if still active
    });
    
  return () => { isActive = false; };
}, [userId]);
```

### 5. Forgetting to Stringify/Parse

```typescript
// ❌ localStorage stores strings only
localStorage.setItem('user', user);  // Stores "[object Object]"!

// ✅ Serialize objects
localStorage.setItem('user', JSON.stringify(user));
const user = JSON.parse(localStorage.getItem('user') || 'null');
```

---

## Further Reading

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [React Data Fetching Patterns](https://www.robinwieruch.de/react-fetching-data/)
- [JWT Authentication Best Practices](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)
- [Error Handling in React](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

---

## Next Steps

Continue to [Unit 6: Routing and Navigation](../unit-06-routing/README.md)!
