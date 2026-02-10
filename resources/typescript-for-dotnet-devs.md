# TypeScript for .NET Developers

A comprehensive guide to TypeScript for developers coming from a C#/.NET background.

## Introduction

If you're a C# developer, you're in luck! TypeScript was created by Microsoft and shares many design principles with C#. This guide will help you leverage your existing knowledge to quickly become productive with TypeScript.

## Quick Comparison Table

| Feature | C# | TypeScript |
|---------|-----|-----------|
| **Creator** | Microsoft (Anders Hejlsberg) | Microsoft (Anders Hejlsberg) |
| **Type System** | Static, strong | Static (compile-time), dynamic (runtime) |
| **Compilation** | Compiles to IL → runs on CLR | Transpiles to JavaScript → runs on JS engine |
| **Runtime** | .NET Runtime (CLR) | JavaScript engines (V8, SpiderMonkey, etc.) |
| **Type Checking** | Compile-time AND runtime | Compile-time only |
| **Null Safety** | Nullable reference types (C# 8+) | `strictNullChecks` compiler option |
| **Generics** | Full support with constraints | Full support with constraints |
| **Interfaces** | Yes | Yes |
| **Classes** | Yes | Yes (but prefer functions in React) |
| **Async/Await** | Yes | Yes (identical syntax!) |
| **LINQ** | Yes | No (but similar with array methods) |

## Type System

### Primitive Types

```csharp
// C#
string name = "John";
int age = 30;
bool isActive = true;
double price = 99.99;
```

```typescript
// TypeScript
let name: string = "John";
let age: number = 30;           // All numbers are floating point
let isActive: boolean = true;
// Note: TypeScript only has 'number' type (no int, double, decimal, etc.)
```

### Type Inference

Both languages support type inference:

```csharp
// C#
var name = "John";  // Inferred as string
var age = 30;       // Inferred as int
```

```typescript
// TypeScript
let name = "John";  // Inferred as string
let age = 30;       // Inferred as number
```

### Arrays and Lists

```csharp
// C#
List<string> names = new List<string> { "Alice", "Bob" };
int[] numbers = { 1, 2, 3 };
```

```typescript
// TypeScript
let names: string[] = ["Alice", "Bob"];
let numbers: number[] = [1, 2, 3];

// Alternative syntax (less common)
let names: Array<string> = ["Alice", "Bob"];
```

## Interfaces

### Basic Interfaces

```csharp
// C#
public interface IUser
{
    int Id { get; set; }
    string Name { get; set; }
    string Email { get; set; }
}
```

```typescript
// TypeScript (no 'I' prefix convention)
interface User {
  id: number;
  name: string;
  email: string;
}
```

### Optional Properties

```csharp
// C#
public interface IUser
{
    int Id { get; set; }
    string Name { get; set; }
    string? Email { get; set; }  // Nullable
}
```

```typescript
// TypeScript
interface User {
  id: number;
  name: string;
  email?: string;  // Optional with ?
}
```

### Readonly Properties

```csharp
// C#
public interface IUser
{
    int Id { get; }  // Read-only
    string Name { get; set; }
}
```

```typescript
// TypeScript
interface User {
  readonly id: number;  // Read-only
  name: string;
}
```

## Classes

### Basic Class

```csharp
// C#
public class Person
{
    public string Name { get; set; }
    public int Age { get; set; }

    public Person(string name, int age)
    {
        Name = name;
        Age = age;
    }

    public string Greet()
    {
        return $"Hello, I'm {Name}";
    }
}
```

```typescript
// TypeScript
class Person {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  greet(): string {
    return `Hello, I'm ${this.name}`;
  }
}
```

### Access Modifiers

```csharp
// C#
public class BankAccount
{
    private decimal balance;
    public string AccountNumber { get; private set; }

    public void Deposit(decimal amount)
    {
        balance += amount;
    }
}
```

```typescript
// TypeScript
class BankAccount {
  private balance: number;
  public accountNumber: string;

  constructor(accountNumber: string) {
    this.balance = 0;
    this.accountNumber = accountNumber;
  }

  public deposit(amount: number): void {
    this.balance += amount;
  }
}
```

### Inheritance

```csharp
// C#
public class Animal
{
    public virtual void MakeSound()
    {
        Console.WriteLine("Some sound");
    }
}

public class Dog : Animal
{
    public override void MakeSound()
    {
        Console.WriteLine("Woof!");
    }
}
```

```typescript
// TypeScript
class Animal {
  makeSound(): void {
    console.log("Some sound");
  }
}

class Dog extends Animal {
  makeSound(): void {
    console.log("Woof!");
  }
}
```

## Generics

### Generic Functions

```csharp
// C#
public T FirstOrDefault<T>(List<T> list)
{
    return list.Count > 0 ? list[0] : default(T);
}
```

```typescript
// TypeScript
function firstOrDefault<T>(list: T[]): T | undefined {
  return list.length > 0 ? list[0] : undefined;
}
```

### Generic Constraints

```csharp
// C#
public T Max<T>(T a, T b) where T : IComparable<T>
{
    return a.CompareTo(b) > 0 ? a : b;
}
```

```typescript
// TypeScript
interface Comparable {
  compareTo(other: Comparable): number;
}

function max<T extends Comparable>(a: T, b: T): T {
  return a.compareTo(b) > 0 ? a : b;
}
```

## Null and Undefined

### C# Nullable Types

```csharp
// C#
int? age = null;  // Nullable int
string? name = null;  // Nullable reference type (C# 8+)

if (age.HasValue)
{
    Console.WriteLine(age.Value);
}
```

### TypeScript Null and Undefined

```typescript
// TypeScript has BOTH null and undefined
let age: number | null = null;
let name: string | undefined = undefined;

// With strictNullChecks enabled
let count: number = null;  // Error!
let count: number | null = null;  // OK

// Checking for null/undefined
if (age !== null) {
  console.log(age);
}

// Optional chaining (like C# null-conditional operator)
const length = name?.length;  // undefined if name is null/undefined
```

## Functions

### Basic Functions

```csharp
// C#
public int Add(int a, int b)
{
    return a + b;
}

public string Greet(string name = "Guest")
{
    return $"Hello, {name}";
}
```

```typescript
// TypeScript
function add(a: number, b: number): number {
  return a + b;
}

function greet(name: string = "Guest"): string {
  return `Hello, ${name}`;
}
```

### Lambda Expressions / Arrow Functions

```csharp
// C#
Func<int, int, int> add = (a, b) => a + b;
var numbers = new List<int> { 1, 2, 3 };
var doubled = numbers.Select(x => x * 2);
```

```typescript
// TypeScript
const add = (a: number, b: number): number => a + b;
const numbers = [1, 2, 3];
const doubled = numbers.map(x => x * 2);
```

## Async/Await

**Great news**: Async/await works identically in both languages!

```csharp
// C#
public async Task<User> GetUserAsync(int id)
{
    var response = await httpClient.GetAsync($"/api/users/{id}");
    var user = await response.Content.ReadAsAsync<User>();
    return user;
}
```

```typescript
// TypeScript
async function getUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const user: User = await response.json();
  return user;
}
```

## LINQ vs Array Methods

C# LINQ has equivalents in TypeScript's array methods:

```csharp
// C#
var numbers = new List<int> { 1, 2, 3, 4, 5 };

var doubled = numbers.Select(x => x * 2);
var evens = numbers.Where(x => x % 2 == 0);
var sum = numbers.Sum();
var first = numbers.FirstOrDefault(x => x > 3);
var any = numbers.Any(x => x > 10);
var all = numbers.All(x => x > 0);
```

```typescript
// TypeScript
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map(x => x * 2);           // Select
const evens = numbers.filter(x => x % 2 === 0);    // Where
const sum = numbers.reduce((a, b) => a + b, 0);    // Sum
const first = numbers.find(x => x > 3);            // FirstOrDefault
const any = numbers.some(x => x > 10);             // Any
const all = numbers.every(x => x > 0);             // All
```

## Union Types (TypeScript-Specific)

TypeScript has union types, which don't have a direct C# equivalent:

```typescript
// TypeScript
type ID = string | number;  // Can be either string or number

let userId: ID = 123;      // OK
userId = "ABC123";         // Also OK

function printId(id: string | number) {
  if (typeof id === "string") {
    console.log(id.toUpperCase());
  } else {
    console.log(id.toFixed(2));
  }
}
```

**C# Equivalent** (not as elegant):
```csharp
// C# - would need to use object or create a custom type
public void PrintId(object id)
{
    if (id is string str)
    {
        Console.WriteLine(str.ToUpper());
    }
    else if (id is int num)
    {
        Console.WriteLine(num.ToString("F2"));
    }
}
```

## Type Aliases

```csharp
// C# (using directive)
using UserId = System.Int32;
```

```typescript
// TypeScript
type UserId = number;
type UserName = string;
type ID = string | number;

// More complex types
type User = {
  id: UserId;
  name: UserName;
  email: string;
};
```

## Enums

```csharp
// C#
public enum Status
{
    Active,
    Inactive,
    Pending
}

var status = Status.Active;
```

```typescript
// TypeScript - Numeric enum
enum Status {
  Active,
  Inactive,
  Pending
}

const status = Status.Active;

// String enum (more common in TypeScript)
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Pending = "PENDING"
}

// Or use union types (preferred in modern TypeScript)
type Status = "ACTIVE" | "INACTIVE" | "PENDING";
```

## Key Differences to Remember

### 1. Type Erasure

```csharp
// C# - Types exist at runtime
if (obj is User user)
{
    // Can check types at runtime
}
```

```typescript
// TypeScript - Types are erased at runtime
// This won't work at runtime!
if (obj instanceof User) {  // Only works for classes, not interfaces
  // ...
}

// Instead, use type guards
function isUser(obj: any): obj is User {
  return typeof obj.id === 'number' && typeof obj.name === 'string';
}
```

### 2. No Method Overloading (in the traditional sense)

```csharp
// C# - Method overloading
public void Print(string message) { }
public void Print(int number) { }
```

```typescript
// TypeScript - Use union types or optional parameters
function print(value: string | number): void {
  console.log(value);
}

// Or function overload signatures (less common)
function print(message: string): void;
function print(number: number): void;
function print(value: string | number): void {
  console.log(value);
}
```

### 3. Variable Declaration

```csharp
// C#
var name = "John";  // Scoped to method
const int MAX = 100;  // Compile-time constant
```

```typescript
// TypeScript
let name = "John";    // Block-scoped, can reassign
const MAX = 100;      // Block-scoped, cannot reassign
var old = "avoid";    // Function-scoped, avoid using!
```

**Rule**: Always use `const` by default, `let` when you need to reassign. Never use `var`.

## Best Practices for C# Developers

1. **Use `const` by default**: Unlike C# where `const` is rare, use it liberally in TypeScript
2. **Prefer interfaces over classes**: In React, you'll mostly use interfaces for props
3. **Enable strict mode**: Set `"strict": true` in `tsconfig.json` (like nullable reference types)
4. **Use type inference**: Let TypeScript infer types when obvious
5. **Avoid `any`**: It's like `object` or `dynamic` in C# - loses type safety
6. **Use union types**: They're powerful and have no C# equivalent
7. **Learn array methods**: They replace LINQ in TypeScript

## Common Pitfalls

### 1. Comparing with `==` vs `===`

```csharp
// C# - Only one equality operator
if (a == b) { }
```

```typescript
// TypeScript - Use === (strict equality)
if (a === b) { }  // ✅ Correct - checks value AND type
if (a == b) { }   // ❌ Avoid - type coercion can cause bugs
```

### 2. Truthy/Falsy Values

```typescript
// TypeScript has truthy/falsy values
if (value) { }  // Checks if value is truthy

// Falsy values: false, 0, "", null, undefined, NaN
// Everything else is truthy

// Be careful with numbers!
const count = 0;
if (count) {  // This is false!
  console.log("Has items");
}

// Better:
if (count > 0) {
  console.log("Has items");
}
```

### 3. `this` Binding

```typescript
// TypeScript - 'this' can be tricky
class Counter {
  count = 0;

  increment() {
    this.count++;
  }

  // ❌ Problem: 'this' is lost when passed as callback
  button.addEventListener('click', this.increment);

  // ✅ Solution: Use arrow function
  increment = () => {
    this.count++;
  }
}
```

## What's New in TypeScript 5.8 & 5.9

This tutorial uses **TypeScript ~5.9** — here are the most relevant new features for React developers.

### TypeScript 5.8 (February 2025)

#### Run TypeScript Directly in Node.js

With the `--erasableSyntaxOnly` flag, Node.js 23.6+ can execute TypeScript files **directly** — no compilation step needed:

```bash
# Run TypeScript directly (Node.js 23.6+)
node --experimental-strip-types myScript.ts
```

```typescript
// This works when syntax is "erasable" (types only, no enums or decorators)
function greet(name: string): string {
  return `Hello, ${name}`;
}

// Node.js strips the type annotations and runs the JavaScript
console.log(greet("World"));
```

**C# Analogy**: Like running C# scripts with `dotnet-script` — quick execution without a full build pipeline.

> **Note**: For React apps built with Vite, you still use the normal build pipeline. This feature is great for scripts, tools, and quick prototyping.

#### Improved Module Interop

TypeScript 5.8 improved ESM/CJS interoperability with `--module nodenext`:

```typescript
// You can now require() ESM modules from CJS files
// under --module nodenext
const { helper } = require('./esm-module');
```

#### Better Return Type Checking

More granular type checking in conditional return expressions catches bugs earlier:

```typescript
function processValue(value: string | number): string {
  // TS 5.8 catches subtle type errors in branches like this
  return typeof value === 'string'
    ? value.toUpperCase()
    : value.toFixed(2);  // Correctly inferred as string
}
```

### TypeScript 5.9 (August 2025)

#### `import defer` — Lazy Module Loading

The headline feature: **deferred module imports** that delay execution until the module is actually used:

```typescript
// Traditional import — module executes immediately when this file loads
import { heavyComputation } from './analytics';

// Deferred import — module only executes when you first access an export
import defer * as analytics from './analytics';

// The analytics module hasn't executed yet!
console.log('App started');

// NOW it executes (on first property access)
analytics.heavyComputation(data);
```

**Why this matters for React**:
- Reduce initial bundle execution time
- Defer expensive initialization (chart libraries, date formatters, etc.)
- Better control over when side effects run

**C# Analogy**: Like `Lazy<T>` in .NET:

```csharp
// C# equivalent concept
private Lazy<AnalyticsService> _analytics = new(() => new AnalyticsService());

// Only instantiated on first access
_analytics.Value.HeavyComputation(data);
```

#### Streamlined `tsc --init`

The generated `tsconfig.json` is now **minimal and clean** instead of a wall of commented-out options:

```bash
# Before (TS 5.8): 100+ lines of commented options
tsc --init

# After (TS 5.9): Clean, minimal config
tsc --init
```

```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### `--module node20`

A stable module resolution option for Node.js 20:

```json
{
  "compilerOptions": {
    "module": "node20",
    "moduleResolution": "node20"
  }
}
```

#### Expandable Hovers in Editors

VS Code now shows `+` and `−` buttons on type hovers to expand/collapse complex types:

```typescript
// Hover over 'user' to see the type
// Click + to expand nested types, - to collapse
const user: ComplexUserType = getUser();
//    ↑ Hover here → shows summary, click + for full type details
```

This is especially useful for deeply nested types like Zod inferred schemas and React component props.

#### Summary Table

| Feature | TS 5.8 | TS 5.9 | C# Analogy |
|---------|--------|--------|------------|
| **Direct Node.js execution** | ✅ `--erasableSyntaxOnly` | — | `dotnet-script` |
| **ESM/CJS interop** | ✅ Improved | — | Assembly loading |
| **Return type checking** | ✅ Granular branches | — | Flow analysis |
| **`import defer`** | — | ✅ | `Lazy<T>` |
| **Minimal `tsc --init`** | — | ✅ | `dotnet new console` |
| **`--module node20`** | — | ✅ | Target framework |
| **Expandable hovers** | — | ✅ | VS IntelliSense |

---

## Conclusion

As a C# developer, you have a huge head start with TypeScript! The languages share:
- Strong typing
- Interfaces and classes
- Generics
- Async/await
- Similar syntax

The main differences are:
- TypeScript types are compile-time only
- No method overloading (use union types instead)
- Different runtime (JavaScript vs .NET)
- Array methods instead of LINQ

**What's exciting in 5.8/5.9**: Direct Node.js execution brings TypeScript closer to the "just run it" experience C# developers enjoy with `dotnet run`. The `import defer` syntax gives you `Lazy<T>`-style control over module loading.

**Next Steps**: Start writing TypeScript code! The best way to learn is by doing. Your C# knowledge will transfer beautifully.

---

*Happy coding! 🚀*
