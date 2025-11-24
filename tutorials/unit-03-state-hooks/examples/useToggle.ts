import { useState } from 'react';

function useToggle(initialValue: boolean = false) {
    const [value, setValue] = useState(initialValue);

    const toggle = () => setValue(prev => !prev);
    const setTrue = () => setValue(true);
    const setFalse = () => setValue(false);

    return { value, toggle, setTrue, setFalse };
}

export default useToggle;
