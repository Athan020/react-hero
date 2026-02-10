// FormWithActions.tsx
// Demonstrates React 19 Actions: useActionState + useFormStatus
// Compare this with the traditional useState + onSubmit approach in Unit 4

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

// --- Types ---

interface FormState {
    message: string;
    success: boolean;
    errors?: Record<string, string>;
}

// --- Server simulation ---

async function simulateSubmit(data: {
    name: string;
    email: string;
    message: string;
}): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate random failure (20% chance)
    if (Math.random() < 0.2) {
        throw new Error('Server error — please try again');
    }

    console.log('Form submitted:', data);
}

// --- Action function ---

async function submitFeedback(
    _previousState: FormState | null,
    formData: FormData
): Promise<FormState> {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    // Validate
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = 'Name is required';
    if (!email.includes('@')) errors.email = 'Valid email is required';
    if (message.length < 10) errors.message = 'Message must be at least 10 characters';

    if (Object.keys(errors).length > 0) {
        return {
            message: 'Please fix the errors below',
            success: false,
            errors,
        };
    }

    // Submit
    try {
        await simulateSubmit({ name, email, message });
        return {
            message: `Thanks, ${name}! Your feedback has been sent.`,
            success: true,
        };
    } catch (error) {
        return {
            message: error instanceof Error ? error.message : 'Something went wrong',
            success: false,
        };
    }
}

// --- Reusable Submit Button (uses useFormStatus) ---

function SubmitButton({ label = 'Submit' }: { label?: string }) {
    // useFormStatus automatically knows the parent form's status
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: pending ? '#94a3b8' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: pending ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
            }}
        >
            {pending ? '⏳ Sending...' : label}
        </button>
    );
}

// --- Form Field with Error ---

function FormField({
    name,
    label,
    type = 'text',
    error,
    multiline = false,
}: {
    name: string;
    label: string;
    type?: string;
    error?: string;
    multiline?: boolean;
}) {
    const inputStyles: React.CSSProperties = {
        width: '100%',
        padding: '10px 14px',
        fontSize: '14px',
        border: `2px solid ${error ? '#ef4444' : '#e2e8f0'}`,
        borderRadius: '6px',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
    };

    return (
        <div style={{ marginBottom: '16px' }}>
            <label
                htmlFor={name}
                style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}
            >
                {label}
            </label>
            {multiline ? (
                <textarea
                    id={name}
                    name={name}
                    rows={4}
                    style={inputStyles}
                />
            ) : (
                <input
                    id={name}
                    name={name}
                    type={type}
                    style={inputStyles}
                />
            )}
            {error && (
                <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '4px' }}>
                    {error}
                </p>
            )}
        </div>
    );
}

// --- Main Form Component ---

export default function FormWithActions() {
    const [state, formAction, isPending] = useActionState(submitFeedback, null);

    return (
        <div style={{ maxWidth: '500px', margin: '40px auto', fontFamily: 'system-ui' }}>
            <h2>📬 Send Feedback</h2>
            <p style={{ color: '#64748b' }}>
                This form uses React 19 Actions — no manual state management needed.
            </p>

            {/* Success message */}
            {state?.success && (
                <div style={{
                    padding: '16px',
                    backgroundColor: '#dcfce7',
                    border: '1px solid #86efac',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    color: '#166534',
                }}>
                    ✅ {state.message}
                </div>
            )}

            {/* Error banner */}
            {state && !state.success && (
                <div style={{
                    padding: '16px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    color: '#991b1b',
                }}>
                    ⚠️ {state.message}
                </div>
            )}

            {/* The form uses action={formAction} instead of onSubmit */}
            <form action={formAction}>
                <FormField
                    name="name"
                    label="Your Name"
                    error={state?.errors?.name}
                />
                <FormField
                    name="email"
                    label="Email Address"
                    type="email"
                    error={state?.errors?.email}
                />
                <FormField
                    name="message"
                    label="Your Message"
                    multiline
                    error={state?.errors?.message}
                />

                {/* SubmitButton uses useFormStatus internally */}
                <SubmitButton label="Send Feedback" />
            </form>

            {/* Status indicator */}
            {isPending && (
                <p style={{ color: '#64748b', marginTop: '12px', fontStyle: 'italic' }}>
                    Processing your feedback...
                </p>
            )}
        </div>
    );
}
