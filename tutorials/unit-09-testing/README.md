# Unit 9: Testing React Applications

**Time**: 3-4 hours | **Level**: Intermediate

## 🎯 Learning Objectives

By the end of this unit, you will:
- Understand the testing philosophy and pyramid
- Set up Vitest and React Testing Library
- Write component tests with proper queries
- Test user interactions and async behavior
- Mock API calls and modules
- Implement integration tests
- Know what to test and what not to test

## 📚 Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Setting Up the Testing Environment](#setting-up-the-testing-environment)
3. [React Testing Library Basics](#react-testing-library-basics)
4. [Queries and Assertions](#queries-and-assertions)
5. [Testing User Interactions](#testing-user-interactions)
6. [Testing Async Code](#testing-async-code)
7. [Mocking](#mocking)
8. [Integration Tests](#integration-tests)
9. [Testing Hooks](#testing-hooks)
10. [Exercises](#exercises)
11. [Common Pitfalls](#common-pitfalls)
12. [Further Reading](#further-reading)

---

## Testing Philosophy

### The Testing Pyramid

```
      /\
     /  \
    / E2E \      ← Few (slow, expensive)
   /--------\
  / Integration \   ← More
 /--------------\
/    Unit Tests   \  ← Many (fast, cheap)
-------------------
```

### What to Test

| Test | Don't Test |
|------|------------|
| User-visible behavior | Implementation details |
| Business logic | Third-party libraries |
| Integrations | CSS/styling |
| Error states | Internal state |
| Edge cases | Private methods |

**Backend Analogy**: Like .NET testing:
```csharp
// .NET test
[Fact]
public async Task CreateUser_ValidData_ReturnsUser()
{
    var result = await _controller.CreateUser(validDto);
    Assert.IsType<OkObjectResult>(result);
}
```

React equivalent:
```typescript
test('creates user when form is submitted', async () => {
  render(<CreateUserForm />);
  await userEvent.type(screen.getByLabelText('Name'), 'John');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText('User created!')).toBeInTheDocument();
});
```

---

## Setting Up the Testing Environment

### Install Dependencies

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Vitest Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
```

### Setup File

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## React Testing Library Basics

### The Philosophy

> The more your tests resemble the way your software is used, the more confidence they can give you.

Test what users see and interact with, not implementation details.

### Basic Test Structure

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## Queries and Assertions

### Query Priority

Use queries in this order (most accessible first):

1. **getByRole** - Accessible to everyone
2. **getByLabelText** - Form fields
3. **getByPlaceholderText** - If no label
4. **getByText** - Non-interactive elements
5. **getByDisplayValue** - Form values
6. **getByTestId** - Last resort

### Query Types

| Type | Throws if not found | Returns |
|------|---------------------|---------|
| `getBy...` | Yes | Element |
| `queryBy...` | No | Element or null |
| `findBy...` | Yes (async) | Promise<Element> |
| `getAllBy...` | Yes | Element[] |
| `queryAllBy...` | No | Element[] |
| `findAllBy...` | Yes (async) | Promise<Element[]> |

### Examples

```typescript
import { render, screen, within } from '@testing-library/react';

function UserCard({ user }: { user: User }) {
  return (
    <div className="user-card">
      <h2>{user.name}</h2>
      <p role="email">{user.email}</p>
      <button>Edit</button>
      <button>Delete</button>
    </div>
  );
}

describe('UserCard', () => {
  const user = { id: 1, name: 'John Doe', email: 'john@example.com' };

  it('displays user information', () => {
    render(<UserCard user={user} />);
    
    // By role (heading)
    expect(screen.getByRole('heading', { name: 'John Doe' })).toBeInTheDocument();
    
    // By text
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    
    // By role (buttons)
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('has accessible edit button', () => {
    render(<UserCard user={user} />);
    
    const editButton = screen.getByRole('button', { name: 'Edit' });
    expect(editButton).toBeEnabled();
  });
});
```

### Common Assertions

```typescript
// Presence
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();

// State
expect(element).toBeEnabled();
expect(element).toBeDisabled();
expect(element).toBeVisible();
expect(element).toHaveValue('text');
expect(element).toBeChecked();

// Content
expect(element).toHaveTextContent('Hello');
expect(element).toHaveAttribute('href', '/home');
expect(element).toHaveClass('active');
expect(element).toHaveStyle({ color: 'red' });

// Accessibility
expect(element).toHaveAccessibleName('Submit form');
expect(element).toHaveAccessibleDescription('Click to submit');
```

---

## Testing User Interactions

### Setting Up userEvent

```typescript
import userEvent from '@testing-library/user-event';

describe('Form', () => {
  it('submits form data', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    
    render(<Form onSubmit={handleSubmit} />);
    
    // Type in input
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    
    // Click button
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com'
    });
  });
});
```

### Common Interactions

```typescript
import userEvent from '@testing-library/user-event';

describe('User Interactions', () => {
  it('types in input', async () => {
    const user = userEvent.setup();
    render(<input aria-label="Name" />);
    
    await user.type(screen.getByLabelText('Name'), 'John');
    expect(screen.getByLabelText('Name')).toHaveValue('John');
  });

  it('clicks elements', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<button onClick={onClick}>Click</button>);
    
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('double clicks', async () => {
    const user = userEvent.setup();
    const onDoubleClick = vi.fn();
    render(<div onDoubleClick={onDoubleClick}>Double click me</div>);
    
    await user.dblClick(screen.getByText('Double click me'));
    expect(onDoubleClick).toHaveBeenCalled();
  });

  it('selects from dropdown', async () => {
    const user = userEvent.setup();
    render(
      <select aria-label="Country">
        <option value="us">United States</option>
        <option value="uk">United Kingdom</option>
      </select>
    );
    
    await user.selectOptions(screen.getByLabelText('Country'), 'uk');
    expect(screen.getByLabelText('Country')).toHaveValue('uk');
  });

  it('checks checkbox', async () => {
    const user = userEvent.setup();
    render(<input type="checkbox" aria-label="Accept terms" />);
    
    await user.click(screen.getByLabelText('Accept terms'));
    expect(screen.getByLabelText('Accept terms')).toBeChecked();
  });

  it('clears and types', async () => {
    const user = userEvent.setup();
    render(<input aria-label="Name" defaultValue="Old value" />);
    
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'New value');
    expect(screen.getByLabelText('Name')).toHaveValue('New value');
  });
});
```

---

## Testing Async Code

### Waiting for Elements

```typescript
import { render, screen, waitFor } from '@testing-library/react';

describe('Async Component', () => {
  it('loads and displays data', async () => {
    render(<UserList />);
    
    // Shows loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for data to load (findBy is async)
    const userItem = await screen.findByText('John Doe');
    expect(userItem).toBeInTheDocument();
    
    // Loading is gone
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('handles errors', async () => {
    // Mock API to fail
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.error();
      })
    );

    render(<UserList />);
    
    await screen.findByText('Error loading users');
  });
});
```

### waitFor for Assertions

```typescript
it('updates after async action', async () => {
  const user = userEvent.setup();
  render(<Counter />);
  
  await user.click(screen.getByRole('button', { name: 'Increment' }));
  
  // Wait for state update
  await waitFor(() => {
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});
```

### waitForElementToBeRemoved

```typescript
it('removes item after delete', async () => {
  const user = userEvent.setup();
  render(<TodoList />);
  
  // Find delete button for first item
  const deleteButton = screen.getAllByRole('button', { name: 'Delete' })[0];
  await user.click(deleteButton);
  
  // Wait for item to be removed
  await waitForElementToBeRemoved(() => 
    screen.queryByText('First Todo')
  );
});
```

---

## Mocking

### Mocking Functions

```typescript
import { vi } from 'vitest';

describe('Component with callbacks', () => {
  it('calls onSubmit with form data', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    
    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

### Mocking Modules

```typescript
import { vi } from 'vitest';

// Mock entire module
vi.mock('../api/users', () => ({
  fetchUsers: vi.fn(() => Promise.resolve([
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ]))
}));

// Or mock specific function
import { fetchUsers } from '../api/users';
vi.mocked(fetchUsers).mockResolvedValue([
  { id: 1, name: 'John' }
]);
```

### MSW (Mock Service Worker)

```bash
npm install -D msw
```

```typescript
// src/test/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Doe', email: 'jane@example.com' }
    ]);
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 3, ...body }, { status: 201 });
  }),

  http.delete('/api/users/:id', ({ params }) => {
    return HttpResponse.json({ message: `User ${params.id} deleted` });
  })
];

// src/test/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// src/test/setup.ts
import { server } from './server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Overriding Handlers Per Test

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '../test/server';

it('handles server error', async () => {
  // Override for this test only
  server.use(
    http.get('/api/users', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  render(<UserList />);
  
  await screen.findByText('Error loading users');
});
```

---

## Integration Tests

### Testing Component with Context

```typescript
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../context/ThemeContext';

function renderWithTheme(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
}

describe('ThemedButton', () => {
  it('uses theme from context', () => {
    renderWithTheme(<ThemedButton>Click me</ThemedButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('theme-light');
  });
});
```

### Custom Render with Providers

```typescript
// src/test/utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### Testing Routes

```typescript
import { render, screen } from '../test/utils';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App Routing', () => {
  it('renders home page on /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByRole('heading', { name: /home/i })).toBeInTheDocument();
  });

  it('renders about page on /about', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByRole('heading', { name: /about/i })).toBeInTheDocument();
  });

  it('renders 404 on unknown route', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-page']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });
});
```

---

## Testing Hooks

### renderHook

```typescript
import { renderHook, act } from '@testing-library/react';
import useCounter from './useCounter';

describe('useCounter', () => {
  it('starts with initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('increments', () => {
    const { result } = renderHook(() => useCounter(0));
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it('decrements', () => {
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
```

### Testing Hooks with Dependencies

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import useUser from './useUser';

describe('useUser', () => {
  it('fetches user data', async () => {
    const { result } = renderHook(() => useUser(1));
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.user).toEqual({
      id: 1,
      name: 'John Doe'
    });
  });
});
```

---

## Exercises

### Exercise 1: Button Component Tests

**Task**: Write tests for a Button component.

**Requirements**:
- Test rendering with children
- Test click handler
- Test disabled state
- Test loading state
- Test different variants (primary, secondary)

---

### Exercise 2: Form Testing

**Task**: Write tests for a login form.

**Requirements**:
- Test initial render
- Test validation errors
- Test successful submission
- Test error handling
- Test loading state during submit

---

### Exercise 3: API Integration Tests

**Task**: Write integration tests for a user list with CRUD operations.

**Requirements**:
- Mock API with MSW
- Test loading state
- Test displaying users
- Test creating new user
- Test deleting user
- Test error states

---

### Exercise 4: Custom Hook Testing

**Task**: Write tests for a useLocalStorage hook.

**Requirements**:
- Test getting initial value
- Test setting value
- Test persistence across rerenders
- Test with different types (string, object, array)

---

## Common Pitfalls

### 1. Not Using async/await

```typescript
// ❌ Test passes before async action completes
it('updates on click', () => {
  render(<Counter />);
  userEvent.click(screen.getByRole('button'));
  expect(screen.getByText('1')).toBeInTheDocument(); // May fail!
});

// ✅ Wait for async actions
it('updates on click', async () => {
  const user = userEvent.setup();
  render(<Counter />);
  await user.click(screen.getByRole('button'));
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

### 2. Testing Implementation Details

```typescript
// ❌ Testing internal state
expect(component.state.isOpen).toBe(true);

// ✅ Testing behavior
expect(screen.getByRole('dialog')).toBeVisible();
```

### 3. Not Cleaning Up

```typescript
// ❌ No cleanup - tests affect each other
afterEach(() => {
  // cleanup is automatic with RTL, but mocks need reset
});

// ✅ Reset mocks
afterEach(() => {
  vi.clearAllMocks();
  server.resetHandlers();
});
```

### 4. Using getBy for Missing Elements

```typescript
// ❌ Throws error if not found
const button = screen.getByText('Submit'); // Throws!

// ✅ Use queryBy when element might not exist
const button = screen.queryByText('Submit');
expect(button).not.toBeInTheDocument();
```

---

## Further Reading

- [Testing Library Docs](https://testing-library.com/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Kent C. Dodds Testing Blog](https://kentcdodds.com/blog?q=testing)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Next Steps

Continue to [Unit 10: Final Project](../unit-10-final-project/README.md)!
