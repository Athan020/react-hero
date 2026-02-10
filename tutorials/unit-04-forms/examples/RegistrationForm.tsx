// Unit 4 Example: Controlled Form with Validation
// This is a complete, runnable example demonstrating form handling in React

import { useState, ChangeEvent, FormEvent } from 'react';

interface FormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export function RegistrationForm() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Validation function
    const validate = (data: FormData): FormErrors => {
        const errors: FormErrors = {};

        if (!data.name.trim()) {
            errors.name = 'Name is required';
        } else if (data.name.length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(data.email)) {
            errors.email = 'Please enter a valid email';
        }

        if (!data.password) {
            errors.password = 'Password is required';
        } else if (data.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(data.password)) {
            errors.password = 'Password must contain an uppercase letter';
        } else if (!/[0-9]/.test(data.password)) {
            errors.password = 'Password must contain a number';
        }

        if (data.password !== data.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        return errors;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newData = { ...formData, [name]: value };
        setFormData(newData);

        // Only validate touched fields
        if (touched[name]) {
            setErrors(validate(newData));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(validate(formData));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        const allTouched = Object.keys(formData).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {}
        );
        setTouched(allTouched);

        const validationErrors = validate(formData);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setIsSubmitting(true);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('Form submitted:', formData);
            setSubmitSuccess(true);
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="success-message">
                <h2>Registration Successful!</h2>
                <p>Welcome, {formData.name}!</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="registration-form">
            <h2>Create Account</h2>

            <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={errors.name && touched.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    disabled={isSubmitting}
                />
                {errors.name && touched.name && (
                    <span id="name-error" className="error" role="alert">
                        {errors.name}
                    </span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={errors.email && touched.email ? 'true' : 'false'}
                    disabled={isSubmitting}
                />
                {errors.email && touched.email && (
                    <span className="error" role="alert">{errors.email}</span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={errors.password && touched.password ? 'true' : 'false'}
                    disabled={isSubmitting}
                />
                {errors.password && touched.password && (
                    <span className="error" role="alert">{errors.password}</span>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={errors.confirmPassword && touched.confirmPassword ? 'true' : 'false'}
                    disabled={isSubmitting}
                />
                {errors.confirmPassword && touched.confirmPassword && (
                    <span className="error" role="alert">{errors.confirmPassword}</span>
                )}
            </div>

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Register'}
            </button>
        </form>
    );
}

export default RegistrationForm;
