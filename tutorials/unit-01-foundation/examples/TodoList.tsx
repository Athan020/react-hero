interface TodoListProps {
    todos: string[];
}

function TodoList({ todos }: TodoListProps) {
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
