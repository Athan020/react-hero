# Unit 10: Final Project - Complete Website

**Time**: 6-8 hours | **Level**: Advanced

## 🎯 Project Goal

Build a complete, production-ready React application that demonstrates all the concepts you've learned throughout this tutorial series.

## Project Options

Choose one of these projects (or create your own!):

### Option 1: Task Management App
- User authentication
- Create, read, update, delete tasks
- Categories and tags
- Filter and search
- Due dates and priorities
- Dark mode toggle

### Option 2: Blog Platform
- User authentication
- Create and edit blog posts
- Markdown support
- Comments system
- Like/bookmark posts
- User profiles

### Option 3: E-Commerce Product Catalog
- Product listing with search/filter
- Product details page
- Shopping cart
- Checkout flow
- Order history
- User authentication

## Project Requirements

### Must Include:

1. **Routing** (Unit 6)
   - Multiple pages
   - Dynamic routes
   - Protected routes
   - 404 page

2. **State Management** (Unit 7)
   - Global state (Context or Zustand)
   - Complex state logic (useReducer)

3. **API Integration** (Unit 5)
   - Fetch data from API
   - POST/PUT/DELETE operations
   - Loading and error states
   - Use React Query (optional but recommended)

4. **Forms** (Unit 4)
   - Form validation
   - Error handling
   - React Hook Form

5. **Performance** (Unit 8)
   - Code splitting
   - Lazy loading
   - Memoization where appropriate

6. **Testing** (Unit 9)
   - Unit tests for components
   - Integration tests
   - E2E test for critical flow

7. **TypeScript** (Throughout)
   - Proper type definitions
   - No `any` types

8. **Styling**
   - Responsive design
   - Professional UI
   - CSS Modules or styled-components

## Example: Task Management App Structure

```
task-manager/
├── src/
│   ├── components/
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskList.tsx
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   └── NotFound.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTasks.ts
│   │   └── useLocalStorage.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── api/
│   │   └── tasks.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── components/
│   └── e2e/
└── package.json
```

## Implementation Guide

### Step 1: Project Setup

```bash
npm create vite@latest task-manager -- --template react-ts
cd task-manager
npm install
npm install react-router-dom zustand react-hook-form @tanstack/react-query
npm install -D vitest @testing-library/react @playwright/test
```

### Step 2: Define Types

```typescript
// src/types/index.ts
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
```

### Step 3: Set Up Routing

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### Step 4: Create State Management

```typescript
// src/store/taskStore.ts
import { create } from 'zustand';
import { Task } from '../types';

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }]
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(task =>
      task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
    )
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(task => task.id !== id)
  })),
  
  toggleTask: (id) => set((state) => ({
    tasks: state.tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    )
  })),
}));
```

### Step 5: Build Components

```typescript
// src/components/TaskCard.tsx
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  return (
    <div className={`task-card priority-${task.priority}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggle}
      />
      <div>
        <h3>{task.title}</h3>
        <p>{task.description}</p>
        <span>{task.category}</span>
        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
      </div>
      <button onClick={onDelete}>Delete</button>
    </div>
  );
}
```

### Step 6: Add Tests

```typescript
// src/components/TaskCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    priority: 'high' as const,
    dueDate: '2024-12-31',
    category: 'Work',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  it('renders task information', () => {
    render(<TaskCard task={mockTask} onToggle={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('calls onToggle when checkbox is clicked', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    
    render(<TaskCard task={mockTask} onToggle={onToggle} onDelete={() => {}} />);
    await user.click(screen.getByRole('checkbox'));
    
    expect(onToggle).toHaveBeenCalled();
  });
});
```

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Drag and drop 'dist' folder to Netlify
```

### GitHub Pages

```bash
npm install -D gh-pages
```

Add to `package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

## Checklist

- [ ] Project setup complete
- [ ] Routing implemented
- [ ] State management working
- [ ] API integration (or mock data)
- [ ] Forms with validation
- [ ] Responsive design
- [ ] Dark mode (optional)
- [ ] Tests written
- [ ] Performance optimized
- [ ] Deployed to production
- [ ] README with screenshots

## Congratulations! 🎉

You've completed the React Hero tutorial series! You now have:

- ✅ Solid understanding of React fundamentals
- ✅ TypeScript proficiency
- ✅ Modern tooling knowledge (Vite)
- ✅ Production-ready skills
- ✅ A complete portfolio project

## What's Next?

- Explore Next.js for server-side rendering
- Learn React Native for mobile apps
- Dive deeper into advanced patterns
- Contribute to open-source React projects
- Build more projects!

---

*You're now a React Hero! 🚀*
