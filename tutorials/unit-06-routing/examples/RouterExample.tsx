// Unit 6 Example: Complete Router Setup with Protected Routes
// Demonstrates routing, auth guards, and nested layouts

import {
    createBrowserRouter,
    RouterProvider,
    Outlet,
    Link,
    NavLink,
    Navigate,
    useLocation,
    useParams,
    useNavigate
} from 'react-router-dom';
import { createContext, useContext, useState, ReactNode } from 'react';

// ============================================
// Auth Context (simplified)
// ============================================

interface AuthContextType {
    user: { id: number; name: string; role: string } | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}

function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthContextType['user']>(null);

    const login = async (email: string, _password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setUser({ id: 1, name: email.split('@')[0], role: 'admin' });
    };

    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// ============================================
// Protected Route Component
// ============================================

function ProtectedRoute({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

// ============================================
// Layout Components
// ============================================

function RootLayout() {
    const { user, logout } = useAuth();

    return (
        <div className="app">
            <header>
                <nav>
                    <NavLink to="/" end>Home</NavLink>
                    <NavLink to="/products">Products</NavLink>
                    {user ? (
                        <>
                            <NavLink to="/dashboard">Dashboard</NavLink>
                            <button onClick={logout}>Logout ({user.name})</button>
                        </>
                    ) : (
                        <NavLink to="/login">Login</NavLink>
                    )}
                </nav>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    );
}

function DashboardLayout() {
    return (
        <div className="dashboard">
            <aside>
                <nav>
                    <NavLink to="/dashboard" end>Overview</NavLink>
                    <NavLink to="/dashboard/users">Users</NavLink>
                    <NavLink to="/dashboard/settings">Settings</NavLink>
                </nav>
            </aside>
            <section className="dashboard-content">
                <Outlet />
            </section>
        </div>
    );
}

// ============================================
// Page Components
// ============================================

function HomePage() {
    return (
        <div>
            <h1>Welcome to React Router Demo</h1>
            <p>Navigate using the links above.</p>
        </div>
    );
}

function ProductsPage() {
    const products = [
        { id: 1, name: 'Product A' },
        { id: 2, name: 'Product B' },
        { id: 3, name: 'Product C' },
    ];

    return (
        <div>
            <h1>Products</h1>
            <ul>
                {products.map(p => (
                    <li key={p.id}>
                        <Link to={`/products/${p.id}`}>{p.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();

    return (
        <div>
            <h1>Product Detail</h1>
            <p>Viewing product ID: {id}</p>
            <Link to="/products">← Back to Products</Link>
        </div>
    );
}

function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login('demo@example.com', 'password');
        navigate(from, { replace: true });
    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <button type="submit">Login as Demo User</button>
            </form>
        </div>
    );
}

function DashboardOverview() {
    const { user } = useAuth();
    return <h2>Welcome to Dashboard, {user?.name}!</h2>;
}

function DashboardUsers() {
    return <h2>User Management</h2>;
}

function DashboardSettings() {
    return <h2>Settings</h2>;
}

function NotFoundPage() {
    return (
        <div>
            <h1>404 - Page Not Found</h1>
            <Link to="/">Go Home</Link>
        </div>
    );
}

// ============================================
// Router Configuration
// ============================================

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'products', element: <ProductsPage /> },
            { path: 'products/:id', element: <ProductDetailPage /> },
            { path: 'login', element: <LoginPage /> },
            {
                path: 'dashboard',
                element: (
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                ),
                children: [
                    { index: true, element: <DashboardOverview /> },
                    { path: 'users', element: <DashboardUsers /> },
                    { path: 'settings', element: <DashboardSettings /> },
                ],
            },
            { path: '*', element: <NotFoundPage /> },
        ],
    },
]);

// ============================================
// App Component
// ============================================

export function RouterExample() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}

export default RouterExample;
