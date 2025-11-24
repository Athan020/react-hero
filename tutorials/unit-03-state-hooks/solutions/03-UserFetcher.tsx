import { useState, useEffect } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    website: string;
}

function UserFetcher() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = () => {
        setLoading(true);
        setError(null);

        fetch('https://jsonplaceholder.typicode.com/users/1')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                return response.json();
            })
            .then(data => {
                setUser(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUser();
    }, []);

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>;
    }

    if (error) {
        return (
            <div style={{ padding: '20px', color: 'red' }}>
                <p>Error: {error}</p>
                <button onClick={fetchUser}>Retry</button>
            </div>
        );
    }

    if (!user) {
        return <div style={{ padding: '20px' }}>No user found</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '400px' }}>
            <h2>{user.name}</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Website:</strong> {user.website}</p>
            <button onClick={fetchUser}>Refetch</button>
        </div>
    );
}

export default UserFetcher;
