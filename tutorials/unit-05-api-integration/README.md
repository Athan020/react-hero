# Unit 5: API Integration and Data Fetching

**Time**: 3 hours | **Level**: Intermediate

## 🎯 Learning Objectives

- Fetch data from REST APIs
- Handle loading and error states
- Use async/await in React
- Implement React Query/TanStack Query
- Understand CORS and environment variables
- Create reusable data fetching hooks

## Key Topics

### 1. Fetch API

```typescript
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
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      })
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 2. Axios

```bash
npm install axios
```

```typescript
import axios from 'axios';

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get<User[]>('https://jsonplaceholder.typicode.com/users')
      .then(response => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // ... render logic
}
```

### 3. Custom useFetch Hook

```typescript
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

// Usage
function UserList() {
  const { data: users, loading, error } = useFetch<User[]>(
    'https://jsonplaceholder.typicode.com/users'
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!users) return <div>No data</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 4. React Query / TanStack Query

```bash
npm install @tanstack/react-query
```

```typescript
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserList />
    </QueryClientProvider>
  );
}

function UserList() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {users.map((user: User) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 5. POST Requests

```typescript
async function createUser(userData: Omit<User, 'id'>) {
  const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
}

function CreateUser() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newUser = await createUser({ name, email: `${name}@example.com` });
      console.log('Created:', newUser);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

### 6. Environment Variables

```bash
# .env
VITE_API_URL=https://api.example.com
VITE_API_KEY=your-api-key
```

```typescript
const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

fetch(`${API_URL}/users`, {
  headers: {
    'Authorization': `Bearer ${API_KEY}`
  }
});
```

### 7. Error Handling

```typescript
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function fetchWithErrorHandling<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new APIError(response.status, `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      // Handle API errors
      console.error('API Error:', error.status, error.message);
    } else if (error instanceof TypeError) {
      // Handle network errors
      console.error('Network Error:', error.message);
    }
    throw error;
  }
}
```

## Exercises

1. **User Dashboard**: Fetch and display users with search/filter
2. **CRUD Operations**: Create, read, update, delete posts
3. **Infinite Scroll**: Load more data as user scrolls
4. **Optimistic Updates**: Update UI before API response

## Best Practices

- Always handle loading and error states
- Use TypeScript for API responses
- Create reusable data fetching hooks
- Use React Query for complex data fetching
- Implement proper error boundaries
- Cache API responses when appropriate
- Use environment variables for API URLs

## Next Steps

Continue to [Unit 6: Routing and Navigation](../unit-06-routing/README.md)!
