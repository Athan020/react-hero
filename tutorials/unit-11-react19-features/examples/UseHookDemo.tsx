// UseHookDemo.tsx
// Demonstrates React 19's use() hook for reading Promises and Context
// Replaces the traditional useEffect + useState pattern for data fetching

import { use, Suspense, createContext, useState } from 'react';

// --- Types ---

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string;
}

interface Activity {
    id: number;
    action: string;
    timestamp: string;
}

// --- Context example ---

type Theme = 'light' | 'dark';

const ThemeContext = createContext<Theme>('light');

// --- Data fetching (simulated) ---

function fetchUser(id: number): Promise<User> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id,
                name: 'Sarah Chen',
                email: 'sarah@example.com',
                role: 'Frontend Engineer',
                avatar: '👩‍💻',
            });
        }, 1200);
    });
}

function fetchActivities(userId: number): Promise<Activity[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 1, action: 'Pushed to main branch', timestamp: '2 hours ago' },
                { id: 2, action: 'Reviewed pull request #42', timestamp: '4 hours ago' },
                { id: 3, action: 'Deployed v2.1.0 to production', timestamp: '1 day ago' },
                { id: 4, action: 'Created issue: Update dependencies', timestamp: '2 days ago' },
            ]);
        }, 800);
    });
}

// --- Cache for promises (prevents re-creation on re-render) ---

const promiseCache = new Map<string, Promise<any>>();

function getCachedPromise<T>(key: string, factory: () => Promise<T>): Promise<T> {
    if (!promiseCache.has(key)) {
        promiseCache.set(key, factory());
    }
    return promiseCache.get(key)!;
}

// --- Components using use() ---

function UserCard({ userPromise }: { userPromise: Promise<User> }) {
    // use() suspends until the promise resolves — no useEffect needed!
    const user = use(userPromise);

    // use() also works with Context — and unlike useContext, it works in conditionals
    const theme = use(ThemeContext);

    const isDark = theme === 'dark';

    return (
        <div
            style={{
                padding: '24px',
                borderRadius: '12px',
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                color: isDark ? '#f1f5f9' : '#1e293b',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                marginBottom: '16px',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '48px' }}>{user.avatar}</span>
                <div>
                    <h3 style={{ margin: 0 }}>{user.name}</h3>
                    <p style={{ margin: '4px 0', color: isDark ? '#94a3b8' : '#64748b' }}>
                        {user.role}
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: isDark ? '#94a3b8' : '#64748b' }}>
                        {user.email}
                    </p>
                </div>
            </div>
        </div>
    );
}

function ActivityFeed({ activitiesPromise }: { activitiesPromise: Promise<Activity[]> }) {
    const activities = use(activitiesPromise);
    const theme = use(ThemeContext);
    const isDark = theme === 'dark';

    return (
        <div
            style={{
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                color: isDark ? '#f1f5f9' : '#1e293b',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            }}
        >
            <h3 style={{ marginTop: 0 }}>📋 Recent Activity</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {activities.map(activity => (
                    <li
                        key={activity.id}
                        style={{
                            padding: '12px 0',
                            borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <span>{activity.action}</span>
                        <span
                            style={{
                                fontSize: '12px',
                                color: isDark ? '#64748b' : '#94a3b8',
                                whiteSpace: 'nowrap',
                                marginLeft: '12px',
                            }}
                        >
                            {activity.timestamp}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// --- Loading skeletons ---

function UserCardSkeleton() {
    return (
        <div
            style={{
                padding: '24px',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                marginBottom: '16px',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#e2e8f0',
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                />
                <div>
                    <div
                        style={{
                            width: '150px',
                            height: '20px',
                            backgroundColor: '#e2e8f0',
                            borderRadius: '4px',
                            marginBottom: '8px',
                        }}
                    />
                    <div
                        style={{
                            width: '100px',
                            height: '14px',
                            backgroundColor: '#e2e8f0',
                            borderRadius: '4px',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

function ActivitySkeleton() {
    return (
        <div
            style={{
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
            }}
        >
            <div style={{ width: '150px', height: '20px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '16px' }} />
            {[1, 2, 3].map(i => (
                <div
                    key={i}
                    style={{
                        width: '100%',
                        height: '14px',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '4px',
                        marginBottom: '12px',
                    }}
                />
            ))}
        </div>
    );
}

// --- Main Dashboard ---

export default function UseHookDemo() {
    const [theme, setTheme] = useState<Theme>('light');
    const [userId, setUserId] = useState(1);

    // Create promises — cached to prevent re-creation on re-render
    const userPromise = getCachedPromise(`user-${userId}`, () => fetchUser(userId));
    const activitiesPromise = getCachedPromise(`activities-${userId}`, () =>
        fetchActivities(userId)
    );

    const isDark = theme === 'dark';

    function refreshData() {
        // Clear cache and force new fetches
        promiseCache.delete(`user-${userId}`);
        promiseCache.delete(`activities-${userId}`);
        setUserId(prev => prev); // Force re-render
    }

    return (
        <ThemeContext value={theme}>
            <div
                style={{
                    maxWidth: '600px',
                    margin: '40px auto',
                    fontFamily: 'system-ui',
                    padding: '24px',
                    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                    borderRadius: '16px',
                    minHeight: '400px',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, color: isDark ? '#f1f5f9' : '#1e293b' }}>
                        🔮 use() Hook Demo
                    </h2>
                    <button
                        onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
                        style={{
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            backgroundColor: isDark ? '#334155' : '#e2e8f0',
                            color: isDark ? '#f1f5f9' : '#1e293b',
                        }}
                    >
                        {isDark ? '☀️ Light' : '🌙 Dark'}
                    </button>
                </div>

                <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '14px', marginBottom: '24px' }}>
                    Data loads with <code>use()</code> + <code>Suspense</code> — no useEffect or useState needed.
                    Notice the independent loading skeletons.
                </p>

                {/* Each Suspense boundary loads independently */}
                <Suspense fallback={<UserCardSkeleton />}>
                    <UserCard userPromise={userPromise} />
                </Suspense>

                <Suspense fallback={<ActivitySkeleton />}>
                    <ActivityFeed activitiesPromise={activitiesPromise} />
                </Suspense>
            </div>
        </ThemeContext>
    );
}
