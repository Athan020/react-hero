// Unit 4 Example: React Hook Form with Zod Validation
// Modern form handling with schema validation

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define validation schema with Zod
const registrationSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be at most 50 characters'),

    email: z
        .string()
        .email('Please enter a valid email'),

    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[0-9]/, 'Password must contain a number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),

    confirmPassword: z.string(),

    age: z
        .number({ invalid_type_error: 'Age must be a number' })
        .min(18, 'Must be at least 18')
        .max(120, 'Must be at most 120'),

    terms: z
        .boolean()
        .refine(val => val === true, 'You must accept the terms')

}).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
});

// Infer TypeScript type from schema
type RegistrationData = z.infer<typeof registrationSchema>;

export function ReactHookFormExample() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<RegistrationData>({
        resolver: zodResolver(registrationSchema),
        mode: 'onBlur',
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            age: 18,
            terms: false
        }
    });

    const onSubmit = async (data: RegistrationData) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Form submitted:', data);
        alert('Registration successful!');
        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="registration-form">
            <h2>Register with React Hook Form + Zod</h2>

            <div className="form-group">
                <label htmlFor="name">Name</label>
                <input id="name" {...register('name')} />
                {errors.name && <span className="error">{errors.name.message}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" {...register('email')} />
                {errors.email && <span className="error">{errors.email.message}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" {...register('password')} />
                {errors.password && <span className="error">{errors.password.message}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input id="confirmPassword" type="password" {...register('confirmPassword')} />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
            </div>

            <div className="form-group">
                <label htmlFor="age">Age</label>
                <input id="age" type="number" {...register('age', { valueAsNumber: true })} />
                {errors.age && <span className="error">{errors.age.message}</span>}
            </div>

            <div className="form-group checkbox">
                <label>
                    <input type="checkbox" {...register('terms')} />
                    I accept the terms and conditions
                </label>
                {errors.terms && <span className="error">{errors.terms.message}</span>}
            </div>

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Register'}
            </button>
        </form>
    );
}

export default ReactHookFormExample;
