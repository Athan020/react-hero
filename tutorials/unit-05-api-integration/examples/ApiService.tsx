// Unit 5 Example: API Service Layer with React Query
// Type-safe API client and data fetching

import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================
// Types
// ============================================

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    createdAt: string;
}

export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
}

// ============================================
// API Client
// ============================================

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://jsonplaceholder.typicode.com',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============================================
// API Service
// ============================================

export const userApi = {
    getAll: async (): Promise<User[]> => {
        const response = await apiClient.get('/users');
        return response.data;
    },

    getById: async (id: number): Promise<User> => {
        const response = await apiClient.get(`/users/${id}`);
        return response.data;
    },

    create: async (data: CreateUserDto): Promise<User> => {
        const response = await apiClient.post('/users', data);
        return response.data;
    },

    update: async (id: number, data: UpdateUserDto): Promise<User> => {
        const response = await apiClient.patch(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    },
};

// ============================================
// Custom Hooks
// ============================================

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: userApi.getAll,
    });
}

export function useUser(id: number) {
    return useQuery({
        queryKey: ['user', id],
        queryFn: () => userApi.getById(id),
        enabled: id > 0,
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) =>
            userApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', id] });
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: userApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

// ============================================
// Example Component
// ============================================

export function UserListExample() {
    const { data: users, isLoading, error, refetch } = useUsers();
    const createUser = useCreateUser();
    const deleteUser = useDeleteUser();

    if (isLoading) {
        return <div className="loading">Loading users...</div>;
    }

    if (error) {
        return (
            <div className="error">
                <p>Error loading users: {error.message}</p>
                <button onClick={() => refetch()}>Retry</button>
            </div>
        );
    }

    const handleCreateUser = async () => {
        try {
            await createUser.mutateAsync({
                name: 'New User',
                email: 'new@example.com',
                password: 'password123',
            });
            alert('User created!');
        } catch (err) {
            alert('Failed to create user');
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (window.confirm('Are you sure?')) {
            await deleteUser.mutateAsync(id);
        }
    };

    return (
        <div className="user-list">
            <div className="header">
                <h2>Users</h2>
                <button onClick={handleCreateUser} disabled={createUser.isPending}>
                    {createUser.isPending ? 'Creating...' : 'Add User'}
                </button>
            </div>

            <ul>
                {users?.map((user) => (
                    <li key={user.id}>
                        <span>{user.name} - {user.email}</span>
                        <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deleteUser.isPending}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserListExample;
