# Unit 2: Components and Props

**Time**: 2-3 hours | **Level**: Beginner

## 🎯 Learning Objectives

By the end of this unit, you will:
- Understand component composition and reusability
- Master props and TypeScript interfaces for type-safe components
- Use the `children` prop for flexible component design
- Implement conditional rendering patterns
- Render lists efficiently with proper keys
- Apply component best practices and patterns

## 📚 Table of Contents

1. [Component Fundamentals](#component-fundamentals)
2. [Props in Depth](#props-in-depth)
3. [Component Composition](#component-composition)
4. [The Children Prop](#the-children-prop)
5. [Conditional Rendering](#conditional-rendering)
6. [Rendering Lists](#rendering-lists)
7. [Component Best Practices](#component-best-practices)
8. [Exercises](#exercises)
9. [Common Pitfalls](#common-pitfalls)
10. [Further Reading](#further-reading)

---

## Component Fundamentals

### What is a Component?

A **component** is a reusable piece of UI that encapsulates structure, styling, and behavior.

**Backend Analogy**: Think of components like **classes** or **methods** in C#:
- They accept inputs (props = parameters)
- They return output (JSX = return value)
- They can be reused throughout your application

### Functional Components (Modern Approach)

```typescript
// Simple component
function Welcome() {
  return <h1>Hello, World!</h1>;
}

// Component with props
interface GreetingProps {
  name: string;
}

function Greeting({ name }: GreetingProps) {
  return <h1>Hello, {name}!</h1>;
}

// Arrow function syntax (also common)
const Greeting = ({ name }: GreetingProps) => {
  return <h1>Hello, {name}!</h1>;
};

// Implicit return (for simple components)
const Greeting = ({ name }: GreetingProps) => <h1>Hello, {name}!</h1>;
```

**Note**: We use **functional components** in modern React. Class components are legacy.

### Component File Structure

**Convention**: One component per file, filename matches component name.

```
src/
  components/
    Button.tsx          # Button component
    Card.tsx            # Card component
    UserProfile.tsx     # UserProfile component
```

**Example `Button.tsx`**:
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
}

function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

export default Button;
```

**Usage**:
```typescript
import Button from './components/Button';

function App() {
  return <Button label="Click Me" onClick={() => alert('Clicked!')} />;
}
```

---

## Props in Depth

### What are Props?

**Props** (short for "properties") are inputs to components. They're like **method parameters** or **constructor arguments** in C#.

**Key Rules**:
- Props are **read-only** (immutable)
- Props flow **down** from parent to child (one-way data flow)
- Props can be any type: primitives, objects, arrays, functions

### Defining Props with TypeScript

```typescript
// Simple props
interface UserProps {
  name: string;
  age: number;
  isActive: boolean;
}

function User({ name, age, isActive }: UserProps) {
  return (
    <div>
      <h2>{name}</h2>
      <p>Age: {age}</p>
      <p>Status: {isActive ? 'Active' : 'Inactive'}</p>
    </div>
  );
}
```

### Optional Props

```typescript
interface UserProps {
  name: string;
  age?: number;  // Optional with ?
  email?: string;
}

function User({ name, age, email }: UserProps) {
  return (
    <div>
      <h2>{name}</h2>
      {age && <p>Age: {age}</p>}
      {email && <p>Email: {email}</p>}
    </div>
  );
}

// Usage
<User name="John" />  // OK - age and email are optional
<User name="Jane" age={30} email="jane@example.com" />  // Also OK
```

### Default Props

```typescript
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

function Button({ 
  label, 
  variant = 'primary',  // Default value
  size = 'medium'       // Default value
}: ButtonProps) {
  return (
    <button className={`btn-${variant} btn-${size}`}>
      {label}
    </button>
  );
}

// Usage
<Button label="Click" />  // Uses defaults: primary, medium
<Button label="Delete" variant="danger" size="large" />
```

### Props with Complex Types

```typescript
// Object props
interface Address {
  street: string;
  city: string;
  zipCode: string;
}

interface UserProps {
  name: string;
  address: Address;
}

function User({ name, address }: UserProps) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{address.street}</p>
      <p>{address.city}, {address.zipCode}</p>
    </div>
  );
}

// Array props
interface TodoListProps {
  todos: string[];
}

function TodoList({ todos }: TodoListProps) {
  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index}>{todo}</li>
      ))}
    </ul>
  );
}

// Function props (callbacks)
interface ButtonProps {
  label: string;
  onClick: () => void;
  onHover?: (event: React.MouseEvent) => void;
}

function Button({ label, onClick, onHover }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      onMouseEnter={onHover}
    >
      {label}
    </button>
  );
}
```

### Spreading Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

function Button({ variant = 'primary', ...rest }: ButtonProps) {
  return (
    <button 
      className={`btn-${variant}`}
      {...rest}  // Spreads all other props (onClick, disabled, etc.)
    >
      {rest.children}
    </button>
  );
}

// Usage - all standard button props work!
<Button variant="primary" onClick={() => {}} disabled>
  Click Me
</Button>
```

---

## Component Composition

### Building Larger Components from Smaller Ones

**Principle**: Compose complex UIs from simple, reusable components.

**Backend Analogy**: Like composing classes or using the **Composite pattern** in OOP.

### Example: Building a Card Component

```typescript
// Small, focused components
interface CardHeaderProps {
  title: string;
  subtitle?: string;
}

function CardHeader({ title, subtitle }: CardHeaderProps) {
  return (
    <div className="card-header">
      <h3>{title}</h3>
      {subtitle && <p className="subtitle">{subtitle}</p>}
    </div>
  );
}

interface CardBodyProps {
  children: React.ReactNode;
}

function CardBody({ children }: CardBodyProps) {
  return <div className="card-body">{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
}

function CardFooter({ children }: CardFooterProps) {
  return <div className="card-footer">{children}</div>;
}

// Composed Card component
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className = '' }: CardProps) {
  return <div className={`card ${className}`}>{children}</div>;
}

// Export all as a compound component
export { Card, CardHeader, CardBody, CardFooter };
```

**Usage**:
```typescript
import { Card, CardHeader, CardBody, CardFooter } from './Card';

function UserProfile() {
  return (
    <Card>
      <CardHeader title="John Doe" subtitle="Software Developer" />
      <CardBody>
        <p>Email: john@example.com</p>
        <p>Location: San Francisco, CA</p>
      </CardBody>
      <CardFooter>
        <button>Edit Profile</button>
      </CardFooter>
    </Card>
  );
}
```

**Benefits**:
- ✅ Reusable components
- ✅ Flexible composition
- ✅ Easy to maintain
- ✅ Type-safe with TypeScript

---

## The Children Prop

### What is `children`?

The `children` prop is a special prop that contains the content between component tags.

```typescript
<Card>
  This content becomes the children prop
</Card>
```

### Using Children

```typescript
interface ContainerProps {
  children: React.ReactNode;
}

function Container({ children }: ContainerProps) {
  return <div className="container">{children}</div>;
}

// Usage
<Container>
  <h1>Title</h1>
  <p>Paragraph</p>
</Container>
```

### Children Types

```typescript
// Any valid React node
children: React.ReactNode;

// Only a single React element
children: React.ReactElement;

// Only a function (render props pattern)
children: (data: Data) => React.ReactNode;

// Array of specific elements
children: React.ReactElement<ButtonProps>[];
```

### Example: Layout Component

```typescript
interface LayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

function Layout({ children, sidebar }: LayoutProps) {
  return (
    <div className="layout">
      {sidebar && <aside className="sidebar">{sidebar}</aside>}
      <main className="main-content">{children}</main>
    </div>
  );
}

// Usage
<Layout sidebar={<Navigation />}>
  <h1>Page Content</h1>
  <p>This is the main content area.</p>
</Layout>
```

---

## Conditional Rendering

### Using Ternary Operator

```typescript
interface MessageProps {
  isLoggedIn: boolean;
}

function Message({ isLoggedIn }: MessageProps) {
  return (
    <div>
      {isLoggedIn ? (
        <p>Welcome back!</p>
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  );
}
```

### Using && Operator

```typescript
interface NotificationProps {
  hasNotifications: boolean;
  count: number;
}

function Notification({ hasNotifications, count }: NotificationProps) {
  return (
    <div>
      {hasNotifications && <span className="badge">{count}</span>}
    </div>
  );
}
```

**Warning**: Be careful with falsy values!

```typescript
// ❌ Problem: If count is 0, it renders "0"
{count && <span>{count}</span>}

// ✅ Solution: Explicit boolean check
{count > 0 && <span>{count}</span>}
```

### Using Early Return

```typescript
interface UserProfileProps {
  user: User | null;
}

function UserProfile({ user }: UserProfileProps) {
  // Early return for null case
  if (!user) {
    return <p>No user found.</p>;
  }

  // Main render
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

### Switch-Like Conditional Rendering

```typescript
type Status = 'loading' | 'success' | 'error';

interface DataDisplayProps {
  status: Status;
  data?: any;
  error?: string;
}

function DataDisplay({ status, data, error }: DataDisplayProps) {
  switch (status) {
    case 'loading':
      return <p>Loading...</p>;
    case 'error':
      return <p className="error">{error}</p>;
    case 'success':
      return <div>{JSON.stringify(data)}</div>;
    default:
      return null;
  }
}
```

---

## Rendering Lists

### Basic List Rendering

```typescript
interface Item {
  id: number;
  name: string;
}

interface ItemListProps {
  items: Item[];
}

function ItemList({ items }: ItemListProps) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### Why Keys Matter

**Keys** help React identify which items have changed, been added, or removed.

```typescript
// ❌ Bad: Using index as key (can cause bugs)
{items.map((item, index) => (
  <li key={index}>{item.name}</li>
))}

// ✅ Good: Using unique ID
{items.map(item => (
  <li key={item.id}>{item.name}</li>
))}

// ✅ Acceptable: Using index only if list never changes
{staticItems.map((item, index) => (
  <li key={index}>{item}</li>
))}
```

**When index as key is problematic**:
- Items can be reordered
- Items can be added/removed
- List is filtered/sorted

### Rendering Complex Lists

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserListProps {
  users: User[];
}

function UserList({ users }: UserListProps) {
  return (
    <div className="user-list">
      {users.map(user => (
        <div key={user.id} className="user-card">
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <span className="role">{user.role}</span>
        </div>
      ))}
    </div>
  );
}
```

### Filtering and Mapping

```typescript
interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  todos: TodoItem[];
  showCompleted: boolean;
}

function TodoList({ todos, showCompleted }: TodoListProps) {
  const filteredTodos = showCompleted
    ? todos
    : todos.filter(todo => !todo.completed);

  return (
    <ul>
      {filteredTodos.map(todo => (
        <li 
          key={todo.id}
          style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
        >
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
```

### Empty List Handling

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyMessage?: string;
}

function List<T extends { id: number }>({ 
  items, 
  renderItem, 
  emptyMessage = 'No items found' 
}: ListProps<T>) {
  if (items.length === 0) {
    return <p className="empty-message">{emptyMessage}</p>;
  }

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Usage
<List
  items={users}
  renderItem={user => <UserCard user={user} />}
  emptyMessage="No users available"
/>
```

---

## Component Best Practices

### 1. Keep Components Small and Focused

**Bad**: One large component doing everything
```typescript
// ❌ 300 lines of code in one component
function Dashboard() {
  // Too much logic, too many responsibilities
}
```

**Good**: Break into smaller components
```typescript
// ✅ Each component has a single responsibility
function Dashboard() {
  return (
    <div>
      <DashboardHeader />
      <DashboardStats />
      <DashboardCharts />
      <DashboardActivity />
    </div>
  );
}
```

### 2. Use Descriptive Names

```typescript
// ❌ Bad
function Comp() { }
function Thing() { }

// ✅ Good
function UserProfile() { }
function ShoppingCartItem() { }
```

### 3. Define Props Interfaces

```typescript
// ✅ Always define props interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  // ...
}
```

### 4. Use Destructuring

```typescript
// ❌ Less readable
function User(props: UserProps) {
  return <h1>{props.name}</h1>;
}

// ✅ More readable
function User({ name }: UserProps) {
  return <h1>{name}</h1>;
}
```

### 5. Extract Reusable Logic

```typescript
// If you're repeating code, extract it!

// ❌ Repetitive
function UserCard() {
  const formattedDate = new Date().toLocaleDateString();
  // ...
}

function PostCard() {
  const formattedDate = new Date().toLocaleDateString();
  // ...
}

// ✅ Extract to utility function
function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

function UserCard() {
  const formattedDate = formatDate(new Date());
  // ...
}
```

### 6. Avoid Prop Drilling

**Problem**: Passing props through many levels

```typescript
// ❌ Prop drilling
<GrandParent user={user}>
  <Parent user={user}>
    <Child user={user}>
      <GrandChild user={user} />
    </Child>
  </Parent>
</GrandParent>
```

**Solution**: Use Context (covered in Unit 7) or component composition

---

## Exercises

### Exercise 1: Create a Button Component

**Task**: Create a reusable `Button` component with variants.

**Requirements**:
- Accept `label`, `onClick`, `variant` ('primary' | 'secondary' | 'danger'), and `disabled` props
- Apply different styles based on variant
- Handle disabled state

---

### Exercise 2: Create a Product Card

**Task**: Create a `ProductCard` component for an e-commerce site.

**Requirements**:
- Accept props: `name`, `price`, `image`, `inStock`, `onAddToCart`
- Display product image, name, and price
- Show "In Stock" or "Out of Stock" badge
- Add to Cart button (disabled if out of stock)

---

### Exercise 3: Create a User List

**Task**: Create a `UserList` component that displays a list of users.

**Requirements**:
- Accept array of users (id, name, email, role)
- Render each user as a card
- Filter users by role (prop: `filterRole?`)
- Show "No users found" if list is empty

---

### Exercise 4: Create a Compound Component

**Task**: Create a `Modal` compound component.

**Requirements**:
- `Modal` - container
- `ModalHeader` - title and close button
- `ModalBody` - content
- `ModalFooter` - action buttons
- Accept `isOpen` prop to control visibility

---

## Solutions

Solutions are available in the `solutions/` folder. Try the exercises first!

---

## Common Pitfalls

### 1. Mutating Props

```typescript
// ❌ Never mutate props!
function User({ user }: { user: User }) {
  user.name = "Changed";  // DON'T DO THIS!
  return <h1>{user.name}</h1>;
}

// ✅ Props are read-only
function User({ user }: { user: User }) {
  const displayName = user.name.toUpperCase();  // Create new value
  return <h1>{displayName}</h1>;
}
```

### 2. Missing Keys in Lists

```typescript
// ❌ Missing key
{items.map(item => <li>{item}</li>)}

// ✅ With key
{items.map(item => <li key={item.id}>{item}</li>)}
```

### 3. Conditional Rendering with Falsy Values

```typescript
// ❌ Renders "0" when count is 0
{count && <span>{count}</span>}

// ✅ Explicit check
{count > 0 && <span>{count}</span>}
```

### 4. Inline Object/Array Props

```typescript
// ❌ Creates new object on every render
<Component style={{ color: 'red' }} />

// ✅ Define outside or use useMemo (Unit 8)
const style = { color: 'red' };
<Component style={style} />
```

---

## Testing Your Knowledge

1. What are props and how do they differ from state?
2. Why are keys important when rendering lists?
3. What is the `children` prop?
4. When should you use conditional rendering?
5. What's the difference between `&&` and ternary operator for conditional rendering?
6. Why should components be small and focused?
7. How do you make a prop optional in TypeScript?

---

## Further Reading

- [React Docs: Components and Props](https://react.dev/learn/passing-props-to-a-component)
- [React Docs: Conditional Rendering](https://react.dev/learn/conditional-rendering)
- [React Docs: Rendering Lists](https://react.dev/learn/rendering-lists)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

## Next Steps

Great work! 🎉 You now understand:
- ✅ Component fundamentals
- ✅ Props and TypeScript interfaces
- ✅ Component composition
- ✅ Conditional rendering
- ✅ List rendering with keys

**Ready for more?** Head to [Unit 3: State Management and Hooks](../unit-03-state-hooks/README.md) to learn about React's reactivity system!

---

*Happy coding! 🚀*
