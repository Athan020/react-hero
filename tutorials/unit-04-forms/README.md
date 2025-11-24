# Unit 4: Forms and User Input

**Time**: 2-3 hours | **Level**: Intermediate

## 🎯 Learning Objectives

- Handle form submissions in React
- Implement form validation
- Use React Hook Form library
- Handle different input types
- Create accessible forms
- Manage form state effectively

## Key Topics

### 1. Basic Form Handling

```typescript
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} />
      <input name="email" value={formData.email} onChange={handleChange} />
      <textarea name="message" value={formData.message} onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 2. Form Validation

```typescript
interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log('Form is valid!', formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="name"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      {/* ... other fields ... */}
      <button type="submit">Register</button>
    </form>
  );
}
```

### 3. React Hook Form

```bash
npm install react-hook-form
```

```typescript
import { useForm } from 'react-hook-form';

interface FormData {
  name: string;
  email: string;
  password: string;
}

function RegistrationForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('name', { 
          required: 'Name is required',
          minLength: { value: 3, message: 'Min length is 3' }
        })}
      />
      {errors.name && <span>{errors.name.message}</span>}

      <input
        {...register('email', {
          required: 'Email is required',
          pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' }
        })}
      />
      {errors.email && <span>{errors.email.message}</span>}

      <input
        type="password"
        {...register('password', {
          required: 'Password is required',
          minLength: { value: 8, message: 'Min length is 8' }
        })}
      />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### 4. Different Input Types

```typescript
function FormInputs() {
  const [formData, setFormData] = useState({
    text: '',
    email: '',
    password: '',
    number: 0,
    date: '',
    checkbox: false,
    radio: '',
    select: '',
    textarea: ''
  });

  return (
    <form>
      {/* Text Input */}
      <input type="text" name="text" />

      {/* Email Input */}
      <input type="email" name="email" />

      {/* Password Input */}
      <input type="password" name="password" />

      {/* Number Input */}
      <input type="number" name="number" />

      {/* Date Input */}
      <input type="date" name="date" />

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={formData.checkbox}
        onChange={e => setFormData({ ...formData, checkbox: e.target.checked })}
      />

      {/* Radio Buttons */}
      <label>
        <input
          type="radio"
          name="radio"
          value="option1"
          checked={formData.radio === 'option1'}
          onChange={e => setFormData({ ...formData, radio: e.target.value })}
        />
        Option 1
      </label>

      {/* Select Dropdown */}
      <select
        value={formData.select}
        onChange={e => setFormData({ ...formData, select: e.target.value })}
      >
        <option value="">Select...</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </select>

      {/* Textarea */}
      <textarea
        value={formData.textarea}
        onChange={e => setFormData({ ...formData, textarea: e.target.value })}
      />
    </form>
  );
}
```

## Exercises

1. **Multi-Step Form**: Create a wizard-style form with 3 steps
2. **Dynamic Form**: Add/remove form fields dynamically
3. **File Upload**: Handle file input and preview
4. **Form with Async Validation**: Validate username availability via API

## Best Practices

- Use controlled components for forms
- Validate on blur and submit
- Provide clear error messages
- Disable submit button while submitting
- Clear form after successful submission
- Use React Hook Form for complex forms
- Make forms accessible (labels, ARIA attributes)

## Next Steps

Continue to [Unit 5: API Integration](../unit-05-api-integration/README.md)!
