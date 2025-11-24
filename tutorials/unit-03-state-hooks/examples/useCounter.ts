import { useState } from 'react';

function useCounter(initialValue: number = 0) {
    const [count, setCount] = useState(initialValue);

    const increment = () => setCount(prev => prev + 1);
    const decrement = () => setCount(prev => prev - 1);
    const reset = () => setCount(initialValue);
    const setValue = (value: number) => setCount(value);

    return { count, increment, decrement, reset, setValue };
}

export default useCounter;
