# Unit 10: Final Project

**Time**: 6-8 hours | **Level**: Intermediate-Advanced

## 🎯 Learning Objectives

By the end of this unit, you will:
- Apply everything you've learned to build a complete application
- Structure a React project professionally
- Implement a full-stack feature set
- Deploy your application to production
- Have a portfolio-ready project

## 📚 Table of Contents

1. [Project Options](#project-options)
2. [Requirements](#requirements)
3. [Tech Stack](#tech-stack)
4. [Architecture Guide](#architecture-guide)
5. [Step-by-Step Implementation](#step-by-step-implementation)
6. [Deployment](#deployment)
7. [Production Checklist](#production-checklist)
8. [Next Steps in Your Journey](#next-steps-in-your-journey)

---

## Project Options

Choose one of the following projects based on your interests:

### Option A: Task Management App (TodoMVC+)

A feature-rich task management application.

**Features**:
- Create, edit, delete tasks
- Mark tasks as complete
- Filter by status (all, active, completed)
- Search tasks
- Categories/tags
- Due dates
- Persistent storage (localStorage or API)
- Dark/light theme

---

### Option B: Blog Platform

A personal blog with protected admin features.

**Features**:
- Public blog posts list
- Individual post pages
- Admin authentication
- Create/edit/delete posts (admin only)
- Markdown support
- Categories and tags
- Search functionality
- Responsive design

---

### Option C: Portfolio Website

A professional portfolio to showcase your work.

**Features**:
- Hero section with intro
- Projects showcase
- Skills section
- About page
- Contact form
- Smooth animations
- Responsive design
- Dark/light theme

---

## Requirements

### Functional Requirements

Regardless of which project you choose:

| Requirement | Description |
|-------------|-------------|
| **Multiple Pages** | At least 3 routes |
| **Forms** | At least 1 form with validation |
| **State Management** | Context or Zustand for global state |
| **API Integration** | Fetch data from API or use mock data |
| **Error Handling** | Handle loading, error, empty states |
| **Responsive** | Works on mobile, tablet, desktop |
| **Accessible** | Keyboard navigable, proper ARIA |

### Non-Functional Requirements

| Requirement | Description |
|-------------|-------------|
| **TypeScript** | Fully typed, no `any` |
| **Tests** | At least 3 component tests |
| **Performance** | Lighthouse score > 90 |
| **Code Quality** | ESLint clean, consistent style |

---

## Tech Stack

### Required

- **React 18+** with TypeScript
- **Vite** for build tooling
- **React Router** for routing
- **React Query** for data fetching
- **React Hook Form + Zod** for forms
- **Context or Zustand** for state

### Recommended

- **CSS Modules** or **Tailwind CSS** for styling
- **Vitest + Testing Library** for tests
- **MSW** for API mocking
- **Vercel/Netlify** for deployment

---

## Architecture Guide

### Folder Structure

```
src/
├── api/                    # API client and service functions
│   ├── client.ts           # Axios instance
│   ├── tasks.ts            # Task API functions
│   └── types.ts            # API types
│
├── components/             # Reusable UI components
│   ├── ui/                 # Generic UI (Button, Input, Card)
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.module.css
│   │   └── ...
│   └── features/           # Feature-specific components
│       ├── TaskList/
│       ├── TaskForm/
│       └── ...
│
├── context/                # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── hooks/                  # Custom hooks
│   ├── useAuth.ts
│   ├── useLocalStorage.ts
│   └── useTasks.ts
│
├── pages/                  # Route pages
│   ├── Home.tsx
│   ├── Tasks.tsx
│   ├── TaskDetail.tsx
│   └── NotFound.tsx
│
├── stores/                 # Zustand stores (if using)
│   └── taskStore.ts
│
├── test/                   # Test setup and utilities
│   ├── setup.ts
│   ├── handlers.ts
│   └── utils.tsx
│
├── types/                  # Shared TypeScript types
│   └── index.ts
│
├── utils/                  # Utility functions
│   ├── formatDate.ts
│   └── cn.ts               # classnames helper
│
├── App.tsx                 # Main app component
├── main.tsx                # Entry point
└── index.css               # Global styles
```

### Component Pattern

```typescript
// components/features/TaskList/TaskList.tsx
import { useTasks } from '../../../hooks/useTasks';
import { TaskCard } from './TaskCard';
import { TaskListSkeleton } from './TaskListSkeleton';
import { EmptyState } from '../../ui/EmptyState';
import styles from './TaskList.module.css';

interface TaskListProps {
  filter?: 'all' | 'active' | 'completed';
}

export function TaskList({ filter = 'all' }: TaskListProps) {
  const { tasks, isLoading, error } = useTasks(filter);

  if (isLoading) return <TaskListSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (tasks.length === 0) return <EmptyState message="No tasks yet" />;

  return (
    <ul className={styles.list}>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </ul>
  );
}
```

---

## Step-by-Step Implementation

### Step 1: Project Setup (30 min)

```bash
# Create project
npm create vite@latest my-project -- --template react-ts
cd my-project

# Install dependencies
npm install react-router-dom @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers zod
npm install axios

# Dev dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event jsdom msw
```

### Step 2: Configure Vite and Testing (20 min)

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
  },
});
```

### Step 3: Set Up Routing (30 min)

```typescript
// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Tasks } from './pages/Tasks';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks/:id" element={<TaskDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
```

### Step 4: Create UI Components (1-2 hours)

Build your component library:
- Button
- Input
- Card
- Modal
- Loading/Skeleton
- ErrorMessage
- EmptyState

### Step 5: Implement Features (3-4 hours)

Implement core features one at a time:
1. List items
2. Create item
3. Edit item
4. Delete item
5. Filter/search
6. Theme toggle

### Step 6: Add Tests (1 hour)

Write tests for critical paths:
- Rendering components
- Form submission
- User interactions

### Step 7: Polish and Deploy (1 hour)

- Fix any bugs
- Add error boundaries
- Optimize performance
- Deploy to Vercel/Netlify

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com).

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### GitHub Pages

```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/repo-name"
}

# Deploy
npm run deploy
```

---

## Production Checklist

### Performance

- [ ] Lighthouse Performance > 90
- [ ] Code splitting implemented
- [ ] Images optimized
- [ ] No unused dependencies

### SEO

- [ ] Proper title tags
- [ ] Meta descriptions
- [ ] Semantic HTML
- [ ] robots.txt

### Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Color contrast passes
- [ ] Form labels present

### Security

- [ ] No secrets in code
- [ ] HTTPS enabled
- [ ] Input validation
- [ ] XSS protection

---

## Next Steps in Your Journey

### Immediate Next Steps

1. **Build 2-3 more projects** to solidify skills
2. **Contribute to open source** React projects
3. **Learn Next.js** for server-side rendering
4. **Explore React Native** for mobile development

### Advanced Topics to Learn

| Topic | Description |
|-------|-------------|
| **Next.js** | Server-side rendering, API routes |
| **React Native** | Mobile app development |
| **GraphQL** | Alternative to REST APIs |
| **Storybook** | Component documentation |
| **CI/CD** | Automated testing and deployment |
| **Web Sockets** | Real-time features |
| **PWA** | Progressive Web Apps |

### Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Frontend Masters](https://frontendmasters.com)
- [Epic React by Kent C. Dodds](https://epicreact.dev)
- [ui.dev](https://ui.dev)

---

## Congratulations! 🎉

You've completed the React Hero tutorial series!

You now have the skills to:
- Build production-ready React applications
- Write type-safe code with TypeScript
- Manage complex state effectively
- Test your applications properly
- Deploy to production

**What's next?** Start building! The best way to learn is by doing. Pick a project that interests you and start coding.

Good luck on your React journey! 🚀
