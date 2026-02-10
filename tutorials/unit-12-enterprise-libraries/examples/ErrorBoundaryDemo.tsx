// ErrorBoundaryDemo.tsx
// Demonstrates react-error-boundary with granular boundaries,
// error logging, reset strategies, and fallback UIs

import { useState } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

// ============================================
// Fallback Components
// ============================================

/** Full-page error fallback */
function PageErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
    return (
        <div
            role="alert"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px',
                padding: '40px',
                backgroundColor: '#fef2f2',
                border: '2px solid #fecaca',
                borderRadius: '16px',
                textAlign: 'center',
                fontFamily: 'system-ui',
            }}
        >
            <span style={{ fontSize: '64px', marginBottom: '16px' }}>💥</span>
            <h2 style={{ color: '#991b1b', margin: '0 0 8px' }}>Something went wrong</h2>
            <p style={{ color: '#7f1d1d', maxWidth: '400px', lineHeight: 1.6 }}>
                An unexpected error occurred. You can try again or contact support if the problem persists.
            </p>
            <pre
                style={{
                    padding: '12px 20px',
                    backgroundColor: '#fee2e2',
                    borderRadius: '8px',
                    color: '#991b1b',
                    fontSize: '13px',
                    maxWidth: '100%',
                    overflow: 'auto',
                    margin: '16px 0',
                }}
            >
                {error.message}
            </pre>
            <button
                onClick={resetErrorBoundary}
                style={{
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 600,
                }}
            >
                🔄 Try Again
            </button>
        </div>
    );
}

/** Compact widget error fallback */
function WidgetErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
    return (
        <div
            role="alert"
            style={{
                padding: '20px',
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '12px',
                textAlign: 'center',
            }}
        >
            <p style={{ margin: '0 0 8px', color: '#9a3412' }}>
                ⚠️ Widget failed to load
            </p>
            <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#c2410c' }}>
                {error.message}
            </p>
            <button
                onClick={resetErrorBoundary}
                style={{
                    padding: '6px 16px',
                    backgroundColor: '#f97316',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                }}
            >
                Retry
            </button>
        </div>
    );
}

// ============================================
// Simulated Widgets (some will crash!)
// ============================================

function RevenueChart() {
    // Simulate a component that might crash
    const [loaded, setLoaded] = useState(false);

    if (!loaded) {
        return (
            <div style={widgetStyles}>
                <h3 style={{ margin: '0 0 12px' }}>📈 Revenue</h3>
                <button
                    onClick={() => setLoaded(true)}
                    style={loadButtonStyles}
                >
                    Load Chart Data
                </button>
            </div>
        );
    }

    // 50% chance of error on load
    if (Math.random() > 0.5) {
        throw new Error('Failed to fetch revenue data from analytics API');
    }

    return (
        <div style={widgetStyles}>
            <h3 style={{ margin: '0 0 12px' }}>📈 Revenue</h3>
            <p style={{ fontSize: '32px', fontWeight: 700, color: '#059669', margin: 0 }}>
                R 124,500
            </p>
            <p style={{ color: '#64748b', fontSize: '13px' }}>↑ 12% from last month</p>
        </div>
    );
}

function UserStats() {
    return (
        <div style={widgetStyles}>
            <h3 style={{ margin: '0 0 12px' }}>👥 Users</h3>
            <div style={{ display: 'flex', gap: '24px' }}>
                <div>
                    <p style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>2,847</p>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Active</p>
                </div>
                <div>
                    <p style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>142</p>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>New today</p>
                </div>
            </div>
        </div>
    );
}

function RecentOrders() {
    const [shouldCrash, setShouldCrash] = useState(false);

    if (shouldCrash) {
        throw new Error('Database connection timeout: orders service unavailable');
    }

    return (
        <div style={widgetStyles}>
            <h3 style={{ margin: '0 0 12px' }}>🛒 Recent Orders</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['Order #1234 — R 299', 'Order #1235 — R 599', 'Order #1236 — R 149'].map(
                    (order, i) => (
                        <li
                            key={i}
                            style={{
                                padding: '8px 0',
                                borderBottom: '1px solid #f1f5f9',
                                fontSize: '14px',
                            }}
                        >
                            {order}
                        </li>
                    )
                )}
            </ul>
            <button
                onClick={() => setShouldCrash(true)}
                style={{
                    marginTop: '12px',
                    padding: '6px 12px',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                }}
            >
                💣 Simulate crash
            </button>
        </div>
    );
}

// ============================================
// Error Logging
// ============================================

function logError(error: Error, info: { componentStack?: string | null }) {
    // In production, send to Sentry, DataDog, etc.
    console.group('🔴 Error Boundary Caught:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    if (info.componentStack) {
        console.error('Component Stack:', info.componentStack);
    }
    console.groupEnd();

    // Example: Sentry integration
    // Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
}

// ============================================
// Main Dashboard
// ============================================

export default function ErrorBoundaryDemo() {
    const [resetKey, setResetKey] = useState(0);

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'system-ui' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: '0 0 4px' }}>🛡️ Error Boundary Demo</h2>
                    <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
                        Each widget has its own error boundary — one crash doesn't take down the whole page.
                    </p>
                </div>
                <button
                    onClick={() => setResetKey(k => k + 1)}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#e2e8f0',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                    }}
                >
                    🔄 Reset All
                </button>
            </div>

            {/* Outer boundary — catches anything the inner ones miss */}
            <ErrorBoundary
                FallbackComponent={PageErrorFallback}
                onError={logError}
                resetKeys={[resetKey]}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Each widget has its own boundary */}
                    <ErrorBoundary
                        FallbackComponent={WidgetErrorFallback}
                        onError={logError}
                        resetKeys={[resetKey]}
                    >
                        <RevenueChart />
                    </ErrorBoundary>

                    <ErrorBoundary
                        FallbackComponent={WidgetErrorFallback}
                        onError={logError}
                        resetKeys={[resetKey]}
                    >
                        <UserStats />
                    </ErrorBoundary>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <ErrorBoundary
                            FallbackComponent={WidgetErrorFallback}
                            onError={logError}
                            resetKeys={[resetKey]}
                        >
                            <RecentOrders />
                        </ErrorBoundary>
                    </div>
                </div>
            </ErrorBoundary>
        </div>
    );
}

// ============================================
// Shared Styles
// ============================================

const widgetStyles: React.CSSProperties = {
    padding: '24px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
};

const loadButtonStyles: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
};
