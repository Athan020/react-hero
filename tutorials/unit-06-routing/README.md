# Unit 6: Routing and Navigation

**Time**: 2-3 hours | **Level**: Intermediate

## 🎯 Learning Objectives

- Set up React Router in your application
- Create routes and navigate between pages
- Use URL parameters and query strings
- Implement nested routes
- Create protected/private routes
- Handle 404 pages

## Setup

```bash
npm install react-router-dom
```

## Key Topics

### 1. Basic Routing

```typescript
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 2. URL Parameters

```typescript
// Route definition
<Route path="/users/:id" element={<UserProfile />} />

// Component
import { useParams } from 'react-router-dom';

function UserProfile() {
  const { id } = useParams<{ id: string }>();
  
  return <div>User ID: {id}</div>;
}
```

### 3. Programmatic Navigation

```typescript
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // After successful login
    navigate('/dashboard');
    // Or go back
    navigate(-1);
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

### 4. Protected Routes

```typescript
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuth(); // Your auth logic

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Usage
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

### 5. Nested Routes

```typescript
function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

import { Outlet } from 'react-router-dom';

function DashboardLayout() {
  return (
    <div>
      <nav>
        <Link to="/dashboard">Home</Link>
        <Link to="/dashboard/profile">Profile</Link>
        <Link to="/dashboard/settings">Settings</Link>
      </nav>
      <Outlet /> {/* Nested routes render here */}
    </div>
  );
}
```

### 6. Query Parameters

```typescript
import { useSearchParams } from 'react-router-dom';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const query = searchParams.get('q') || '';
  const page = searchParams.get('page') || '1';

  const updateSearch = (newQuery: string) => {
    setSearchParams({ q: newQuery, page: '1' });
  };

  return (
    <div>
      <input 
        value={query} 
        onChange={e => updateSearch(e.target.value)} 
      />
      <p>Searching for: {query}</p>
      <p>Page: {page}</p>
    </div>
  );
}
```

## Exercises

1. **Multi-Page App**: Create app with Home, About, Products, Contact pages
2. **Product Catalog**: List products, click to view details (dynamic routes)
3. **Admin Panel**: Protected routes for admin users
4. **Breadcrumbs**: Create breadcrumb navigation component

## Next Steps

Continue to [Unit 7: Advanced State Management](../unit-07-advanced-state/README.md)!
