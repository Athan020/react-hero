

interface TodoListProps {
    todos: string[];
}



function TodoList({ todos }: TodoListProps) {


    let hasTodos = todos.length > 0;

    return (
        <>
            <ul>
                {hasTodos ?
                    todos.map((todo, index) => (
                        <li key={index}>{todo}</li>
                    )) : <p>No todos yet!</p>}
            </ul>
        </>
    );
}

export default TodoList;