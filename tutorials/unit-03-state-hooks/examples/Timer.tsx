import { useState, useEffect } from 'react';

function Timer() {
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            setSeconds(prev => prev + 1);
        }, 1000);

        // Cleanup function
        return () => {
            clearInterval(interval);
        };
    }, [isRunning]);

    const start = () => setIsRunning(true);
    const stop = () => setIsRunning(false);
    const reset = () => {
        setIsRunning(false);
        setSeconds(0);
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Timer: {seconds}s</h2>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                {!isRunning ? (
                    <button onClick={start}>Start</button>
                ) : (
                    <button onClick={stop}>Stop</button>
                )}
                <button onClick={reset}>Reset</button>
            </div>
        </div>
    );
}

export default Timer;
