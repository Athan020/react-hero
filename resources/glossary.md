# Frontend Development Glossary

A comprehensive glossary of frontend development terms for developers coming from backend backgrounds.

## General Terms

### SPA (Single Page Application)
A web application that loads a single HTML page and dynamically updates content without full page reloads.

**Example**: Gmail, Facebook, Twitter

**Backend Analogy**: Like a desktop application that runs in the browser, vs traditional server-rendered pages (like ASP.NET MVC views).

---

### SSR (Server-Side Rendering)
Rendering React components on the server and sending HTML to the client.

**Frameworks**: Next.js, Remix

**Backend Analogy**: Similar to Razor Pages or MVC views in .NET - server generates HTML.

---

### SSG (Static Site Generation)
Pre-rendering pages at build time to static HTML files.

**Frameworks**: Next.js, Gatsby

**Backend Analogy**: Like generating static HTML files at compile time instead of runtime.

---

### CSR (Client-Side Rendering)
Rendering content in the browser using JavaScript.

**Example**: Standard React apps (Create React App, Vite)

---

### Hydration
Process of attaching event listeners to server-rendered HTML to make it interactive.

**Example**: Server sends HTML → Browser loads JavaScript → React "hydrates" the HTML

---

## Build Tools

### Bundler
Tool that combines multiple JavaScript files into one or more bundles.

**Examples**: Webpack, Rollup, Parcel, esbuild

**Backend Analogy**: Like MSBuild combining multiple .cs files into a single DLL.

---

### Transpiler
Tool that converts modern JavaScript/TypeScript to older JavaScript for browser compatibility.

**Examples**: Babel, TypeScript compiler, esbuild

**Backend Analogy**: Like compiling C# to IL.

---

### Module Bundler
Combines modules and their dependencies into static assets.

**Examples**: Webpack, Rollup, Vite (uses Rollup for production)

---

### Tree Shaking
Removing unused code from the final bundle.

**Example**: If you import one function from a library, only that function is included.

**Backend Analogy**: Like linker optimization removing unused code.

---

### Code Splitting
Breaking code into smaller chunks that can be loaded on demand.

**Example**: Load admin panel code only when user visits admin page.

**Backend Analogy**: Like lazy loading assemblies in .NET.

---

### Hot Module Replacement (HMR)
Updating modules in the browser without full page reload while preserving state.

**Example**: Edit a component, save, see changes instantly without losing form data.

**Backend Analogy**: Like Hot Reload in .NET 6+.

---

### Minification
Removing whitespace, comments, and shortening variable names to reduce file size.

**Example**: `function calculateTotal(price, tax)` → `function a(b,c)`

---

## React Concepts

### Component
Reusable piece of UI that can accept inputs (props) and manage its own state.

**Backend Analogy**: Like a class or function that returns UI instead of data.

---

### JSX (JavaScript XML)
Syntax extension that allows writing HTML-like code in JavaScript.

```jsx
const element = <h1>Hello, world!</h1>
```

**Backend Analogy**: Like Razor syntax in ASP.NET (`@if`, `@foreach`).

---

### TSX (TypeScript XML)
JSX with TypeScript type checking.

---

### Props (Properties)
Data passed from parent component to child component.

**Backend Analogy**: Like method parameters or constructor arguments.

```typescript
<UserCard name="John" age={30} />
```

---

### State
Data that changes over time and triggers re-renders when updated.

**Backend Analogy**: Like instance variables in a class, but changes trigger UI updates.

```typescript
const [count, setCount] = useState(0)
```

---

### Hook
Special function that lets you "hook into" React features (state, lifecycle, etc.).

**Examples**: `useState`, `useEffect`, `useContext`

**Backend Analogy**: Like extension methods or dependency injection in .NET.

---

### Virtual DOM
In-memory representation of the actual DOM that React uses to optimize updates.

**How it works**: React compares virtual DOM with actual DOM and only updates what changed.

---

### Reconciliation
Process of comparing virtual DOM with actual DOM to determine what needs to update.

---

### Re-render
When a component's function runs again to produce updated UI.

**Triggers**: State changes, prop changes, parent re-renders.

---

### Controlled Component
Form input whose value is controlled by React state.

```typescript
const [value, setValue] = useState('')
<input value={value} onChange={e => setValue(e.target.value)} />
```

**Backend Analogy**: Like two-way data binding in WPF/Blazor.

---

### Uncontrolled Component
Form input that manages its own state (uses refs to access value).

```typescript
const inputRef = useRef<HTMLInputElement>(null)
<input ref={inputRef} />
```

---

### Higher-Order Component (HOC)
Function that takes a component and returns a new component with additional props/behavior.

**Backend Analogy**: Like decorator pattern in OOP.

---

### Render Props
Pattern where a component accepts a function as a prop to determine what to render.

```typescript
<DataProvider render={data => <div>{data}</div>} />
```

---

### Context
Way to pass data through component tree without passing props manually at every level.

**Backend Analogy**: Like dependency injection or service locator pattern.

---

### Portal
Way to render children into a DOM node outside the parent component's DOM hierarchy.

**Use Case**: Modals, tooltips, dropdowns.

---

## State Management

### Global State
State shared across multiple components in the application.

**Solutions**: Context API, Redux, Zustand, Jotai

---

### Local State
State that belongs to a single component.

**Example**: Form input values, toggle states.

---

### Derived State
State computed from other state values.

```typescript
const total = price * quantity  // Derived from price and quantity
```

---

### Lifting State Up
Moving state to a common parent component to share between children.

---

### Redux
Popular state management library with centralized store and predictable state updates.

**Backend Analogy**: Like CQRS pattern with actions and reducers.

---

### Reducer
Function that takes current state and an action, returns new state.

```typescript
function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 }
    default:
      return state
  }
}
```

**Backend Analogy**: Like a state machine or command pattern.

---

## Routing

### Client-Side Routing
Changing URL and content without full page reload.

**Library**: React Router

---

### Route
Mapping between URL path and component to render.

```typescript
<Route path="/users/:id" element={<UserProfile />} />
```

---

### Dynamic Route
Route with variable segments.

**Example**: `/users/:id` matches `/users/1`, `/users/2`, etc.

**Backend Analogy**: Like route parameters in ASP.NET MVC (`[Route("users/{id}")]`).

---

### Nested Routes
Routes within routes, creating hierarchical navigation.

**Example**: `/dashboard/settings/profile`

---

### Protected Route
Route that requires authentication to access.

```typescript
<Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
```

---

## Styling

### CSS Modules
CSS files scoped to a specific component to avoid naming conflicts.

```typescript
import styles from './Button.module.css'
<button className={styles.primary}>Click</button>
```

---

### CSS-in-JS
Writing CSS in JavaScript files.

**Libraries**: styled-components, Emotion

```typescript
const Button = styled.button`
  background: blue;
  color: white;
`
```

---

### Utility-First CSS
CSS framework with small, single-purpose classes.

**Example**: Tailwind CSS

```jsx
<div className="flex items-center justify-between p-4 bg-blue-500">
```

---

### Preprocessor
Tool that extends CSS with variables, nesting, mixins, etc.

**Examples**: SASS, LESS, Stylus

---

## Data Fetching

### REST API
API that uses HTTP methods (GET, POST, PUT, DELETE) to interact with resources.

**Backend Analogy**: Like ASP.NET Web API controllers.

---

### GraphQL
Query language for APIs that lets clients request exactly the data they need.

**Advantage**: No over-fetching or under-fetching data.

---

### Fetch API
Native browser API for making HTTP requests.

```typescript
const response = await fetch('/api/users')
const data = await response.json()
```

---

### Axios
Popular HTTP client library with more features than Fetch.

```typescript
const { data } = await axios.get('/api/users')
```

---

### SWR (Stale-While-Revalidate)
React hooks library for data fetching with caching and revalidation.

**Library**: SWR by Vercel

---

### React Query / TanStack Query
Powerful data fetching and caching library.

**Features**: Automatic caching, background refetching, optimistic updates.

---

## Testing

### Unit Test
Testing individual components or functions in isolation.

**Library**: Vitest, Jest

---

### Integration Test
Testing how multiple components work together.

---

### E2E Test (End-to-End)
Testing complete user flows in a real browser.

**Libraries**: Playwright, Cypress

---

### React Testing Library
Testing library that encourages testing components as users would interact with them.

```typescript
render(<Button />)
const button = screen.getByRole('button')
fireEvent.click(button)
```

---

### Snapshot Testing
Capturing component output and comparing against saved snapshots.

**Use Case**: Detecting unintended UI changes.

---

### Mock
Fake implementation of a function or module for testing.

```typescript
vi.mock('./api', () => ({
  fetchUser: vi.fn(() => Promise.resolve({ name: 'John' }))
}))
```

---

## Performance

### Memoization
Caching computed values to avoid expensive recalculations.

**Hooks**: `useMemo`, `React.memo`

```typescript
const expensiveValue = useMemo(() => computeExpensive(a, b), [a, b])
```

---

### Lazy Loading
Loading components or resources only when needed.

```typescript
const AdminPanel = lazy(() => import('./AdminPanel'))
```

---

### Debouncing
Delaying function execution until after a pause in events.

**Use Case**: Search input that waits for user to stop typing.

---

### Throttling
Limiting function execution to once per time interval.

**Use Case**: Scroll event handlers.

---

### Bundle Size
Total size of JavaScript files sent to the browser.

**Goal**: Keep it small for faster load times.

---

### Lighthouse
Google's tool for measuring web performance, accessibility, SEO, etc.

---

## TypeScript Terms

### Type Annotation
Explicitly specifying a type.

```typescript
const name: string = "John"
```

---

### Type Inference
TypeScript automatically determining the type.

```typescript
const name = "John"  // Inferred as string
```

---

### Interface
Defining the shape of an object.

```typescript
interface User {
  id: number
  name: string
}
```

---

### Type Alias
Creating a name for a type.

```typescript
type ID = string | number
```

---

### Union Type
Type that can be one of several types.

```typescript
let id: string | number
```

---

### Generic
Type that works with multiple types.

```typescript
function identity<T>(value: T): T {
  return value
}
```

---

### Type Guard
Function that narrows down the type.

```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string'
}
```

---

## Package Management

### npm (Node Package Manager)
Default package manager for Node.js.

**Backend Analogy**: Like NuGet for .NET.

---

### yarn
Alternative package manager (faster than npm).

---

### pnpm
Efficient package manager that saves disk space.

---

### package.json
File defining project metadata and dependencies.

**Backend Analogy**: Like `.csproj` file in .NET.

---

### package-lock.json / yarn.lock
Lock file ensuring consistent dependency versions.

**Backend Analogy**: Like `packages.lock.json` in .NET.

---

### node_modules
Folder containing installed dependencies.

**Backend Analogy**: Like NuGet packages folder.

---

### Semantic Versioning (semver)
Version numbering scheme: `MAJOR.MINOR.PATCH`

**Example**: `1.2.3`
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

---

## Deployment

### Static Hosting
Hosting pre-built HTML/CSS/JS files.

**Providers**: Vercel, Netlify, GitHub Pages, AWS S3

---

### CDN (Content Delivery Network)
Network of servers that deliver content from locations close to users.

**Example**: Cloudflare, AWS CloudFront

---

### Environment Variables
Configuration values that differ between environments.

```bash
VITE_API_URL=https://api.production.com
```

---

### CI/CD (Continuous Integration/Continuous Deployment)
Automated building, testing, and deploying.

**Tools**: GitHub Actions, GitLab CI, Jenkins

---

## Browser APIs

### DOM (Document Object Model)
Tree structure representing HTML elements.

---

### Event Loop
JavaScript's mechanism for handling asynchronous operations.

---

### LocalStorage
Browser storage that persists across sessions.

```typescript
localStorage.setItem('user', JSON.stringify(user))
const user = JSON.parse(localStorage.getItem('user'))
```

---

### SessionStorage
Browser storage that clears when tab closes.

---

### Cookies
Small pieces of data stored in the browser.

**Use Case**: Authentication tokens, user preferences.

---

### Service Worker
Script that runs in the background, enabling offline functionality.

**Use Case**: Progressive Web Apps (PWAs).

---

## Accessibility (a11y)

### ARIA (Accessible Rich Internet Applications)
Attributes that make web content more accessible.

```jsx
<button aria-label="Close dialog">×</button>
```

---

### Semantic HTML
Using HTML elements for their intended purpose.

**Example**: `<button>` for buttons, `<nav>` for navigation.

---

### Screen Reader
Software that reads web content aloud for visually impaired users.

---

### Keyboard Navigation
Ensuring all functionality is accessible via keyboard.

**Example**: Tab to navigate, Enter to activate.

---

## Common Acronyms

- **API**: Application Programming Interface
- **AJAX**: Asynchronous JavaScript and XML
- **CORS**: Cross-Origin Resource Sharing
- **CRUD**: Create, Read, Update, Delete
- **DX**: Developer Experience
- **ESM**: ES Modules
- **HTTP**: Hypertext Transfer Protocol
- **JSON**: JavaScript Object Notation
- **JWT**: JSON Web Token
- **MPA**: Multi-Page Application
- **PWA**: Progressive Web App
- **SEO**: Search Engine Optimization
- **SPA**: Single Page Application
- **UI**: User Interface
- **UX**: User Experience
- **XSS**: Cross-Site Scripting

---

## For .NET Developers

### Quick Translation Guide

| Frontend | .NET Equivalent |
|----------|----------------|
| npm/yarn | NuGet |
| package.json | .csproj |
| node_modules | packages folder |
| Component | Razor Component / Partial View |
| Props | Method parameters |
| State | Instance variables |
| Hook | Extension method / DI |
| Context | Service Locator / DI Container |
| Reducer | State machine / Command pattern |
| REST API | Web API Controller |
| Fetch/Axios | HttpClient |
| LocalStorage | Browser storage (no direct .NET equivalent) |
| Environment Variables | appsettings.json / Configuration |

---

*This glossary will be updated as you progress through the tutorials!*
