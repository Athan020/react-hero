# Unit 9: Testing

**Time**: 3-4 hours | **Level**: Intermediate-Advanced

## 🎯 Learning Objectives

- Set up Vitest for unit testing
- Test React components with React Testing Library
- Write effective component tests
- Mock API calls and dependencies
- Test custom hooks
- Introduction to E2E testing with Playwright

## Setup

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

**src/test/setup.ts**:
```typescript
import '@testing-library/jest-dom';
```

## Key Topics

### 1. Basic Component Test

```typescript
// Button.tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
}

function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

export default Button;

// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders with correct label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Testing User Interactions

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

describe('Counter', () => {
  it('increments count when button is clicked', async () => {
    const user = userEvent.setup();
    render(<Counter />);
    
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
    
    await user.click(screen.getByText('Increment'));
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});
```

### 3. Testing Async Components

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user</div>;
  
  return <div>{user.name}</div>;
}

describe('UserProfile', () => {
  it('displays user name after loading', async () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ id: 1, name: 'John Doe' }),
      })
    ) as any;

    render(<UserProfile userId={1} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

### 4. Testing Custom Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  return { count, increment, decrement };
}

describe('useCounter', () => {
  it('initializes with correct value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter(0));
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

### 5. Mocking API Calls

```typescript
import { vi } from 'vitest';

// Mock entire module
vi.mock('./api', () => ({
  fetchUsers: vi.fn(() => Promise.resolve([
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ]))
}));

// Mock fetch
global.fetch = vi.fn((url) => {
  if (url.includes('/users')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1, name: 'John' }])
    });
  }
  return Promise.reject(new Error('Not found'));
}) as any;
```

### 6. E2E Testing with Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
// e2e/example.spec.ts
import { test, expect } from '@playwright/test';

test('user can add todo', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  await page.fill('input[placeholder="Add todo"]', 'Buy milk');
  await page.click('button:has-text("Add")');
  
  await expect(page.locator('text=Buy milk')).toBeVisible();
});
```

## Testing Best Practices

- ✅ Test user behavior, not implementation
- ✅ Use semantic queries (getByRole, getByLabelText)
- ✅ Test accessibility
- ✅ Mock external dependencies
- ✅ Keep tests simple and focused
- ✅ Use descriptive test names
- ✅ Aim for high coverage on critical paths

## Exercises

1. **Test Todo List**: Write tests for add, delete, toggle
2. **Test Form Validation**: Test error messages and submission
3. **Test API Integration**: Mock API calls and test loading/error states
4. **E2E Test**: Write Playwright test for complete user flow

## Next Steps

Continue to [Unit 10: Final Project](../unit-10-final-project/README.md)!
