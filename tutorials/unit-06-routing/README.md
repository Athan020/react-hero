# Unit 6: Routing and Navigation

**Time**: 2-3 hours | **Level**: Intermediate

## 🎯 Learning Objectives

By the end of this unit, you will:
- Set up React Router in a TypeScript application
- Create routes and navigate between pages
- Work with URL parameters and query strings
- Implement nested routes with layouts
- Create protected/authenticated routes
- Handle loading states and errors with loaders
- Implement breadcrumbs and navigation guards
- Build a complete multi-page application

## 📚 Table of Contents

1. [Understanding Client-Side Routing](#understanding-client-side-routing)
2. [Setting Up React Router](#setting-up-react-router)
3. [Basic Routing](#basic-routing)
4. [Navigation](#navigation)
5. [URL Parameters](#url-parameters)
6. [Query Parameters](#query-parameters)
7. [Nested Routes and Layouts](#nested-routes-and-layouts)
8. [Protected Routes](#protected-routes)
9. [Data Loading](#data-loading)
10. [Error Handling](#error-handling)
11. [Advanced Patterns](#advanced-patterns)
12. [Exercises](#exercises)
13. [Common Pitfalls](#common-pitfalls)
14. [Further Reading](#further-reading)

---

## Understanding Client-Side Routing

### SPA vs Traditional Routing

**Backend Analogy**: In ASP.NET MVC, routing maps URLs to controllers:

```csharp
// ASP.NET routing
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// When you navigate to /Products/Details/5
// It calls ProductsController.Details(5)
```

In React (SPA), routing happens client-side:
- URL changes don't reload the page
- JavaScript handles navigation
- Components are swapped based on URL

```
Traditional Web App          Single Page App (React)
------------------          ----------------------
/home → Server request      /home → Client-side swap
Server returns HTML         Swap <Home /> component
Full page reload            No reload, instant UI
```

---

## Setting Up React Router

### Installation

```bash
npm install react-router-dom
```

### Basic Setup

```typescript
// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

---

## Basic Routing

### Defining Routes

```typescript
// App.tsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="app">
      <Navbar />
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}
```

### Route Matching

| Path Pattern | Matches | Does Not Match |
|--------------|---------|----------------|
| `/` | `/` | `/about` |
| `/about` | `/about` | `/about/team` |
| `/products/*` | `/products`, `/products/123` | `/product` |
| `/users/:id` | `/users/1`, `/users/abc` | `/users` |
| `*` | Everything (catch-all) | - |

---

## Navigation

### Link Component

```typescript
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/products">Products</Link>
      <Link to="/contact">Contact</Link>
    </nav>
  );
}
```

### NavLink with Active State

```typescript
import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <NavLink 
        to="/"
        className={({ isActive }) => isActive ? 'active' : ''}
      >
        Home
      </NavLink>
      
      <NavLink 
        to="/about"
        className={({ isActive, isPending }) => 
          isPending ? 'pending' : isActive ? 'active' : ''
        }
      >
        About
      </NavLink>
      
      {/* Style function */}
      <NavLink
        to="/products"
        style={({ isActive }) => ({
          fontWeight: isActive ? 'bold' : 'normal',
          color: isActive ? '#3b82f6' : 'inherit',
        })}
      >
        Products
      </NavLink>
    </nav>
  );
}
```

### Programmatic Navigation

```typescript
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await loginUser(credentials);
      
      // Navigate after successful login
      navigate('/dashboard');
      
      // Or navigate with state
      navigate('/dashboard', { state: { from: 'login' } });
      
      // Replace current history entry (no back button)
      navigate('/dashboard', { replace: true });
      
      // Go back/forward
      navigate(-1);  // Go back
      navigate(1);   // Go forward
      
    } catch (error) {
      setError('Login failed');
    }
  };

  return <form onSubmit={handleLogin}>{/* ... */}</form>;
}
```

---

## URL Parameters

### Dynamic Routes

```typescript
// App.tsx
<Routes>
  <Route path="/products" element={<ProductList />} />
  <Route path="/products/:productId" element={<ProductDetail />} />
  <Route path="/users/:userId/posts/:postId" element={<UserPost />} />
</Routes>
```

### Accessing Parameters with useParams

```typescript
import { useParams } from 'react-router-dom';

interface ProductParams {
  productId: string;
}

function ProductDetail() {
  const { productId } = useParams<ProductParams>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    
    fetchProduct(productId)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <Spinner />;
  if (!product) return <NotFound />;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>${product.price}</p>
    </div>
  );
}
```

### Multiple Parameters

```typescript
function UserPost() {
  const { userId, postId } = useParams<{ userId: string; postId: string }>();

  return (
    <div>
      <p>User: {userId}</p>
      <p>Post: {postId}</p>
    </div>
  );
}
```

---

## Query Parameters

### Using useSearchParams

```typescript
import { useSearchParams } from 'react-router-dom';

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read query params
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'name';
  const page = parseInt(searchParams.get('page') || '1');

  // Update query params
  const handleCategoryChange = (newCategory: string) => {
    setSearchParams(prev => {
      prev.set('category', newCategory);
      prev.set('page', '1');  // Reset page when changing category
      return prev;
    });
  };

  const handleSortChange = (newSort: string) => {
    setSearchParams(prev => {
      prev.set('sort', newSort);
      return prev;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', String(newPage));
      return prev;
    });
  };

  return (
    <div>
      <div className="filters">
        <select value={category} onChange={e => handleCategoryChange(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
        </select>
        
        <select value={sort} onChange={e => handleSortChange(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="rating">Sort by Rating</option>
        </select>
      </div>
      
      {/* Product list */}
      
      <Pagination currentPage={page} onPageChange={handlePageChange} />
    </div>
  );
}
```

---

## Nested Routes and Layouts

### Layout Pattern

```typescript
// App.tsx
function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      
      {/* Dashboard with nested routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

### Layout Component with Outlet

```typescript
import { Outlet, NavLink } from 'react-router-dom';

function DashboardLayout() {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <nav>
          <NavLink to="/dashboard" end>Overview</NavLink>
          <NavLink to="/dashboard/analytics">Analytics</NavLink>
          <NavLink to="/dashboard/users">Users</NavLink>
          <NavLink to="/dashboard/settings">Settings</NavLink>
        </nav>
      </aside>
      
      <main className="content">
        {/* Child routes render here */}
        <Outlet />
      </main>
    </div>
  );
}
```

### Passing Data to Outlets

```typescript
import { Outlet, useOutletContext } from 'react-router-dom';

interface DashboardContext {
  user: User;
  notifications: Notification[];
}

function DashboardLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const contextValue: DashboardContext = {
    user: user!,
    notifications,
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <main>
        <Outlet context={contextValue} />
      </main>
    </div>
  );
}

// Child component
function Analytics() {
  const { user, notifications } = useOutletContext<DashboardContext>();

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>You have {notifications.length} notifications</p>
    </div>
  );
}
```

---

## Protected Routes

### Basic Protected Route

```typescript
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
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

### Role-Based Access

```typescript
interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user!.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Usage
<Route
  path="/admin"
  element={
    <RoleRoute allowedRoles={['admin', 'superadmin']}>
      <AdminPanel />
    </RoleRoute>
  }
/>
```

### Redirect After Login

```typescript
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the page user was trying to visit
  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';

  const handleLogin = async (credentials: Credentials) => {
    await login(credentials);
    navigate(from, { replace: true });
  };

  return (
    <form onSubmit={handleFormSubmit}>
      {from !== '/dashboard' && (
        <p>Please log in to access {from}</p>
      )}
      {/* Login form fields */}
    </form>
  );
}
```

---

## Data Loading

### Using Loaders (React Router 6.4+)

```typescript
import { createBrowserRouter, RouterProvider, useLoaderData } from 'react-router-dom';

// Define loader function
async function productLoader({ params }: { params: { productId: string } }) {
  const response = await fetch(`/api/products/${params.productId}`);
  if (!response.ok) {
    throw new Response('Product not found', { status: 404 });
  }
  return response.json();
}

// Create router with loaders
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '', element: <Home /> },
      {
        path: 'products/:productId',
        element: <ProductDetail />,
        loader: productLoader,
      },
    ],
  },
]);

// App component
function App() {
  return <RouterProvider router={router} />;
}

// Component using loader data
function ProductDetail() {
  const product = useLoaderData() as Product;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}
```

### Loading States with useNavigation

```typescript
import { useNavigation } from 'react-router-dom';

function Layout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <div>
      <Navbar />
      {isLoading && <LoadingBar />}
      <main className={isLoading ? 'loading' : ''}>
        <Outlet />
      </main>
    </div>
  );
}
```

---

## Error Handling

### Error Boundary for Routes

```typescript
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

function ErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div className="error-page">
          <h1>404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <Link to="/">Go Home</Link>
        </div>
      );
    }

    if (error.status === 401) {
      return (
        <div className="error-page">
          <h1>401 - Unauthorized</h1>
          <p>You need to be logged in to access this page.</p>
          <Link to="/login">Login</Link>
        </div>
      );
    }

    return (
      <div className="error-page">
        <h1>{error.status} - {error.statusText}</h1>
        <p>{error.data}</p>
      </div>
    );
  }

  return (
    <div className="error-page">
      <h1>Something went wrong</h1>
      <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
    </div>
  );
}

// Use in router
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [/* routes */],
  },
]);
```

---

## Advanced Patterns

### Breadcrumbs

```typescript
import { Link, useMatches } from 'react-router-dom';

interface RouteHandle {
  crumb: (data?: unknown) => string;
}

function Breadcrumbs() {
  const matches = useMatches();
  
  const crumbs = matches
    .filter(match => Boolean((match.handle as RouteHandle)?.crumb))
    .map(match => ({
      path: match.pathname,
      crumb: (match.handle as RouteHandle).crumb(match.data),
    }));

  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumbs">
        {crumbs.map((crumb, index) => (
          <li key={crumb.path}>
            {index < crumbs.length - 1 ? (
              <Link to={crumb.path}>{crumb.crumb}</Link>
            ) : (
              <span aria-current="page">{crumb.crumb}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Define crumbs in routes
const router = createBrowserRouter([
  {
    path: '/',
    handle: { crumb: () => 'Home' },
    element: <Layout />,
    children: [
      {
        path: 'products',
        handle: { crumb: () => 'Products' },
        element: <Products />,
      },
      {
        path: 'products/:id',
        handle: { crumb: (data: Product) => data.name },
        loader: productLoader,
        element: <ProductDetail />,
      },
    ],
  },
]);
```

### Scroll Restoration

```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Add to app
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>{/* ... */}</Routes>
    </BrowserRouter>
  );
}
```

---

## Exercises

### Exercise 1: Multi-Page Website

**Task**: Create a marketing website with 5 pages.

**Requirements**:
- Home, About, Services, Portfolio, Contact pages
- Active link highlighting in navbar
- 404 page for unknown routes
- Smooth scroll to top on navigation

---

### Exercise 2: E-Commerce Product Pages

**Task**: Build product listing and detail pages.

**Requirements**:
- `/products` - List all products
- `/products/:id` - Product details
- Query params for filtering/sorting
- Breadcrumb navigation

---

### Exercise 3: Dashboard with Nested Routes

**Task**: Create an admin dashboard.

**Requirements**:
- Sidebar navigation
- Nested routes: Overview, Users, Settings
- Protected routes (login required)
- Role-based access (admin only)

---

### Exercise 4: Search with URL State

**Task**: Build a search page with URL-persisted filters.

**Requirements**:
- Search query in URL (`?q=...`)
- Pagination in URL (`?page=2`)
- Filters in URL (`?category=...&sort=...`)
- Back/forward preserves state

---

## Common Pitfalls

### 1. Missing BrowserRouter

```typescript
// ❌ Error: useNavigate() may be used only in the context of a <Router>
function App() {
  return <MyComponent />;
}

// ✅ Wrap with BrowserRouter
function App() {
  return (
    <BrowserRouter>
      <MyComponent />
    </BrowserRouter>
  );
}
```

### 2. Routes vs Route

```typescript
// ❌ Route directly inside BrowserRouter
<BrowserRouter>
  <Route path="/" element={<Home />} />
</BrowserRouter>

// ✅ Wrap Routes around Route
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
  </Routes>
</BrowserRouter>
```

### 3. Forgetting `end` on NavLink

```typescript
// ❌ "/" is active for all routes!
<NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
  Home
</NavLink>

// ✅ Use 'end' to match exactly
<NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
  Home
</NavLink>
```

### 4. useParams Returns Strings

```typescript
// ❌ userId is string, not number
const { userId } = useParams<{ userId: string }>();
fetchUser(userId);  // API might expect number

// ✅ Convert as needed
const { userId } = useParams<{ userId: string }>();
fetchUser(parseInt(userId!, 10));
```

---

## Further Reading

- [React Router Documentation](https://reactrouter.com/en/main)
- [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)
- [React Router Examples](https://reactrouter.com/en/main/start/examples)

---

## Next Steps

Continue to [Unit 7: Advanced State Management](../unit-07-advanced-state/README.md)!
