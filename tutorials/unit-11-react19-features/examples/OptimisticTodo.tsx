// OptimisticTodo.tsx
// Demonstrates React 19's useOptimistic hook for instant UI feedback
// Items appear immediately while the server request is in-flight

import { useState, useOptimistic, useRef } from 'react';

// --- Types ---

interface Todo {
    id: string;
    text: string;
    completed: boolean;
    sending?: boolean; // Optimistic flag — true while the server hasn't confirmed
}

// --- Server simulation ---

let nextId = 1;

async function serverAddTodo(text: string): Promise<Todo> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate occasional failure
    if (Math.random() < 0.15) {
        throw new Error('Failed to add todo');
    }

    return {
        id: `server-${nextId++}`,
        text,
        completed: false,
    };
}

async function serverToggleTodo(id: string, completed: boolean): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
}

async function serverDeleteTodo(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (Math.random() < 0.1) {
        throw new Error('Failed to delete todo');
    }
}

// --- Component ---

export default function OptimisticTodo() {
    const [todos, setTodos] = useState<Todo[]>([
        { id: '1', text: 'Learn React 19 Actions', completed: true },
        { id: '2', text: 'Try useOptimistic', completed: false },
        { id: '3', text: 'Build something cool', completed: false },
    ]);
    const [error, setError] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    // Optimistic state — shows pending changes before server confirms
    const [optimisticTodos, updateOptimistic] = useOptimistic(
        todos,
        (currentTodos: Todo[], action: { type: string; payload: any }) => {
            switch (action.type) {
                case 'add':
                    return [
                        ...currentTodos,
                        {
                            id: `optimistic-${Date.now()}`,
                            text: action.payload,
                            completed: false,
                            sending: true,
                        },
                    ];
                case 'toggle':
                    return currentTodos.map(todo =>
                        todo.id === action.payload
                            ? { ...todo, completed: !todo.completed, sending: true }
                            : todo
                    );
                case 'delete':
                    return currentTodos.filter(todo => todo.id !== action.payload);
                default:
                    return currentTodos;
            }
        }
    );

    // --- Add Todo ---
    async function addTodoAction(formData: FormData) {
        const text = formData.get('todo') as string;
        if (!text.trim()) return;

        setError(null);
        formRef.current?.reset();

        // Show optimistic update immediately
        updateOptimistic({ type: 'add', payload: text });

        try {
            const newTodo = await serverAddTodo(text);
            setTodos(prev => [...prev, newTodo]);
        } catch (err) {
            setError(`Failed to add "${text}" — it has been removed`);
            // React automatically reverts the optimistic update!
        }
    }

    // --- Toggle Todo ---
    async function toggleTodo(id: string) {
        setError(null);
        updateOptimistic({ type: 'toggle', payload: id });

        try {
            const todo = todos.find(t => t.id === id);
            if (todo) {
                await serverToggleTodo(id, !todo.completed);
                setTodos(prev =>
                    prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
                );
            }
        } catch {
            setError('Failed to update todo');
        }
    }

    // --- Delete Todo ---
    async function deleteTodo(id: string) {
        setError(null);
        updateOptimistic({ type: 'delete', payload: id });

        try {
            await serverDeleteTodo(id);
            setTodos(prev => prev.filter(t => t.id !== id));
        } catch {
            setError('Failed to delete todo — it has been restored');
        }
    }

    return (
        <div style={{ maxWidth: '500px', margin: '40px auto', fontFamily: 'system-ui' }}>
            <h2>✅ Optimistic Todo List</h2>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
                Items appear instantly — if the server fails, they roll back automatically.
            </p>

            {/* Error notification */}
            {error && (
                <div
                    style={{
                        padding: '12px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        color: '#991b1b',
                        marginBottom: '16px',
                        fontSize: '14px',
                    }}
                >
                    ⚠️ {error}
                </div>
            )}

            {/* Add form */}
            <form ref={formRef} action={addTodoAction} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input
                    name="todo"
                    placeholder="Add a new todo..."
                    required
                    style={{
                        flex: 1,
                        padding: '10px 14px',
                        fontSize: '14px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        outline: 'none',
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                    }}
                >
                    Add
                </button>
            </form>

            {/* Todo list — uses optimisticTodos for instant UI */}
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {optimisticTodos.map(todo => (
                    <li
                        key={todo.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px',
                            marginBottom: '6px',
                            backgroundColor: todo.sending ? '#f8fafc' : '#ffffff',
                            border: `1px solid ${todo.sending ? '#cbd5e1' : '#e2e8f0'}`,
                            borderRadius: '8px',
                            opacity: todo.sending ? 0.7 : 1,
                            transition: 'opacity 0.2s',
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo.id)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span
                            style={{
                                flex: 1,
                                textDecoration: todo.completed ? 'line-through' : 'none',
                                color: todo.completed ? '#94a3b8' : '#1e293b',
                            }}
                        >
                            {todo.text}
                        </span>
                        {todo.sending && (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                ✈️ Saving...
                            </span>
                        )}
                        <button
                            onClick={() => deleteTodo(todo.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '16px',
                                color: '#ef4444',
                                padding: '4px',
                            }}
                            aria-label={`Delete ${todo.text}`}
                        >
                            🗑️
                        </button>
                    </li>
                ))}
            </ul>

            {optimisticTodos.length === 0 && (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                    No todos yet — add one above!
                </p>
            )}

            {/* Stats */}
            <div style={{ marginTop: '16px', fontSize: '13px', color: '#64748b' }}>
                {optimisticTodos.filter(t => t.completed).length} of{' '}
                {optimisticTodos.length} completed
            </div>
        </div>
    );
}
