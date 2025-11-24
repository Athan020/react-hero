# Unit 1: Foundation - TypeScript, Vite, and React Basics

**Time**: 2-3 hours | **Level**: Beginner

## 🎯 Learning Objectives

By the end of this unit, you will:
- Understand what Vite is and why it's superior to older bundlers
- Know TypeScript fundamentals and how they relate to C#
- Set up a React + TypeScript + Vite project from scratch
- Understand the project structure
- Write your first React component
- Understand JSX/TSX syntax
- Use Hot Module Replacement (HMR) for rapid development

## 📚 Table of Contents

1. [Understanding Vite](#understanding-vite)
2. [TypeScript for .NET Developers](#typescript-for-net-developers)
3. [Project Setup](#project-setup)
4. [Project Structure Explained](#project-structure-explained)
5. [Your First Component](#your-first-component)
6. [JSX/TSX Syntax](#jsxtsx-syntax)
7. [Exercises](#exercises)
8. [Common Pitfalls](#common-pitfalls)
9. [Further Reading](#further-reading)

---

## Understanding Vite

### What is Vite?

**Vite** (French for "fast") is a modern build tool and development server created by Evan You (creator of Vue.js). Think of it as the **MSBuild/dotnet CLI** of the frontend world, but much faster.

### Why Vite Over Webpack?

| Feature | Vite | Webpack (older approach) |
|---------|------|--------------------------|
| **Dev Server Start** | Instant (~100ms) | Slow (10-60s on large projects) |
| **Hot Module Replacement** | Instant | Slower |
| **Build Tool** | esbuild + Rollup | Webpack |
| **Configuration** | Minimal, sensible defaults | Complex, verbose |
| **TypeScript Support** | Built-in, zero config | Requires loaders/plugins |

### How Vite Works

**Development Mode**:
1. Vite serves your source files directly to the browser
2. Uses native ES modules (no bundling needed in dev)
3. Only transforms the file you're currently working on
4. Result: **instant server start** and **lightning-fast HMR**

**Production Mode**:
1. Uses Rollup to create optimized bundles
2. Tree-shaking, minification, code-splitting
3. Result: **small, optimized production builds**

**Analogy for .NET Devs**:
- **Webpack** = Full rebuild on every change (like rebuilding entire solution)
- **Vite** = Incremental compilation (like Roslyn's incremental compiler)

---

## TypeScript for .NET Developers

As a C# developer, you'll feel right at home with TypeScript! It was created by Microsoft and shares many concepts with C#.

### Key Similarities

| C# | TypeScript | Notes |
|-----|-----------|-------|
| `string`, `int`, `bool` | `string`, `number`, `boolean` | Primitive types |
| `interface IUser { }` | `interface User { }` | Interfaces (no `I` prefix convention) |
| `class Person { }` | `class Person { }` | Classes work similarly |
| `List<string>` | `string[]` or `Array<string>` | Generics |
| `public`, `private` | `public`, `private` | Access modifiers |
| `async/await` | `async/await` | Identical async patterns! |
| `null`, `undefined` | `null`, `undefined` | TS has both |
| `var x = 5;` (inferred) | `let x = 5;` (inferred) | Type inference |

### Key Differences

| Concept | C# | TypeScript |
|---------|-----|-----------|
| **Compilation** | Compiles to IL | Transpiles to JavaScript |
| **Runtime** | CLR | JavaScript engine (V8, etc.) |
| **Type System** | Runtime type checking | Compile-time only (erased at runtime) |
| **Null Safety** | Nullable reference types (C# 8+) | `strictNullChecks` option |
| **Variables** | `var`, `const` (C# 7+) | `let`, `const`, ~~`var`~~ (avoid) |

### TypeScript Basics

```typescript
// Primitive Types
let name: string = "John";
let age: number = 30;
let isActive: boolean = true;

// Arrays
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];

// Interfaces (like C# interfaces/DTOs)
interface User {
  id: number;
  name: string;
  email: string;
  isActive?: boolean;  // Optional property (?)
}

// Using the interface
const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
  // isActive is optional, can be omitted
};

// Functions with type annotations
function greet(name: string): string {
  return `Hello, ${name}!`;
}

// Arrow functions (like C# lambda expressions)
const add = (a: number, b: number): number => a + b;

// Type inference (TypeScript infers the type)
let count = 5;  // TypeScript knows this is a number

// Union types (can be one of several types)
let id: string | number;
id = 123;      // OK
id = "ABC123"; // OK

// Type aliases
type ID = string | number;
let userId: ID = 123;

// Generics (just like C#)
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const firstNum = firstElement([1, 2, 3]);     // number | undefined
const firstStr = firstElement(["a", "b"]);    // string | undefined
```

**Key Takeaway**: If you know C#, you already understand 80% of TypeScript!

---

## Project Setup

Let's create your first React + TypeScript + Vite project!

### Step 1: Create the Project

Open your terminal and run:

```bash
npm create vite@latest my-first-react-app -- --template react-ts
```

**What's happening?**
- `npm create vite@latest` - Uses the latest Vite scaffolding tool
- `my-first-react-app` - Your project name
- `--template react-ts` - Use the React + TypeScript template

**Analogy**: This is like running `dotnet new react -n MyApp` in .NET

### Step 2: Navigate and Install Dependencies

```bash
cd my-first-react-app
npm install
```

**What's happening?**
- `npm install` reads `package.json` and installs all dependencies
- Similar to `dotnet restore` in .NET

### Step 3: Start the Development Server

```bash
npm run dev
```

**What's happening?**
- Starts the Vite dev server
- Opens your app at `http://localhost:5173`
- Similar to `dotnet run` or `dotnet watch run`

You should see:
```
  VITE v5.x.x  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Open your browser** to `http://localhost:5173/` and you'll see the default Vite + React app!

---

## Project Structure Explained

Let's explore what Vite created for you:

```
my-first-react-app/
├── node_modules/          # Dependencies (like NuGet packages folder)
├── public/                # Static assets (served as-is)
│   └── vite.svg          # Favicon
├── src/                   # Your source code (like your .cs files)
│   ├── assets/           # Images, fonts, etc.
│   ├── App.css           # Styles for App component
│   ├── App.tsx           # Main App component
│   ├── index.css         # Global styles
│   ├── main.tsx          # Entry point (like Program.cs)
│   └── vite-env.d.ts     # TypeScript declarations for Vite
├── .gitignore            # Git ignore file
├── index.html            # HTML entry point
├── package.json          # Project metadata & dependencies (like .csproj)
├── tsconfig.json         # TypeScript configuration
├── tsconfig.node.json    # TypeScript config for Node scripts
└── vite.config.ts        # Vite configuration
```

### Key Files Explained

#### `package.json` (like `.csproj`)

```json
{
  "name": "my-first-react-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",                    // Start dev server
    "build": "tsc && vite build",     // Build for production
    "preview": "vite preview"         // Preview production build
  },
  "dependencies": {
    "react": "^18.3.1",               // React library
    "react-dom": "^18.3.1"            // React DOM renderer
  },
  "devDependencies": {
    "@types/react": "^18.3.1",        // TypeScript types for React
    "@types/react-dom": "^18.3.0",    // TypeScript types for React DOM
    "@vitejs/plugin-react": "^4.3.4", // Vite plugin for React
    "typescript": "^5.6.2",           // TypeScript compiler
    "vite": "^5.4.11"                 // Vite build tool
  }
}
```

**Analogy**:
- `dependencies` = Runtime dependencies (like NuGet packages)
- `devDependencies` = Development-only dependencies (like analyzers, test frameworks)
- `scripts` = Custom commands (like MSBuild targets)

#### `tsconfig.json` (TypeScript Configuration)

```json
{
  "compilerOptions": {
    "target": "ES2020",              // JavaScript version to compile to
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,                  // Vite handles compilation
    "jsx": "react-jsx",              // JSX transformation mode

    /* Linting */
    "strict": true,                  // Strict type checking (recommended!)
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Key Settings**:
- `strict: true` - Enables all strict type checking (like nullable reference types in C#)
- `jsx: "react-jsx"` - Tells TypeScript how to handle JSX
- `noEmit: true` - TypeScript only checks types, Vite handles compilation

#### `vite.config.ts` (Vite Configuration)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

**What it does**:
- Configures Vite to use the React plugin
- The React plugin handles JSX transformation and Fast Refresh (HMR)

#### `src/main.tsx` (Entry Point)

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**What's happening?**
1. Import React and ReactDOM libraries
2. Import the main `App` component
3. Import global styles
4. Find the `<div id="root">` in `index.html`
5. Render the `<App />` component into that div

**Analogy**: This is like `Program.cs` in .NET - the entry point of your application

#### `index.html` (HTML Entry Point)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Key Points**:
- `<div id="root">` - Where React will render your app
- `<script type="module" src="/src/main.tsx">` - Loads your TypeScript entry point
- Vite processes this during development and build

---

## Your First Component

Let's understand the default `App.tsx` component, then create our own!

### Understanding `App.tsx`

```typescript
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
```

**Breaking it down**:

1. **Imports**: Bring in dependencies
   ```typescript
   import { useState } from 'react'  // React hook for state
   import reactLogo from './assets/react.svg'  // Image import
   import './App.css'  // Component styles
   ```

2. **Component Function**: A function that returns JSX
   ```typescript
   function App() {
     // Component logic here
     return (/* JSX here */)
   }
   ```

3. **State**: Using the `useState` hook
   ```typescript
   const [count, setCount] = useState(0)
   // count = current value (like a property)
   // setCount = function to update it (like a setter)
   // useState(0) = initial value is 0
   ```

4. **Return JSX**: The component's UI
   ```typescript
   return (
     <>  {/* Fragment - groups elements without adding DOM node */}
       <h1>Vite + React</h1>
       <button onClick={() => setCount(count + 1)}>
         count is {count}
       </button>
     </>
   )
   ```

5. **Export**: Make the component available to other files
   ```typescript
   export default App
   ```

### Creating Your Own Component

Let's create a simple `Welcome` component!

**Create `src/Welcome.tsx`**:

```typescript
// Define props interface (like a DTO in .NET)
interface WelcomeProps {
  name: string;
  role: string;
}

// Component function with typed props
function Welcome(props: WelcomeProps) {
  return (
    <div>
      <h2>Welcome, {props.name}!</h2>
      <p>Your role: {props.role}</p>
    </div>
  );
}

export default Welcome;
```

**Or using destructuring (more common)**:

```typescript
interface WelcomeProps {
  name: string;
  role: string;
}

function Welcome({ name, role }: WelcomeProps) {
  return (
    <div>
      <h2>Welcome, {name}!</h2>
      <p>Your role: {role}</p>
    </div>
  );
}

export default Welcome;
```

**Use it in `App.tsx`**:

```typescript
import Welcome from './Welcome'

function App() {
  return (
    <div>
      <h1>My First React App</h1>
      <Welcome name="John Doe" role="Backend Developer" />
      <Welcome name="Jane Smith" role="Frontend Developer" />
    </div>
  )
}

export default App
```

**What's happening?**
- `Welcome` is a reusable component
- `WelcomeProps` defines the shape of data it accepts (like a C# interface)
- We pass data via props: `<Welcome name="..." role="..." />`
- TypeScript ensures we pass the correct props!

---

## JSX/TSX Syntax

**JSX** (JavaScript XML) is a syntax extension that lets you write HTML-like code in JavaScript. **TSX** is JSX with TypeScript.

### Key Rules

1. **Return a Single Root Element**
   ```typescript
   // ❌ Wrong - multiple root elements
   function Bad() {
     return (
       <h1>Title</h1>
       <p>Paragraph</p>
     )
   }

   // ✅ Correct - wrapped in a div
   function Good() {
     return (
       <div>
         <h1>Title</h1>
         <p>Paragraph</p>
       </div>
     )
   }

   // ✅ Also correct - using Fragment (<>)
   function AlsoGood() {
     return (
       <>
         <h1>Title</h1>
         <p>Paragraph</p>
       </>
     )
   }
   ```

2. **Close All Tags**
   ```typescript
   // ❌ Wrong
   <img src="logo.png">
   <br>

   // ✅ Correct
   <img src="logo.png" />
   <br />
   ```

3. **Use `className` Instead of `class`**
   ```typescript
   // ❌ Wrong - 'class' is a JavaScript keyword
   <div class="container">

   // ✅ Correct
   <div className="container">
   ```

4. **Embed JavaScript with `{}`**
   ```typescript
   const name = "John";
   const age = 30;

   return (
     <div>
       <p>Name: {name}</p>
       <p>Age: {age}</p>
       <p>Next year: {age + 1}</p>
       <p>Uppercase: {name.toUpperCase()}</p>
     </div>
   );
   ```

5. **Conditional Rendering**
   ```typescript
   const isLoggedIn = true;

   // Using ternary operator
   return (
     <div>
       {isLoggedIn ? <p>Welcome back!</p> : <p>Please log in</p>}
     </div>
   );

   // Using && for conditional display
   return (
     <div>
       {isLoggedIn && <p>Welcome back!</p>}
     </div>
   );
   ```

6. **Rendering Lists**
   ```typescript
   const users = ["Alice", "Bob", "Charlie"];

   return (
     <ul>
       {users.map((user, index) => (
         <li key={index}>{user}</li>
       ))}
     </ul>
   );
   ```

   **Important**: Always provide a `key` prop when rendering lists!

7. **Event Handling**
   ```typescript
   function handleClick() {
     alert("Button clicked!");
   }

   return (
     <button onClick={handleClick}>Click Me</button>
   );

   // Or inline
   return (
     <button onClick={() => alert("Clicked!")}>Click Me</button>
   );
   ```

   **Note**: Event handlers are camelCase: `onClick`, `onChange`, `onSubmit`

8. **Styles**
   ```typescript
   // Inline styles (object with camelCase properties)
   const divStyle = {
     backgroundColor: 'blue',
     fontSize: '20px'
   };

   return <div style={divStyle}>Styled div</div>;

   // Or inline
   return <div style={{ color: 'red', padding: '10px' }}>Red text</div>;
   ```

---

## Exercises

### Exercise 1: Modify the Default App

**Task**: Modify `App.tsx` to display your name and a personalized message.

**Requirements**:
- Change the heading to "Welcome to [Your Name]'s React App"
- Remove the counter button
- Add a paragraph describing why you're learning React

**Hint**: Just edit the JSX in the return statement!

---

### Exercise 2: Create a Greeting Component

**Task**: Create a `Greeting.tsx` component that displays a personalized greeting.

**Requirements**:
- Accept a `name` prop (string)
- Accept a `timeOfDay` prop (string: "morning", "afternoon", "evening")
- Display: "Good [timeOfDay], [name]!"
- Use TypeScript interface for props

**Example usage**:
```typescript
<Greeting name="John" timeOfDay="morning" />
// Should display: "Good morning, John!"
```

---

### Exercise 3: Create a UserCard Component

**Task**: Create a `UserCard.tsx` component that displays user information.

**Requirements**:
- Accept props: `name`, `email`, `role`, `isActive` (boolean)
- Display all information in a styled card
- Show "Active" in green or "Inactive" in red based on `isActive`
- Use conditional rendering for the active status

**Example usage**:
```typescript
<UserCard 
  name="Jane Doe" 
  email="jane@example.com" 
  role="Developer" 
  isActive={true} 
/>
```

---

### Exercise 4: Create a List Component

**Task**: Create a `TodoList.tsx` component that displays a list of todos.

**Requirements**:
- Accept a `todos` prop (array of strings)
- Render each todo as a list item
- If the list is empty, display "No todos yet!"
- Use proper `key` props

**Example usage**:
```typescript
<TodoList todos={["Learn React", "Build an app", "Deploy it"]} />
```

---

## Solutions

### Solution 1: Modify the Default App

```typescript
import './App.css'

function App() {
  return (
    <div>
      <h1>Welcome to John's React App</h1>
      <p>
        I'm learning React to expand my skills as a backend developer 
        and build full-stack applications. React's component-based 
        architecture and TypeScript support make it a great choice!
      </p>
    </div>
  )
}

export default App
```

---

### Solution 2: Create a Greeting Component

**`src/Greeting.tsx`**:

```typescript
interface GreetingProps {
  name: string;
  timeOfDay: "morning" | "afternoon" | "evening"; // Union type for specific values
}

function Greeting({ name, timeOfDay }: GreetingProps) {
  return (
    <h2>Good {timeOfDay}, {name}!</h2>
  );
}

export default Greeting;
```

**Usage in `App.tsx`**:

```typescript
import Greeting from './Greeting'

function App() {
  return (
    <div>
      <Greeting name="John" timeOfDay="morning" />
      <Greeting name="Jane" timeOfDay="afternoon" />
    </div>
  )
}

export default App
```

---

### Solution 3: Create a UserCard Component

**`src/UserCard.tsx`**:

```typescript
interface UserCardProps {
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

function UserCard({ name, email, role, isActive }: UserCardProps) {
  return (
    <div style={{ 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      padding: '16px',
      margin: '16px 0',
      maxWidth: '300px'
    }}>
      <h3>{name}</h3>
      <p><strong>Email:</strong> {email}</p>
      <p><strong>Role:</strong> {role}</p>
      <p>
        <strong>Status:</strong>{' '}
        <span style={{ color: isActive ? 'green' : 'red' }}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </p>
    </div>
  );
}

export default UserCard;
```

**Usage in `App.tsx`**:

```typescript
import UserCard from './UserCard'

function App() {
  return (
    <div>
      <h1>User Directory</h1>
      <UserCard 
        name="Jane Doe" 
        email="jane@example.com" 
        role="Developer" 
        isActive={true} 
      />
      <UserCard 
        name="John Smith" 
        email="john@example.com" 
        role="Designer" 
        isActive={false} 
      />
    </div>
  )
}

export default App
```

---

### Solution 4: Create a List Component

**`src/TodoList.tsx`**:

```typescript
interface TodoListProps {
  todos: string[];
}

function TodoList({ todos }: TodoListProps) {
  // Handle empty list
  if (todos.length === 0) {
    return <p>No todos yet!</p>;
  }

  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index}>{todo}</li>
      ))}
    </ul>
  );
}

export default TodoList;
```

**Usage in `App.tsx`**:

```typescript
import TodoList from './TodoList'

function App() {
  const myTodos = ["Learn React", "Build an app", "Deploy it"];
  const emptyTodos: string[] = [];

  return (
    <div>
      <h1>My Todos</h1>
      <TodoList todos={myTodos} />
      
      <h1>Empty List</h1>
      <TodoList todos={emptyTodos} />
    </div>
  )
}

export default App
```

---

## Common Pitfalls

### 1. Forgetting to Import React (in older versions)

**Old React (before 17)**:
```typescript
import React from 'react' // Required!

function App() {
  return <div>Hello</div>
}
```

**Modern React (17+)**:
With the new JSX transform, you don't need to import React in every file!

```typescript
// No import needed!
function App() {
  return <div>Hello</div>
}
```

### 2. Using `class` Instead of `className`

```typescript
// ❌ Wrong
<div class="container">

// ✅ Correct
<div className="container">
```

### 3. Forgetting to Close Tags

```typescript
// ❌ Wrong
<img src="logo.png">

// ✅ Correct
<img src="logo.png" />
```

### 4. Not Providing `key` in Lists

```typescript
// ❌ Wrong - React will warn you
{items.map(item => <li>{item}</li>)}

// ✅ Correct
{items.map((item, index) => <li key={index}>{item}</li>)}

// ✅ Better - use unique ID if available
{items.map(item => <li key={item.id}>{item.name}</li>)}
```

### 5. Mutating State Directly

```typescript
// ❌ Wrong - never mutate state directly
const [count, setCount] = useState(0);
count = count + 1; // This won't work!

// ✅ Correct - use the setter function
setCount(count + 1);
```

### 6. Incorrect Event Handler Syntax

```typescript
// ❌ Wrong - this calls the function immediately
<button onClick={handleClick()}>Click</button>

// ✅ Correct - pass the function reference
<button onClick={handleClick}>Click</button>

// ✅ Also correct - use arrow function for inline logic
<button onClick={() => handleClick()}>Click</button>
```

### 7. TypeScript Errors with Props

```typescript
// ❌ Wrong - missing required prop
<Welcome name="John" />  // Error: Property 'role' is missing

// ✅ Correct - provide all required props
<Welcome name="John" role="Developer" />

// ✅ Or make the prop optional in the interface
interface WelcomeProps {
  name: string;
  role?: string;  // Optional with ?
}
```

---

## Testing Your Knowledge

Before moving to Unit 2, make sure you can answer these questions:

1. What is Vite and why is it faster than Webpack?
2. How is TypeScript similar to C#?
3. What is JSX/TSX?
4. What's the difference between `class` and `className`?
5. How do you pass data to a component?
6. What's the purpose of the `key` prop in lists?
7. How do you define props with TypeScript?
8. What's the difference between `<div></div>` and `<></>`?

---

## Further Reading

### Official Documentation
- [React Official Docs](https://react.dev/) - The best resource for learning React
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) - Comprehensive TypeScript guide
- [Vite Guide](https://vitejs.dev/guide/) - Learn more about Vite

### Recommended Articles
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/) - Quick reference
- [Why Vite?](https://vitejs.dev/guide/why.html) - Deep dive into Vite's advantages

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools) - Browser extension for debugging React
- [TypeScript Playground](https://www.typescriptlang.org/play) - Try TypeScript in your browser

---

## Next Steps

Congratulations! 🎉 You've completed Unit 1!

You now understand:
- ✅ What Vite is and how it works
- ✅ TypeScript basics and how they relate to C#
- ✅ How to set up a React project
- ✅ How to create components
- ✅ JSX/TSX syntax

**Ready for more?** Head to [Unit 2: Components and Props](../unit-02-components-props/README.md) to dive deeper into component composition and data flow!

---

*Happy coding! 🚀*
