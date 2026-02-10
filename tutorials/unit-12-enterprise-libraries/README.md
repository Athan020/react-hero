# Unit 12: Enterprise Third-Party Libraries

> **Time**: ~3-4 hours | **Level**: Intermediate-Advanced
>
> Learn the libraries that power real-world enterprise React applications — Zod, date-fns, clsx/CVA, advanced Zustand, error boundaries, and internationalization.

---

## Prerequisites

- Completed Units 1-10 (especially Unit 4: Forms and Unit 7: State Management)
- Familiarity with Zod basics (introduced in Unit 4)
- Understanding of Zustand basics (introduced in Unit 7)

## What You'll Learn

- ✅ **Zod** advanced patterns for API validation, environment config, and schema composition
- ✅ **date-fns** for modern, tree-shakeable date manipulation
- ✅ **clsx** and **CVA** for dynamic CSS class composition
- ✅ **Zustand** middleware, slices, and persistence patterns
- ✅ **react-error-boundary** for graceful error handling
- ✅ **i18next** for internationalization
- ✅ Environment & feature flag configuration patterns

---

## 1. Zod Advanced Patterns

Unit 4 introduced Zod for form validation. Here we go much deeper — Zod is the **backbone** of type-safe enterprise applications.

### Installation

```bash
npm install zod
```

### API Response Validation

**Never trust API data.** Validate responses before they enter your app:

```typescript
import { z } from 'zod';

// Define the expected API response shape
const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'viewer']),
  createdAt: z.string().datetime(),
  avatar: z.string().url().nullable(),
});

// Infer the TypeScript type from the schema — single source of truth!
type User = z.infer<typeof UserSchema>;

// Validate API responses
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();

  // This throws if the data doesn't match the schema
  return UserSchema.parse(data);
}

// For non-throwing validation, use safeParse
async function fetchUserSafe(id: number) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();

  const result = UserSchema.safeParse(data);

  if (!result.success) {
    console.error('Invalid API response:', result.error.flatten());
    throw new Error('Server returned unexpected data');
  }

  return result.data; // Fully typed as User
}
```

> **🔵 .NET Analogy**: `z.infer<typeof Schema>` is like how `System.Text.Json` uses `[JsonPropertyName]` attributes — the schema defines both validation AND the type. But Zod is more like **FluentValidation** with automatic `class` generation built in.

### Discriminated Unions

Model complex business domain types with tagged unions:

```typescript
// Different notification types have different fields
const NotificationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('email'),
    subject: z.string(),
    body: z.string(),
    recipient: z.string().email(),
  }),
  z.object({
    type: z.literal('sms'),
    message: z.string().max(160),
    phoneNumber: z.string().regex(/^\+\d{10,15}$/),
  }),
  z.object({
    type: z.literal('push'),
    title: z.string(),
    body: z.string(),
    badge: z.number().int().nonnegative().optional(),
  }),
]);

type Notification = z.infer<typeof NotificationSchema>;

// TypeScript narrows the type automatically
function sendNotification(notification: Notification) {
  switch (notification.type) {
    case 'email':
      sendEmail(notification.recipient, notification.subject, notification.body);
      break;
    case 'sms':
      sendSms(notification.phoneNumber, notification.message);
      break;
    case 'push':
      sendPush(notification.title, notification.body, notification.badge);
      break;
  }
}
```

### Schema Composition — Reuse and Extend

```typescript
// Base schemas
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/),
});

const PersonSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
});

// Compose: extend and merge
const EmployeeSchema = PersonSchema.extend({
  employeeId: z.string().uuid(),
  department: z.enum(['engineering', 'design', 'product', 'sales']),
  address: AddressSchema,
  salary: z.number().positive(),
  startDate: z.string().date(),
});

// Pick and omit — like TypeScript's Pick/Omit but with runtime validation
const CreateEmployeeSchema = EmployeeSchema.omit({ employeeId: true });
const EmployeeContactSchema = EmployeeSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
});

// Partial — all fields become optional
const UpdateEmployeeSchema = EmployeeSchema.partial();

// Types are automatically derived
type Employee = z.infer<typeof EmployeeSchema>;
type CreateEmployee = z.infer<typeof CreateEmployeeSchema>;
type UpdateEmployee = z.infer<typeof UpdateEmployeeSchema>;
```

### Transform and Preprocess

```typescript
// Transform: change the output type
const DateStringSchema = z.string().datetime().transform(s => new Date(s));
// Input: string → Output: Date

// Preprocess: transform input before validation
const NumericStringSchema = z.preprocess(
  (val) => (typeof val === 'string' ? parseInt(val, 10) : val),
  z.number().int().positive()
);
// Input: "42" → Output: 42 (as number)

// Coerce: built-in type coercion
const CoercedNumber = z.coerce.number(); // "123" → 123
const CoercedDate = z.coerce.date();     // "2025-01-01" → Date
const CoercedBoolean = z.coerce.boolean(); // "true" → true
```

### Environment Variable Validation

```typescript
// env.ts — validate environment variables at app startup
import { z } from 'zod';

const EnvSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_API_KEY: z.string().min(1, 'API key is required'),
  VITE_ENABLE_ANALYTICS: z.coerce.boolean().default(false),
  VITE_MAX_UPLOAD_SIZE: z.coerce.number().default(10_000_000),
  VITE_ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
});

// Validate and export — app crashes early if env is misconfigured
export const env = EnvSchema.parse(import.meta.env);

// Usage in components
// import { env } from '../env';
// fetch(`${env.VITE_API_URL}/users`, { headers: { 'X-API-Key': env.VITE_API_KEY } });
```

> **🔵 .NET Analogy**: Like `IOptions<T>` with data annotations or FluentValidation — but at the config/environment level. Crashes early if configuration is wrong, just like `AddOptions<T>().ValidateOnStart()`.

---

## 2. date-fns — Modern Date Manipulation

### Why date-fns?

| Library | Bundle Size | Tree-Shakeable | Immutable | TypeScript |
|---------|------------|:-:|:-:|:-:|
| **Moment.js** | 329 KB | ❌ | ❌ | ⚠️ `@types` | 
| **date-fns** | ~7 KB (typical) | ✅ | ✅ | ✅ Native |
| **Day.js** | 7 KB | ⚠️ Plugins | ✅ | ✅ |

date-fns imports only what you use — the rest is removed by tree-shaking.

### Installation

```bash
npm install date-fns
```

### Core Operations

```typescript
import {
  format,
  parseISO,
  addDays,
  subMonths,
  differenceInDays,
  isAfter,
  isBefore,
  startOfWeek,
  endOfMonth,
  formatDistanceToNow,
  isValid,
} from 'date-fns';

// --- Formatting ---
const now = new Date();
format(now, 'dd MMM yyyy');            // "10 Feb 2026"
format(now, 'EEEE, MMMM do, yyyy');   // "Tuesday, February 10th, 2026"
format(now, 'HH:mm:ss');               // "10:25:40"
format(now, "yyyy-MM-dd'T'HH:mm:ss"); // "2026-02-10T10:25:40"

// --- Parsing ISO strings ---
const date = parseISO('2026-02-10T10:25:40+02:00');
format(date, 'PPP'); // "February 10th, 2026"

// --- Date arithmetic ---
addDays(now, 7);       // One week from now
subMonths(now, 3);     // Three months ago

// --- Comparisons ---
const deadline = parseISO('2026-03-01');
differenceInDays(deadline, now);  // Days until deadline
isAfter(now, deadline);           // false
isBefore(now, deadline);          // true

// --- Boundaries ---
startOfWeek(now, { weekStartsOn: 1 }); // Monday of this week
endOfMonth(now);                         // Last moment of February

// --- Relative time (great for UIs) ---
formatDistanceToNow(parseISO('2026-02-09T10:00:00'), { addSuffix: true });
// "about 1 day ago"

// --- Validation ---
isValid(new Date('not a date')); // false
isValid(parseISO('2026-02-10')); // true
```

### Locale Support

```typescript
import { format, formatDistanceToNow } from 'date-fns';
import { fr, de, ja } from 'date-fns/locale';

const date = new Date();

format(date, 'PPPP', { locale: fr }); // "mardi 10 février 2026"
format(date, 'PPPP', { locale: de }); // "Dienstag, 10. Februar 2026"
format(date, 'PPPP', { locale: ja }); // "2026年2月10日火曜日"

formatDistanceToNow(date, { locale: fr, addSuffix: true });
// "il y a moins d'une minute"
```

### React Hooks for Dates

```typescript
import { useMemo } from 'react';
import {
  format,
  formatDistanceToNow,
  parseISO,
  isAfter,
} from 'date-fns';

// Custom hook for formatted dates
function useFormattedDate(isoString: string, formatStr: string = 'PPP') {
  return useMemo(() => {
    const date = parseISO(isoString);
    return format(date, formatStr);
  }, [isoString, formatStr]);
}

// Custom hook for relative time
function useRelativeTime(isoString: string) {
  return useMemo(() => {
    const date = parseISO(isoString);
    return formatDistanceToNow(date, { addSuffix: true });
  }, [isoString]);
}

// Custom hook for deadline checking
function useDeadlineStatus(deadlineIso: string) {
  return useMemo(() => {
    const deadline = parseISO(deadlineIso);
    const now = new Date();
    const isPast = isAfter(now, deadline);
    const label = formatDistanceToNow(deadline, { addSuffix: true });

    return { isPast, label, deadline };
  }, [deadlineIso]);
}

// Usage in components
function TaskCard({ task }: { task: { title: string; deadline: string } }) {
  const created = useFormattedDate(task.deadline);
  const { isPast, label } = useDeadlineStatus(task.deadline);

  return (
    <div>
      <h3>{task.title}</h3>
      <p>Due: {created}</p>
      <span style={{ color: isPast ? 'red' : 'green' }}>
        {isPast ? `Overdue ${label}` : `Due ${label}`}
      </span>
    </div>
  );
}
```

> **🔵 .NET Analogy**: date-fns is like `System.DateTime` extension methods from **NodaTime** or Humanizer — functional, immutable, and composable. `formatDistanceToNow` is like Humanizer's `.Humanize()`. `parseISO` is like `DateTimeOffset.Parse`. The key difference: date-fns functions are standalone, not methods on a class.

---

## 3. clsx & class-variance-authority (CVA)

### clsx — Dynamic Class Composition

```bash
npm install clsx
```

`clsx` combines CSS class names conditionally:

```typescript
import clsx from 'clsx';

// Combine strings
clsx('btn', 'btn-primary');
// → "btn btn-primary"

// Conditionals
clsx('btn', {
  'btn-primary': isPrimary,
  'btn-disabled': isDisabled,
  'btn-large': size === 'lg',
});
// → "btn btn-primary" (if isPrimary is true, others false)

// Mixed
clsx('btn', isPrimary && 'btn-primary', isActive ? 'active' : 'inactive');
// → "btn btn-primary active"

// Arrays
clsx(['btn', 'btn-primary']);
// → "btn btn-primary"
```

**In components**:

```typescript
import clsx from 'clsx';

function Alert({
  variant = 'info',
  dismissible = false,
  className,
  children,
}: {
  variant?: 'info' | 'success' | 'warning' | 'error';
  dismissible?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        'alert',
        `alert-${variant}`,
        dismissible && 'alert-dismissible',
        className // Allow parent to add custom classes
      )}
    >
      {children}
    </div>
  );
}
```

### CVA — Variant-Based Component Styling

```bash
npm install class-variance-authority
```

CVA is a more structured approach — **define variants declaratively**, like a design system:

```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';

// Define all variants for a button
const buttonVariants = cva(
  // Base classes (always applied)
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        ghost: 'bg-transparent hover:bg-gray-100',
        outline: 'border-2 border-gray-300 bg-transparent hover:bg-gray-50',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    // Compound variants — when multiple variants combine
    compoundVariants: [
      {
        variant: 'destructive',
        size: 'lg',
        className: 'font-bold uppercase tracking-wide',
      },
    ],
    // Default variant values
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

// Derive props type from the variant definition
type ButtonProps = VariantProps<typeof buttonVariants> & {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
};

function Button({ variant, size, fullWidth, className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {children}
    </button>
  );
}

// Usage — clean, type-safe, and consistent
<Button variant="primary" size="lg">Save Changes</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="outline" fullWidth>Full Width</Button>
```

> **🔵 .NET Analogy**: CVA is like defining a custom `TagHelper` in ASP.NET Core with strongly-typed attributes for each visual variant. Or like a WPF `Style` with `Triggers` — declarative visual rules that compose cleanly.

---

## 4. Zustand Advanced Patterns

Unit 7 introduced Zustand basics. Here we cover patterns used in large-scale applications.

### Middleware Stack

```bash
npm install zustand immer
```

```typescript
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface AppState {
  user: { name: string; role: string } | null;
  theme: 'light' | 'dark';
  notifications: Array<{ id: string; message: string; read: boolean }>;

  // Actions
  setUser: (user: AppState['user']) => void;
  toggleTheme: () => void;
  addNotification: (message: string) => void;
  markRead: (id: string) => void;
  clearNotifications: () => void;
}

const useAppStore = create<AppState>()(
  // Middleware is composed from outside in:
  // devtools → persist → subscribeWithSelector → immer → store
  devtools(
    persist(
      subscribeWithSelector(
        immer((set) => ({
          user: null,
          theme: 'light',
          notifications: [],

          setUser: (user) =>
            set((state) => {
              state.user = user; // Direct mutation thanks to Immer!
            }),

          toggleTheme: () =>
            set((state) => {
              state.theme = state.theme === 'light' ? 'dark' : 'light';
            }),

          addNotification: (message) =>
            set((state) => {
              state.notifications.push({
                id: crypto.randomUUID(),
                message,
                read: false,
              });
            }),

          markRead: (id) =>
            set((state) => {
              const notification = state.notifications.find(n => n.id === id);
              if (notification) notification.read = true;
            }),

          clearNotifications: () =>
            set((state) => {
              state.notifications = [];
            }),
        }))
      ),
      {
        name: 'app-storage', // localStorage key
        partialize: (state) => ({
          theme: state.theme, // Only persist theme, not notifications
        }),
      }
    ),
    { name: 'AppStore' } // DevTools label
  )
);
```

**What each middleware does**:

| Middleware | Purpose | .NET Analogy |
|-----------|---------|--------------|
| `devtools` | Redux DevTools integration | Application Insights |
| `persist` | Persist to localStorage/sessionStorage | `IDistributedCache` |
| `subscribeWithSelector` | Subscribe to specific state slices | `INotifyPropertyChanged` |
| `immer` | Write mutations that produce immutable updates | EF Core change tracking |

### Slice Pattern — Modular Stores

For large apps, split the store into focused slices:

```typescript
import { create, type StateCreator } from 'zustand';

// --- Auth Slice ---
interface AuthSlice {
  user: { id: string; name: string } | null;
  isAuthenticated: boolean;
  login: (user: AuthSlice['user']) => void;
  logout: () => void;
}

const createAuthSlice: StateCreator<
  AuthSlice & CartSlice, // Full store type for cross-slice access
  [],
  [],
  AuthSlice
> = (set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
});

// --- Cart Slice ---
interface CartSlice {
  items: Array<{ id: string; name: string; quantity: number }>;
  addItem: (id: string, name: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const createCartSlice: StateCreator<
  AuthSlice & CartSlice,
  [],
  [],
  CartSlice
> = (set, get) => ({
  items: [],
  addItem: (id, name) =>
    set((state) => {
      const existing = state.items.find(item => item.id === id);
      if (existing) {
        return {
          items: state.items.map(item =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return { items: [...state.items, { id, name, quantity: 1 }] };
    }),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter(item => item.id !== id),
    })),
  clearCart: () => {
    // Cross-slice access: check if user is logged in
    if (!get().isAuthenticated) {
      console.warn('Cannot clear cart — user not authenticated');
      return;
    }
    set({ items: [] });
  },
});

// --- Combined Store ---
const useStore = create<AuthSlice & CartSlice>()((...args) => ({
  ...createAuthSlice(...args),
  ...createCartSlice(...args),
}));

// Usage — select only what you need
function CartCount() {
  const itemCount = useStore(state => state.items.length);
  return <span className="badge">{itemCount}</span>;
}
```

---

## 5. React Error Boundary

### Installation

```bash
npm install react-error-boundary
```

### Basic Usage

```typescript
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

// Fallback component shown when an error occurs
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert" style={{
      padding: '24px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '12px',
      textAlign: 'center',
    }}>
      <h2>😵 Something went wrong</h2>
      <pre style={{ color: '#991b1b', whiteSpace: 'pre-wrap' }}>
        {error.message}
      </pre>
      <button
        onClick={resetErrorBoundary}
        style={{
          padding: '10px 20px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        🔄 Try Again
      </button>
    </div>
  );
}

// Wrap sections of your app
function App() {
  return (
    <div>
      <header>My App</header>

      {/* Error in the dashboard won't crash the sidebar */}
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={(error, info) => {
          // Log to your error tracking service
          console.error('Error caught by boundary:', error);
          console.error('Component stack:', info.componentStack);
          // logToSentry(error, info);
        }}
        onReset={() => {
          // Reset app state when user clicks "Try Again"
          // e.g., clear cache, reset queries
        }}
      >
        <Dashboard />
      </ErrorBoundary>

      <sidebar>
        <Navigation />
      </sidebar>
    </div>
  );
}
```

### Granular Error Boundaries

Strategic placement creates **blast radius control**:

```typescript
function Dashboard() {
  return (
    <div className="dashboard-grid">
      {/* Each widget has its own error boundary */}
      <ErrorBoundary
        FallbackComponent={WidgetErrorFallback}
        resetKeys={['revenue']} // Auto-reset when this key changes
      >
        <RevenueChart />
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={WidgetErrorFallback}>
        <UserStats />
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={WidgetErrorFallback}>
        <RecentOrders />
      </ErrorBoundary>
    </div>
  );
}

// Compact fallback for individual widgets
function WidgetErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="widget-error">
      <p>⚠️ Failed to load</p>
      <button onClick={resetErrorBoundary}>Retry</button>
    </div>
  );
}
```

> **🔵 .NET Analogy**: Error boundaries are like ASP.NET's **exception middleware pipeline**. You wrap sections of your component tree like you wrap middleware — outer boundaries catch what inner ones don't. `onError` is like `IExceptionHandler`, and `FallbackComponent` is like your custom error response page.

---

## 6. Internationalization (i18next)

### Installation

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### Setup

```typescript
// i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          welcome: 'Welcome, {{name}}!',
          nav: {
            home: 'Home',
            profile: 'Profile',
            settings: 'Settings',
          },
          items: {
            count_one: '{{count}} item',
            count_other: '{{count}} items',
          },
        },
      },
      es: {
        translation: {
          welcome: '¡Bienvenido, {{name}}!',
          nav: {
            home: 'Inicio',
            profile: 'Perfil',
            settings: 'Configuración',
          },
          items: {
            count_one: '{{count}} artículo',
            count_other: '{{count}} artículos',
          },
        },
      },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18n;
```

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

function Header({ userName }: { userName: string }) {
  const { t, i18n } = useTranslation();

  return (
    <header>
      <h1>{t('welcome', { name: userName })}</h1>
      <nav>
        <a href="/">{t('nav.home')}</a>
        <a href="/profile">{t('nav.profile')}</a>
        <a href="/settings">{t('nav.settings')}</a>
      </nav>

      {/* Language switcher */}
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </header>
  );
}

function CartSummary({ itemCount }: { itemCount: number }) {
  const { t } = useTranslation();

  return (
    <p>
      {/* Automatic pluralization */}
      {t('items.count', { count: itemCount })}
      {/* 1 → "1 item", 5 → "5 items" */}
    </p>
  );
}
```

---

## 7. Environment & Feature Flag Configuration

### Zod-Validated Environment

Combine Zod with Vite's environment variable system (see Zod section above):

```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_APP_NAME: z.string().default('My App'),
  VITE_ENABLE_ANALYTICS: z.coerce.boolean().default(false),
  VITE_ENABLE_DARK_MODE: z.coerce.boolean().default(true),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export const env = envSchema.parse(import.meta.env);
export type Env = z.infer<typeof envSchema>;
```

### Feature Flags

```typescript
// src/config/features.ts
import { env } from './env';

// Feature flags — centralized and type-safe
export const features = {
  analytics: env.VITE_ENABLE_ANALYTICS,
  darkMode: env.VITE_ENABLE_DARK_MODE,
  // Can also be driven by user role, A/B tests, etc.
} as const;

// Hook for feature checks
import { useMemo } from 'react';

function useFeature(flag: keyof typeof features): boolean {
  return useMemo(() => features[flag], [flag]);
}

// Usage
function App() {
  const darkModeEnabled = useFeature('darkMode');

  return (
    <div className={darkModeEnabled ? 'dark' : 'light'}>
      {/* App content */}
    </div>
  );
}
```

### Multi-Environment Setup

```bash
# .env                  — shared defaults
VITE_APP_NAME=MyApp

# .env.development      — local dev
VITE_API_URL=http://localhost:3001
VITE_ENABLE_ANALYTICS=false
VITE_LOG_LEVEL=debug

# .env.staging           — staging environment
VITE_API_URL=https://api.staging.myapp.com
VITE_ENABLE_ANALYTICS=true
VITE_LOG_LEVEL=info

# .env.production        — production
VITE_API_URL=https://api.myapp.com
VITE_ENABLE_ANALYTICS=true
VITE_LOG_LEVEL=warn
```

```bash
# Vite loads the correct .env file based on the mode
npm run dev                    # Uses .env.development
npm run build                  # Uses .env.production
npm run build -- --mode staging # Uses .env.staging
```

---

## Summary

### Library Quick Reference

| Library | Purpose | Install |
|---------|---------|---------|
| **Zod** | Schema validation & type inference | `npm i zod` |
| **date-fns** | Date formatting & manipulation | `npm i date-fns` |
| **clsx** | Conditional CSS class joining | `npm i clsx` |
| **CVA** | Variant-based component styling | `npm i class-variance-authority` |
| **Zustand** | Lightweight state management | `npm i zustand` |
| **Immer** | Immutable updates with mutable syntax | `npm i immer` |
| **react-error-boundary** | Declarative error handling | `npm i react-error-boundary` |
| **i18next** | Internationalization | `npm i i18next react-i18next` |

---

## Exercises

### Exercise 1: Validated API Client ⭐
Build a type-safe API client using Zod.

**Requirements**:
- Define Zod schemas for User, Post, and Comment
- Create a `fetchWithValidation()` helper that validates responses
- Handle validation errors gracefully with user-friendly messages
- Use `z.infer` — no duplicate TypeScript interfaces

### Exercise 2: Date Utilities Library ⭐
Build a set of React hooks for common date operations.

**Requirements**:
- `useFormattedDate(isoString, format)` — formats a date string
- `useRelativeTime(isoString)` — shows "2 hours ago" 
- `useCountdown(targetDate)` — counts down days/hours/minutes
- Support at least 2 locales

### Exercise 3: Component Design System ⭐⭐
Build a small design system using CVA.

**Requirements**:
- `Button` with variants: primary, secondary, destructive, ghost
- `Badge` with variants: default, success, warning, error
- `Input` with sizes: sm, md, lg
- All components accept a `className` prop for customization

### Exercise 4: Resilient Dashboard ⭐⭐⭐
Build a dashboard with granular error boundaries and persistent state.

**Requirements**:
- Use Zustand with `persist` middleware for user preferences
- Wrap each dashboard widget in its own `ErrorBoundary`
- Add a "widget crashed" fallback with a retry button
- Log errors to the console (simulate Sentry integration)
- Add i18n support for at least the error messages

---

## Common Pitfalls

### 1. Zod: Forgetting `safeParse` in User-Facing Code

```typescript
// ❌ parse() throws — don't use in UI without try/catch
const user = UserSchema.parse(apiData); // Crashes if invalid!

// ✅ safeParse() returns a result object
const result = UserSchema.safeParse(apiData);
if (!result.success) {
  showError(result.error.flatten());
}
```

### 2. date-fns: Mixing Up Format Tokens

```typescript
// ❌ Common mistake: using moment.js tokens
format(date, 'YYYY-MM-DD');  // Wrong! 'Y' is week-numbering year

// ✅ date-fns uses Unicode tokens
format(date, 'yyyy-MM-dd');  // Correct
```

### 3. Zustand: Selecting Too Much State

```typescript
// ❌ Re-renders on ANY state change
const state = useStore();

// ✅ Select only what you need — component only re-renders when these change
const theme = useStore(state => state.theme);
const itemCount = useStore(state => state.items.length);
```

### 4. Error Boundaries: They Don't Catch Everything

```typescript
// Error boundaries DON'T catch:
// - Event handlers (use try/catch)
// - Async code (use try/catch)
// - Server-side rendering
// - Errors in the boundary itself

// They DO catch:
// - Render errors
// - Lifecycle method errors
// - Constructor errors
```

---

## Further Reading

- [Zod Documentation](https://zod.dev/)
- [date-fns Documentation](https://date-fns.org/)
- [CVA Documentation](https://cva.style/)
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [react-error-boundary](https://github.com/bvaughn/react-error-boundary)
- [i18next Documentation](https://www.i18next.com/)

---

**Previous Unit**: [← Unit 11: React 19 Features](../unit-11-react19-features/README.md)
