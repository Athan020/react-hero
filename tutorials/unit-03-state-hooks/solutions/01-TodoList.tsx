import { useState } from 'react';

interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

function TodoList() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [inputValue, setInputValue] = useState('');

    const addTodo = () => {
        if (inputValue.trim() === '') return;

        const newTodo: Todo = {
            id: Date.now(),
            text: inputValue,
            completed: false
        };

        setTodos([...todos, newTodo]);
        setInputValue('');
    };

    const toggleTodo = (id: number) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const deleteTodo = (id: number) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const activeTodos = todos.filter(todo => !todo.completed).length;

    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
            <h2>Todo List</h2>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addTodo()}
                    placeholder="Add a new todo..."
                    style={{ flex: 1, padding: '8px' }}
                />
                <button onClick={addTodo}>Add</button>
            </div>

            <p>Active todos: {activeTodos}</p>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {todos.map(todo => (
                    <li
                        key={todo.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px',
                            borderBottom: '1px solid #eee'
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo.id)}
                        />
                        <span
                            onClick={() => toggleTodo(todo.id)}
                            style={{
                                flex: 1,
                                textDecoration: todo.completed ? 'line-through' : 'none',
                                cursor: 'pointer',
                                color: todo.completed ? '#999' : '#000'
                            }}
                        >
                            {todo.text}
                        </span>
                        <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TodoList;
