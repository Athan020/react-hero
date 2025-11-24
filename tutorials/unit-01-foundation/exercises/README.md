# Unit 1 Exercises

Complete these exercises to practice what you've learned in Unit 1.

## Exercise 1: Modify the Default App

**File**: Work in your project's `src/App.tsx`

**Task**: Modify the default Vite app to display your name and a personalized message.

**Requirements**:
- Change the heading to "Welcome to [Your Name]'s React App"
- Remove the counter button
- Add a paragraph describing why you're learning React

**Hint**: Just edit the JSX in the return statement!

---

## Exercise 2: Create a Greeting Component

**File**: Create `src/Greeting.tsx`

**Task**: Create a component that displays a personalized greeting.

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

**Starter code**:
```typescript
interface GreetingProps {
  // TODO: Define props
}

function Greeting(/* TODO: Add parameters */) {
  return (
    // TODO: Return JSX
  );
}

export default Greeting;
```

---

## Exercise 3: Create a UserCard Component

**File**: Create `src/UserCard.tsx`

**Task**: Create a component that displays user information in a card.

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

**Starter code**:
```typescript
interface UserCardProps {
  // TODO: Define props
}

function UserCard(/* TODO: Add parameters */) {
  return (
    <div style={{ 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      padding: '16px',
      margin: '16px 0',
      maxWidth: '300px'
    }}>
      {/* TODO: Add content */}
    </div>
  );
}

export default UserCard;
```

---

## Exercise 4: Create a TodoList Component

**File**: Create `src/TodoList.tsx`

**Task**: Create a component that displays a list of todos.

**Requirements**:
- Accept a `todos` prop (array of strings)
- Render each todo as a list item
- If the list is empty, display "No todos yet!"
- Use proper `key` props

**Example usage**:
```typescript
<TodoList todos={["Learn React", "Build an app", "Deploy it"]} />
```

**Starter code**:
```typescript
interface TodoListProps {
  // TODO: Define props
}

function TodoList(/* TODO: Add parameters */) {
  // TODO: Handle empty list

  return (
    // TODO: Return JSX
  );
}

export default TodoList;
```

---

## Testing Your Solutions

To test your components, import and use them in `App.tsx`:

```typescript
import Greeting from './Greeting'
import UserCard from './UserCard'
import TodoList from './TodoList'

function App() {
  return (
    <div>
      <h1>Exercise Solutions</h1>
      
      <Greeting name="John" timeOfDay="morning" />
      
      <UserCard 
        name="Jane Doe" 
        email="jane@example.com" 
        role="Developer" 
        isActive={true} 
      />
      
      <TodoList todos={["Learn React", "Build an app", "Deploy it"]} />
    </div>
  )
}

export default App
```

---

## Solutions

Solutions are available in the `solutions/` folder. Try to complete the exercises on your own before checking the solutions!

---

**Good luck! 🚀**
