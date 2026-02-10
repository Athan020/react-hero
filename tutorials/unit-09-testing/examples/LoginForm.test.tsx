// Unit 9 Example: Testing React Components
// Complete test file with Vitest + React Testing Library

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// ============================================
// Component to Test
// ============================================

interface User {
    id: number;
    name: string;
    email: string;
}

interface LoginFormProps {
    onSuccess: (user: User) => void;
    onError?: (error: string) => void;
}

function LoginForm({ onSuccess, onError }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Login failed');
            }

            const user = await response.json();
            onSuccess(user);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
            onError?.(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>

            {error && (
                <div role="alert" className="error">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                />
            </div>

            <div>
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                />
            </div>

            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
}

// Need useState import for the component
import { useState } from 'react';

// ============================================
// MSW Server Setup
// ============================================

const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
};

const handlers = [
    http.post('/api/login', async ({ request }) => {
        const { email, password } = (await request.json()) as {
            email: string;
            password: string;
        };

        if (email === 'john@example.com' && password === 'password123') {
            return HttpResponse.json(mockUser);
        }

        return HttpResponse.json(
            { message: 'Invalid credentials' },
            { status: 401 }
        );
    }),
];

const server = setupServer(...handlers);

// ============================================
// Tests
// ============================================

describe('LoginForm', () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    it('renders login form', () => {
        render(<LoginForm onSuccess={vi.fn()} />);

        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('allows user to type in inputs', async () => {
        const user = userEvent.setup();
        render(<LoginForm onSuccess={vi.fn()} />);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'mypassword');

        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('mypassword');
    });

    it('shows loading state during submission', async () => {
        const user = userEvent.setup();
        render(<LoginForm onSuccess={vi.fn()} />);

        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /login/i }));

        expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
    });

    it('calls onSuccess with user data on successful login', async () => {
        const user = userEvent.setup();
        const handleSuccess = vi.fn();
        render(<LoginForm onSuccess={handleSuccess} />);

        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(handleSuccess).toHaveBeenCalledWith(mockUser);
        });
    });

    it('displays error message on failed login', async () => {
        const user = userEvent.setup();
        render(<LoginForm onSuccess={vi.fn()} />);

        await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
        await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
        await user.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
        });
    });

    it('calls onError callback on failed login', async () => {
        const user = userEvent.setup();
        const handleError = vi.fn();
        render(<LoginForm onSuccess={vi.fn()} onError={handleError} />);

        await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
        await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
        await user.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(handleError).toHaveBeenCalledWith('Invalid credentials');
        });
    });

    it('disables inputs during loading', async () => {
        const user = userEvent.setup();
        render(<LoginForm onSuccess={vi.fn()} />);

        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password123');
        await user.click(screen.getByRole('button', { name: /login/i }));

        expect(screen.getByLabelText(/email/i)).toBeDisabled();
        expect(screen.getByLabelText(/password/i)).toBeDisabled();
    });
});

// ============================================
// Testing Custom Hooks
// ============================================

import { renderHook, act } from '@testing-library/react';

function useCounter(initialValue = 0) {
    const [count, setCount] = useState(initialValue);

    const increment = () => setCount((c) => c + 1);
    const decrement = () => setCount((c) => c - 1);
    const reset = () => setCount(initialValue);

    return { count, increment, decrement, reset };
}

describe('useCounter', () => {
    it('starts with initial value', () => {
        const { result } = renderHook(() => useCounter(10));
        expect(result.current.count).toBe(10);
    });

    it('increments counter', () => {
        const { result } = renderHook(() => useCounter(0));

        act(() => {
            result.current.increment();
        });

        expect(result.current.count).toBe(1);
    });

    it('decrements counter', () => {
        const { result } = renderHook(() => useCounter(5));

        act(() => {
            result.current.decrement();
        });

        expect(result.current.count).toBe(4);
    });

    it('resets to initial value', () => {
        const { result } = renderHook(() => useCounter(10));

        act(() => {
            result.current.increment();
            result.current.increment();
            result.current.reset();
        });

        expect(result.current.count).toBe(10);
    });
});

export { LoginForm };
