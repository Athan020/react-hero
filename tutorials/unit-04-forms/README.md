# Unit 4: Forms and User Input

**Time**: 2-3 hours | **Level**: Intermediate

## 🎯 Learning Objectives

By the end of this unit, you will:
- Understand controlled vs uncontrolled components
- Handle form submissions with proper event handling
- Implement client-side validation patterns
- Use React Hook Form for complex forms
- Integrate validation libraries (Yup, Zod)
- Handle different input types (text, select, checkbox, file)
- Create accessible forms with ARIA attributes
- Build multi-step wizard forms

## 📚 Table of Contents

1. [Understanding Forms in React](#understanding-forms-in-react)
2. [Controlled Components](#controlled-components)
3. [Uncontrolled Components](#uncontrolled-components)
4. [Form Validation](#form-validation)
5. [React Hook Form](#react-hook-form)
6. [Schema Validation with Zod](#schema-validation-with-zod)
7. [Different Input Types](#different-input-types)
8. [File Uploads](#file-uploads)
9. [Multi-Step Forms](#multi-step-forms)
10. [Accessibility](#accessibility)
11. [Exercises](#exercises)
12. [Common Pitfalls](#common-pitfalls)
13. [Further Reading](#further-reading)

---

## Understanding Forms in React

### How Forms Differ from HTML

In traditional HTML, forms maintain their own state. In React, we typically want React to be the "single source of truth" for form data.

**Backend Analogy (ASP.NET MVC)**:
- HTML forms = Model binding happens on server
- React forms = Model binding happens on client with state

```typescript
// Traditional HTML - form manages its own state
<form action="/submit" method="POST">
  <input name="email" type="email" />
  <button type="submit">Submit</button>
</form>

// React - we manage state explicitly
function MyForm() {
  const [email, setEmail] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();  // Prevent page reload
    console.log('Email:', email);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## Controlled Components

### What is a Controlled Component?

A **controlled component** is a form element whose value is controlled by React state.

**Backend Analogy**: Like two-way data binding in WPF/Blazor:
```csharp
// Blazor two-way binding
<InputText @bind-Value="model.Email" />

// WPF two-way binding
<TextBox Text="{Binding Email, Mode=TwoWay}" />
```

### Basic Controlled Input

```typescript
import { useState, ChangeEvent, FormEvent } from 'react';

function ControlledInput() {
  const [value, setValue] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        value={value}           // Controlled by state
        onChange={handleChange}  // Updates state on change
        placeholder="Type something..."
      />
      <p>You typed: {value}</p>
      <p>Character count: {value.length}</p>
    </div>
  );
}
```

### Controlled Form with Multiple Fields

```typescript
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });

  // Generic change handler for all text inputs
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value  // Computed property name
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Send to API...
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          value={formData.firstName}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          value={formData.lastName}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
        />
      </div>
      
      <button type="submit">Send Message</button>
    </form>
  );
}
```

### Benefits of Controlled Components

| Benefit | Description |
|---------|-------------|
| **Single Source of Truth** | React state is the authoritative source |
| **Instant Validation** | Validate on every keystroke |
| **Conditional Rendering** | Show/hide fields based on values |
| **Format Input** | Transform values as user types |
| **Full Control** | Programmatically set, reset, modify values |

---

## Uncontrolled Components

### What is an Uncontrolled Component?

An **uncontrolled component** lets the DOM handle the form state. You access values via refs.

**When to Use**:
- Integrating with non-React code
- File inputs (always uncontrolled)
- Simple forms where you only need values on submit
- Performance-critical forms with many fields

### Using useRef for Uncontrolled Inputs

```typescript
import { useRef, FormEvent } from 'react';

function UncontrolledForm() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Access values via refs
    const name = nameRef.current?.value;
    const email = emailRef.current?.value;
    
    console.log('Name:', name);
    console.log('Email:', email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          ref={nameRef}
          defaultValue=""  // Use defaultValue, not value
        />
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          ref={emailRef}
        />
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Controlled vs Uncontrolled Comparison

| Feature | Controlled | Uncontrolled |
|---------|------------|--------------|
| **State Location** | React state | DOM |
| **Value Access** | Via state variable | Via ref |
| **Validation** | On every change | On submit |
| **Re-renders** | On every keystroke | Minimal |
| **Setup** | More code | Less code |
| **Flexibility** | High | Limited |
| **Recommendation** | ✅ Preferred | Use sparingly |

---

## Form Validation

### Manual Validation Pattern

```typescript
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

function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation function
  const validate = (data: FormData): FormErrors => {
    const errors: FormErrors = {};

    // Name validation
    if (!data.name.trim()) {
      errors.name = 'Name is required';
    } else if (data.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(data.email)) {
      errors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(data.password)) {
      errors.password = 'Password must contain an uppercase letter';
    } else if (!/[0-9]/.test(data.password)) {
      errors.password = 'Password must contain a number';
    }

    // Confirm password
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  // Validate on change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    
    // Only show errors for touched fields
    if (touched[name]) {
      setErrors(validate(newData));
    }
  };

  // Mark field as touched on blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(validate(formData));
  };

  const handleSubmit = (e: FormEvent) => {
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
      console.log('Form is valid! Submitting:', formData);
      // Submit to API
    }
  };

  const isValid = Object.keys(errors).length === 0;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.name && touched.name ? 'error' : ''}
          aria-invalid={errors.name && touched.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && touched.name && (
          <span id="name-error" className="error-message" role="alert">
            {errors.name}
          </span>
        )}
      </div>

      {/* Similar pattern for other fields... */}

      <button type="submit" disabled={!isValid}>
        Register
      </button>
    </form>
  );
}
```

**Backend Analogy**: This pattern is similar to:
- **ASP.NET MVC**: ModelState validation with DataAnnotations
- **FluentValidation**: Custom validation rules

```csharp
// C# DataAnnotations equivalent
public class RegistrationModel
{
    [Required(ErrorMessage = "Name is required")]
    [MinLength(2, ErrorMessage = "Name must be at least 2 characters")]
    public string Name { get; set; }

    [Required]
    [EmailAddress(ErrorMessage = "Please enter a valid email")]
    public string Email { get; set; }

    [Required]
    [MinLength(8)]
    [RegularExpression(@"^(?=.*[A-Z])(?=.*\d).+$")]
    public string Password { get; set; }
}
```

---

## React Hook Form

React Hook Form is a performant form library that reduces re-renders and simplifies validation.

### Installation

```bash
npm install react-hook-form
```

### Basic Usage

```typescript
import { useForm, SubmitHandler } from 'react-hook-form';

interface FormInputs {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
}

function BasicForm() {
  const {
    register,      // Register inputs with the form
    handleSubmit,  // Wrapper for submit handler
    formState: { errors, isSubmitting, isValid }
  } = useForm<FormInputs>({
    mode: 'onBlur',  // Validate on blur
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      age: 18
    }
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Submitted:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          {...register('firstName', {
            required: 'First name is required',
            minLength: {
              value: 2,
              message: 'Must be at least 2 characters'
            }
          })}
        />
        {errors.firstName && (
          <span className="error">{errors.firstName.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          {...register('lastName', {
            required: 'Last name is required'
          })}
        />
        {errors.lastName && (
          <span className="error">{errors.lastName.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email format'
            }
          })}
        />
        {errors.email && (
          <span className="error">{errors.email.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="age">Age</label>
        <input
          id="age"
          type="number"
          {...register('age', {
            required: 'Age is required',
            min: {
              value: 18,
              message: 'Must be at least 18'
            },
            max: {
              value: 120,
              message: 'Must be at most 120'
            }
          })}
        />
        {errors.age && (
          <span className="error">{errors.age.message}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Useful React Hook Form Features

```typescript
import { useForm, useWatch, useFieldArray } from 'react-hook-form';

function AdvancedForm() {
  const {
    register,
    handleSubmit,
    watch,          // Watch specific fields
    reset,          // Reset form to defaults
    setValue,       // Programmatically set values
    getValues,      // Get current values
    trigger,        // Manually trigger validation
    control,        // For controlled components
    formState: {
      errors,
      isSubmitting,
      isValid,
      isDirty,      // Has form been modified?
      touchedFields // Which fields have been touched
    }
  } = useForm<FormInputs>();

  // Watch a field's value
  const firstName = watch('firstName');
  
  // Reset form
  const handleReset = () => {
    reset({ firstName: '', lastName: '', email: '', age: 18 });
  };

  // Programmatically set value
  const fillWithDefaults = () => {
    setValue('firstName', 'John');
    setValue('lastName', 'Doe');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... form fields ... */}
      
      <p>Preview: Hello, {firstName || 'Guest'}!</p>
      
      <div className="actions">
        <button type="submit" disabled={!isDirty || isSubmitting}>
          Submit
        </button>
        <button type="button" onClick={handleReset}>
          Reset
        </button>
        <button type="button" onClick={fillWithDefaults}>
          Fill Defaults
        </button>
      </div>
    </form>
  );
}
```

---

## Schema Validation with Zod

Zod provides type-safe schema validation that integrates perfectly with TypeScript.

### Installation

```bash
npm install zod @hookform/resolvers
```

### Using Zod with React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema
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
  path: ['confirmPassword']  // Where to show the error
});

// Infer TypeScript type from schema!
type RegistrationData = z.infer<typeof registrationSchema>;

function RegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onBlur'
  });

  const onSubmit = (data: RegistrationData) => {
    console.log('Valid data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Name</label>
        <input {...register('name')} />
        {errors.name && <span>{errors.name.message}</span>}
      </div>

      <div>
        <label>Email</label>
        <input type="email" {...register('email')} />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <label>Password</label>
        <input type="password" {...register('password')} />
        {errors.password && <span>{errors.password.message}</span>}
      </div>

      <div>
        <label>Confirm Password</label>
        <input type="password" {...register('confirmPassword')} />
        {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
      </div>

      <div>
        <label>Age</label>
        <input 
          type="number" 
          {...register('age', { valueAsNumber: true })} 
        />
        {errors.age && <span>{errors.age.message}</span>}
      </div>

      <div>
        <label>
          <input type="checkbox" {...register('terms')} />
          I accept the terms and conditions
        </label>
        {errors.terms && <span>{errors.terms.message}</span>}
      </div>

      <button type="submit">Register</button>
    </form>
  );
}
```

**Backend Analogy**: Zod is like FluentValidation in .NET:

```csharp
// FluentValidation equivalent
public class RegistrationValidator : AbstractValidator<RegistrationData>
{
    public RegistrationValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MinimumLength(2)
            .MaximumLength(50);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Must contain uppercase")
            .Matches("[0-9]").WithMessage("Must contain number");

        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.Password).WithMessage("Passwords must match");
    }
}
```

---

## Different Input Types

### Handling Various Input Types

```typescript
interface FormData {
  text: string;
  email: string;
  password: string;
  number: number;
  date: string;
  time: string;
  datetime: string;
  checkbox: boolean;
  radio: string;
  select: string;
  multiSelect: string[];
  textarea: string;
  range: number;
  color: string;
}

function InputShowcase() {
  const { register, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      radio: 'option1',
      select: '',
      multiSelect: [],
      range: 50,
      color: '#3b82f6'
    }
  });

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      {/* Text Input */}
      <div>
        <label>Text Input</label>
        <input type="text" {...register('text')} />
      </div>

      {/* Email Input */}
      <div>
        <label>Email</label>
        <input type="email" {...register('email')} />
      </div>

      {/* Password Input */}
      <div>
        <label>Password</label>
        <input type="password" {...register('password')} />
      </div>

      {/* Number Input */}
      <div>
        <label>Number</label>
        <input 
          type="number" 
          {...register('number', { valueAsNumber: true })} 
        />
      </div>

      {/* Date Input */}
      <div>
        <label>Date</label>
        <input type="date" {...register('date')} />
      </div>

      {/* Time Input */}
      <div>
        <label>Time</label>
        <input type="time" {...register('time')} />
      </div>

      {/* Datetime-local Input */}
      <div>
        <label>Date & Time</label>
        <input type="datetime-local" {...register('datetime')} />
      </div>

      {/* Checkbox */}
      <div>
        <label>
          <input type="checkbox" {...register('checkbox')} />
          I agree to terms
        </label>
      </div>

      {/* Radio Buttons */}
      <div>
        <label>Choose an option:</label>
        <label>
          <input type="radio" value="option1" {...register('radio')} />
          Option 1
        </label>
        <label>
          <input type="radio" value="option2" {...register('radio')} />
          Option 2
        </label>
        <label>
          <input type="radio" value="option3" {...register('radio')} />
          Option 3
        </label>
      </div>

      {/* Select Dropdown */}
      <div>
        <label>Select</label>
        <select {...register('select')}>
          <option value="">Choose...</option>
          <option value="react">React</option>
          <option value="vue">Vue</option>
          <option value="angular">Angular</option>
        </select>
      </div>

      {/* Multi-Select */}
      <div>
        <label>Multi-Select (hold Ctrl/Cmd)</label>
        <select multiple {...register('multiSelect')}>
          <option value="js">JavaScript</option>
          <option value="ts">TypeScript</option>
          <option value="py">Python</option>
          <option value="cs">C#</option>
        </select>
      </div>

      {/* Textarea */}
      <div>
        <label>Message</label>
        <textarea {...register('textarea')} rows={4} />
      </div>

      {/* Range Slider */}
      <div>
        <label>Range: {watch('range')}</label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          {...register('range', { valueAsNumber: true })} 
        />
      </div>

      {/* Color Picker */}
      <div>
        <label>Color</label>
        <input type="color" {...register('color')} />
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## File Uploads

### Basic File Upload

```typescript
import { useState, ChangeEvent } from 'react';

interface FileData {
  file: File | null;
  preview: string | null;
}

function FileUpload() {
  const [fileData, setFileData] = useState<FileData>({
    file: null,
    preview: null
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) {
      setFileData({ file: null, preview: null });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be less than 5MB');
      return;
    }

    // Create preview URL
    const preview = URL.createObjectURL(file);
    setFileData({ file, preview });
  };

  const handleUpload = async () => {
    if (!fileData.file) return;

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', fileData.file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      console.log('Uploaded:', result);
      
      // Reset
      setFileData({ file: null, preview: null });
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (fileData.preview) {
        URL.revokeObjectURL(fileData.preview);
      }
    };
  }, [fileData.preview]);

  return (
    <div className="file-upload">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        id="file-input"
      />
      <label htmlFor="file-input" className="file-label">
        {fileData.file ? fileData.file.name : 'Choose a file...'}
      </label>

      {error && <p className="error">{error}</p>}

      {fileData.preview && (
        <div className="preview">
          <img src={fileData.preview} alt="Preview" />
          <p>{fileData.file?.name}</p>
          <p>{(fileData.file?.size || 0 / 1024).toFixed(1)} KB</p>
        </div>
      )}

      <button 
        onClick={handleUpload} 
        disabled={!fileData.file || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
```

### Drag and Drop Upload

```typescript
import { useState, DragEvent } from 'react';

function DragDropUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>Drag and drop files here, or click to select</p>
        <input
          type="file"
          multiple
          onChange={e => {
            const selected = Array.from(e.target.files || []);
            setFiles(prev => [...prev, ...selected]);
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file, index) => (
            <li key={index}>
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
              <button onClick={() => removeFile(index)}>×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## Multi-Step Forms

### Wizard Form Component

```typescript
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Step schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email()
});

const addressSchema = z.object({
  street: z.string().min(5),
  city: z.string().min(2),
  zipCode: z.string().regex(/^\d{5}$/, 'Invalid zip code')
});

const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, 'Invalid card number'),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Format: MM/YY'),
  cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV')
});

// Combined schema
const checkoutSchema = personalInfoSchema
  .merge(addressSchema)
  .merge(paymentSchema);

type CheckoutData = z.infer<typeof checkoutSchema>;

const steps = [
  { title: 'Personal Info', schema: personalInfoSchema },
  { title: 'Address', schema: addressSchema },
  { title: 'Payment', schema: paymentSchema }
];

function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  
  const methods = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange'
  });

  const { trigger, handleSubmit, formState: { errors } } = methods;

  const nextStep = async () => {
    // Validate current step fields
    const fieldsToValidate = Object.keys(
      steps[currentStep].schema.shape
    ) as (keyof CheckoutData)[];
    
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const onSubmit = (data: CheckoutData) => {
    console.log('Complete form data:', data);
    // Submit to API
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Progress indicator */}
        <div className="steps">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step ${index === currentStep ? 'active' : ''} 
                         ${index < currentStep ? 'completed' : ''}`}
            >
              <span className="step-number">{index + 1}</span>
              <span className="step-title">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="step-content">
          {currentStep === 0 && <PersonalInfoStep />}
          {currentStep === 1 && <AddressStep />}
          {currentStep === 2 && <PaymentStep />}
        </div>

        {/* Navigation */}
        <div className="navigation">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </button>

          {currentStep < steps.length - 1 ? (
            <button type="button" onClick={nextStep}>
              Next
            </button>
          ) : (
            <button type="submit">
              Complete Order
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

// Step components
function PersonalInfoStep() {
  const { register, formState: { errors } } = useFormContext<CheckoutData>();

  return (
    <div>
      <h2>Personal Information</h2>
      <div>
        <label>First Name</label>
        <input {...register('firstName')} />
        {errors.firstName && <span>{errors.firstName.message}</span>}
      </div>
      <div>
        <label>Last Name</label>
        <input {...register('lastName')} />
        {errors.lastName && <span>{errors.lastName.message}</span>}
      </div>
      <div>
        <label>Email</label>
        <input type="email" {...register('email')} />
        {errors.email && <span>{errors.email.message}</span>}
      </div>
    </div>
  );
}

// AddressStep and PaymentStep follow similar pattern...
```

---

## Accessibility

### Accessible Form Patterns

```typescript
function AccessibleForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate  // Disable browser validation
      aria-label="Contact form"
    >
      {/* Error summary at top */}
      {Object.keys(errors).length > 0 && (
        <div 
          role="alert" 
          aria-live="polite"
          className="error-summary"
        >
          <h2>Please fix the following errors:</h2>
          <ul>
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>
                <a href={`#${field}`}>{message}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Accessible input with all ARIA attributes */}
      <div className="form-group">
        <label htmlFor="email">
          Email <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={
            errors.email 
              ? 'email-error email-hint' 
              : 'email-hint'
          }
        />
        <span id="email-hint" className="hint">
          We'll never share your email
        </span>
        {errors.email && (
          <span 
            id="email-error" 
            className="error" 
            role="alert"
          >
            {errors.email}
          </span>
        )}
      </div>

      {/* Submit button with loading state */}
      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="sr-only">Submitting form</span>
            <span aria-hidden="true">Submitting...</span>
          </>
        ) : (
          'Submit'
        )}
      </button>

      {/* Success message */}
      {submitted && (
        <div role="status" aria-live="polite">
          Form submitted successfully!
        </div>
      )}
    </form>
  );
}
```

### Accessibility Checklist

| Requirement | Implementation |
|-------------|----------------|
| **Labels** | Every input has a `<label>` with `htmlFor` |
| **Error Messages** | Use `role="alert"` for dynamic errors |
| **Required Fields** | Use `aria-required="true"` |
| **Invalid State** | Use `aria-invalid="true"` when invalid |
| **Descriptions** | Use `aria-describedby` for hints/errors |
| **Focus Management** | Focus first error field on submit |
| **Keyboard Navigation** | All inputs accessible via Tab |
| **Screen Reader** | Use `.sr-only` for screen reader-only text |

---

## Exercises

### Exercise 1: Login Form

**Task**: Create a login form with email and password.

**Requirements**:
- Email validation (required, valid format)
- Password validation (required, min 8 chars)
- Show/hide password toggle
- "Remember me" checkbox
- Loading state on submit
- Error display for invalid credentials

---

### Exercise 2: Profile Edit Form

**Task**: Create a profile edit form with pre-filled data.

**Requirements**:
- Load existing user data into form
- Fields: name, email, bio, avatar upload
- Detect if form has unsaved changes
- Confirm before leaving with unsaved changes
- Save and Cancel buttons

---

### Exercise 3: Dynamic Form Fields

**Task**: Create a form where users can add/remove phone numbers.

**Requirements**:
- Start with one phone number field
- "Add Phone" button to add more fields
- Each field has a "Remove" button
- At least one phone number is required
- Validate phone format

---

### Exercise 4: Multi-Step Checkout

**Task**: Create a 3-step checkout wizard.

**Requirements**:
- Step 1: Shipping address
- Step 2: Payment method
- Step 3: Review and confirm
- Progress indicator
- Validate each step before proceeding
- "Previous" button to go back
- Submit on final step

---

## Solutions

Solutions are available in the `solutions/` directory.

---

## Common Pitfalls

### 1. Not Using `e.preventDefault()`

```typescript
// ❌ Form submits and page reloads
const handleSubmit = () => {
  console.log('Form data');
};

// ✅ Prevent default form behavior
const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  console.log('Form data');
};
```

### 2. Mutating State Directly

```typescript
// ❌ Mutating state
const handleChange = (e) => {
  formData.email = e.target.value;  // Won't trigger re-render!
  setFormData(formData);
};

// ✅ Creating new state object
const handleChange = (e) => {
  setFormData({ ...formData, email: e.target.value });
};
```

### 3. Using `value` Without `onChange`

```typescript
// ❌ Read-only input (React warning)
<input value={email} />

// ✅ Controlled with onChange
<input value={email} onChange={e => setEmail(e.target.value)} />

// ✅ Or use defaultValue for uncontrolled
<input defaultValue={email} />
```

### 4. Number Input Returns String

```typescript
// ❌ age is actually a string!
const [age, setAge] = useState(0);
<input type="number" value={age} onChange={e => setAge(e.target.value)} />

// ✅ Convert to number
<input 
  type="number" 
  value={age} 
  onChange={e => setAge(parseInt(e.target.value) || 0)} 
/>

// ✅ Or with React Hook Form
<input {...register('age', { valueAsNumber: true })} />
```

### 5. Not Handling Empty File Input

```typescript
// ❌ May crash if no file selected
const handleFile = (e) => {
  const file = e.target.files[0];  // Could be undefined!
  setFile(file);
};

// ✅ Safe file handling
const handleFile = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    setFile(file);
  }
};
```

### 6. Memory Leak with File Previews

```typescript
// ❌ Memory leak - never revoked
const preview = URL.createObjectURL(file);

// ✅ Clean up on unmount or new file
useEffect(() => {
  return () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };
}, [previewUrl]);
```

---

## What's New in React 19: Form Actions

React 19 introduces **Actions** — a built-in way to handle form submissions that eliminates much of the manual state management shown above.

### Before (React 18 — what this unit teaches)

```typescript
function ContactForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      await submitToServer(Object.fromEntries(formData));
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsPending(false);
    }
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### After (React 19 — Actions)

```typescript
import { useActionState } from 'react';

async function submitAction(prevState: any, formData: FormData) {
  try {
    await submitToServer(Object.fromEntries(formData));
    return { success: true, message: 'Sent!' };
  } catch {
    return { success: false, message: 'Something went wrong' };
  }
}

function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitAction, null);

  // No manual useState for loading/error — React manages it all!
  return <form action={formAction}>...</form>;
}
```

**Key differences**:
- `action={formAction}` replaces `onSubmit={handleSubmit}`
- No manual `isPending` / `setError` state — `useActionState` handles it
- `useFormStatus()` gives child components access to the form's pending state without prop drilling

> 📖 **Deep Dive**: See [Unit 11: React 19 Features](../unit-11-react19-features/README.md) for full coverage of Actions, `useOptimistic`, and related hooks.

---

## Further Reading

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [MDN: Form Validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation)
- [WCAG Forms Guidelines](https://www.w3.org/WAI/tutorials/forms/)
- [React Forms - Official Docs](https://react.dev/reference/react-dom/components/form)

---

## Next Steps

Continue to [Unit 5: API Integration and Data Fetching](../unit-05-api-integration/README.md)!
