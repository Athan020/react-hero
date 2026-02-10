// zodPatterns.ts
// Advanced Zod patterns for enterprise applications
// Demonstrates: API validation, discriminated unions, composition, transforms, env validation

import { z } from 'zod';

// ============================================
// 1. API Response Validation
// ============================================

// Base schemas — reusable building blocks
const TimestampsSchema = z.object({
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

const PaginationSchema = z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().min(1).max(100),
    totalItems: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
});

// User schema with full validation
export const UserSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    email: z.string().email(),
    role: z.enum(['admin', 'editor', 'viewer']),
    avatar: z.string().url().nullable(),
    bio: z.string().max(500).optional(),
    preferences: z.object({
        theme: z.enum(['light', 'dark', 'system']).default('system'),
        language: z.string().length(2).default('en'),
        notifications: z.boolean().default(true),
    }),
}).merge(TimestampsSchema);

// Infer types — single source of truth!
export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserSchema.shape.role>;

// Paginated API response wrapper
export function paginatedResponse<T extends z.ZodTypeAny>(itemSchema: T) {
    return z.object({
        data: z.array(itemSchema),
        pagination: PaginationSchema,
    });
}

// Usage: const PaginatedUsersSchema = paginatedResponse(UserSchema);

// ============================================
// 2. Discriminated Unions — Domain Modeling
// ============================================

const PaymentMethodSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('credit_card'),
        cardNumber: z.string().regex(/^\d{16}$/),
        expiryMonth: z.number().int().min(1).max(12),
        expiryYear: z.number().int().min(2025),
        cvv: z.string().length(3),
    }),
    z.object({
        type: z.literal('bank_transfer'),
        accountNumber: z.string().min(8).max(20),
        routingNumber: z.string().length(9),
        accountName: z.string().min(1),
    }),
    z.object({
        type: z.literal('paypal'),
        email: z.string().email(),
    }),
]);

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

// ============================================
// 3. Schema Composition — Pick, Omit, Extend, Partial
// ============================================

// Create form schemas from the main entity schema
export const CreateUserSchema = UserSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const UpdateUserSchema = UserSchema.pick({
    name: true,
    bio: true,
    avatar: true,
    preferences: true,
}).partial(); // All fields optional for PATCH requests

export const UserProfileSchema = UserSchema.pick({
    name: true,
    email: true,
    avatar: true,
    bio: true,
});

export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// ============================================
// 4. Transforms — Change Output Types
// ============================================

// Transform ISO string to Date object
export const DateFromString = z
    .string()
    .datetime()
    .transform((s) => new Date(s));

// Parse price from string to cents (integer)
export const PriceInCents = z
    .string()
    .regex(/^\d+\.\d{2}$/, 'Price must be in format "10.99"')
    .transform((s) => Math.round(parseFloat(s) * 100));

// Slug from title
export const SlugFromTitle = z
    .string()
    .min(1)
    .transform((title) =>
        title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
    );

// ============================================
// 5. Custom Refinements
// ============================================

// Password with strength requirements
export const PasswordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((pw) => /[A-Z]/.test(pw), 'Must contain an uppercase letter')
    .refine((pw) => /[a-z]/.test(pw), 'Must contain a lowercase letter')
    .refine((pw) => /\d/.test(pw), 'Must contain a number')
    .refine((pw) => /[!@#$%^&*]/.test(pw), 'Must contain a special character');

// Registration form with cross-field validation
export const RegistrationSchema = z
    .object({
        email: z.string().email(),
        password: PasswordSchema,
        confirmPassword: z.string(),
        acceptTerms: z.literal(true, {
            errorMap: () => ({ message: 'You must accept the terms' }),
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'], // Attach error to confirmPassword field
    });

// ============================================
// 6. Environment Variable Validation
// ============================================

export const EnvSchema = z.object({
    VITE_API_URL: z.string().url('API URL must be a valid URL'),
    VITE_API_KEY: z.string().min(1, 'API key is required'),
    VITE_ENABLE_ANALYTICS: z.coerce.boolean().default(false),
    VITE_MAX_UPLOAD_MB: z.coerce.number().default(10),
    VITE_ENVIRONMENT: z
        .enum(['development', 'staging', 'production'])
        .default('development'),
    VITE_SENTRY_DSN: z.string().url().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

// ============================================
// 7. Utility: Type-safe fetch with validation
// ============================================

export async function fetchWithSchema<T extends z.ZodTypeAny>(
    url: string,
    schema: T,
    options?: RequestInit
): Promise<z.infer<T>> {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const result = schema.safeParse(data);

    if (!result.success) {
        console.error('API response validation failed:', result.error.flatten());
        throw new Error('API returned unexpected data format');
    }

    return result.data;
}

// Usage:
// const user = await fetchWithSchema('/api/users/1', UserSchema);
// const users = await fetchWithSchema('/api/users', paginatedResponse(UserSchema));
