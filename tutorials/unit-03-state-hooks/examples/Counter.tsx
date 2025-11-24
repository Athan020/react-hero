import { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);

    const increment = () => setCount(count + 1);
    const decrement = () => setCount(count - 1);
    const reset = () => setCount(0);

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Counter: {count}</h2>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={decrement}>-</button>
                <button onClick={reset}>Reset</button>
                <button onClick={increment}>+</button>
            </div>
        </div>
    );
}

export default Counter;
