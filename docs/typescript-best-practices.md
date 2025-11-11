# TypeScript Best Practices

This guide outlines TypeScript best practices for the sebc.dev project to maintain type safety, code quality, and developer productivity.

## Table of Contents

1. [Type Assertions](#type-assertions)
2. [Working with Web APIs](#working-with-web-apis)
3. [Runtime Validation](#runtime-validation)
4. [Common Patterns](#common-patterns)
5. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Type Assertions

### ❌ Avoid: Double Assertion (`as unknown as`)

The `as unknown as` pattern completely bypasses TypeScript's type checking and should be avoided.

```typescript
// ❌ BAD: Bypasses all type safety
const data = apiResponse as unknown as MyType;

// ❌ BAD: No runtime validation
const layoutShift = entry as unknown as {
  hadRecentInput?: boolean;
  value?: number;
};
```

**Why it's bad:**

- Removes all type safety guarantees
- Can cause runtime errors
- Hides actual type mismatches
- Makes refactoring dangerous

### ✅ Preferred: Type Guards

Use type guards to validate types at runtime while maintaining type safety.

```typescript
// ✅ GOOD: Type guard with runtime validation
function isMyType(data: unknown): data is MyType {
  return (
    typeof data === 'object' &&
    data !== null &&
    'requiredField' in data &&
    typeof (data as any).requiredField === 'string'
  );
}

// Usage
if (isMyType(apiResponse)) {
  // TypeScript knows apiResponse is MyType here
  console.log(apiResponse.requiredField);
}
```

### ✅ Alternative: Validation Libraries

For complex data structures, use validation libraries like Zod or Yup.

```typescript
// ✅ GOOD: Schema validation with Zod
import { z } from 'zod';

const MyTypeSchema = z.object({
  requiredField: z.string(),
  optionalField: z.number().optional(),
});

type MyType = z.infer<typeof MyTypeSchema>;

// Runtime validation with type safety
const data = MyTypeSchema.parse(apiResponse);
// data is now validated and typed as MyType
```

### ✅ Acceptable: Intersection Types with Validation

When working with known base types, use intersection types with validation.

```typescript
// ✅ GOOD: Intersection type with runtime check
if (entry.entryType === 'layout-shift') {
  const layoutShift = entry as PerformanceEntry & {
    hadRecentInput?: boolean;
    value: number;
  };
  // Safe to use layoutShift.value
}
```

---

## Working with Web APIs

### Native Types First

Always prefer native TypeScript DOM types over custom definitions.

```typescript
// ❌ BAD: Custom type definition
interface CustomLayoutShift {
  value?: number;
  hadRecentInput?: boolean;
}

// ✅ GOOD: Use native LayoutShift type
// TypeScript includes types for Web Performance APIs
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'layout-shift') {
      // entry is properly typed
      const shift = entry as LayoutShift;
      console.log(shift.value);
    }
  }
});
```

### Common Web API Types

TypeScript includes types for most Web APIs:

- **Performance**: `PerformanceEntry`, `PerformanceObserver`, `PerformanceNavigationTiming`, `LayoutShift`
- **DOM**: `HTMLElement`, `Element`, `Document`, `Event`
- **Fetch**: `Request`, `Response`, `Headers`
- **Storage**: `Storage`, `StorageEvent`

**Find types in:** `node_modules/typescript/lib/lib.dom.d.ts`

---

## Runtime Validation

### Type Guards Pattern

```typescript
// Basic type guard
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Object type guard
interface User {
  id: number;
  name: string;
  email: string;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as any).id === 'number' &&
    'name' in value &&
    typeof (value as any).name === 'string' &&
    'email' in value &&
    typeof (value as any).email === 'string'
  );
}

// Usage
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();

  if (!isUser(data)) {
    throw new Error('Invalid user data');
  }

  return data; // TypeScript knows this is User
}
```

### Array Validation

```typescript
function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

function isUserArray(value: unknown): value is User[] {
  return Array.isArray(value) && value.every(isUser);
}
```

---

## Common Patterns

### Optional Chaining

```typescript
// ❌ BAD: Multiple null checks
if (user && user.profile && user.profile.address) {
  console.log(user.profile.address.street);
}

// ✅ GOOD: Optional chaining
console.log(user?.profile?.address?.street);
```

### Nullish Coalescing

```typescript
// ❌ BAD: || can be problematic with falsy values
const port = process.env.PORT || 3000; // 0 would be falsy!

// ✅ GOOD: ?? only checks for null/undefined
const port = process.env.PORT ?? 3000;
```

### Non-null Assertion (Use Sparingly)

```typescript
// ⚠️ USE SPARINGLY: Only when you're 100% certain
const element = document.getElementById('my-id')!;
// This throws a runtime error if element is null

// ✅ BETTER: Handle the null case
const element = document.getElementById('my-id');
if (!element) {
  throw new Error('Element not found');
}
// Now TypeScript knows element is not null
```

### Type Narrowing

```typescript
function processValue(value: string | number) {
  // ❌ BAD: Using type assertion
  const str = value as string;

  // ✅ GOOD: Type narrowing
  if (typeof value === 'string') {
    // TypeScript knows value is string here
    console.log(value.toUpperCase());
  } else {
    // TypeScript knows value is number here
    console.log(value.toFixed(2));
  }
}
```

---

## Anti-Patterns to Avoid

### 1. Ignoring TypeScript Errors with `@ts-ignore`

```typescript
// ❌ BAD: Silencing errors
// @ts-ignore
const result = someFunction();

// ✅ GOOD: Fix the underlying issue
const result = someFunction() as ExpectedType;
// Or better: fix the function's return type
```

### 2. Using `any` Unnecessarily

```typescript
// ❌ BAD: Defeats the purpose of TypeScript
function processData(data: any) {
  return data.value; // No type safety
}

// ✅ GOOD: Use generics or proper types
function processData<T extends { value: unknown }>(data: T) {
  return data.value;
}

// ✅ BETTER: Use unknown for truly unknown types
function processData(data: unknown) {
  if (isValidData(data)) {
    return data.value;
  }
  throw new Error('Invalid data');
}
```

### 3. Not Leveraging Type Inference

```typescript
// ❌ BAD: Unnecessary type annotations
const name: string = 'John'; // TypeScript infers this

// ✅ GOOD: Let TypeScript infer
const name = 'John';

// ✅ GOOD: Explicit when needed
const users: User[] = []; // Helpful for empty arrays
```

### 4. Overly Complex Types

```typescript
// ❌ BAD: Hard to read and maintain
type ComplexType = {
  [K in keyof SomeType]: SomeType[K] extends string
    ? SomeType[K]
    : SomeType[K] extends number
      ? string
      : never;
};

// ✅ GOOD: Break it down
type StringOrNumber = string | number;
type ConvertedValue<T> = T extends string
  ? T
  : T extends number
    ? string
    : never;
type ComplexType = {
  [K in keyof SomeType]: ConvertedValue<SomeType[K]>;
};
```

---

## Project-Specific Guidelines

### React Components

```typescript
// ✅ GOOD: Props interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
}: ButtonProps) {
  // Component implementation
}
```

### Server Components (Next.js 15)

```typescript
// ✅ GOOD: Async server component with proper types
interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Page({ params, searchParams }: PageProps) {
  const data = await fetchData(params.id);
  return <div>{data.title}</div>;
}
```

### API Routes

```typescript
// ✅ GOOD: Typed API route with validation
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RequestSchema.parse(body);

    // validatedData is now type-safe
    const result = await processUser(validatedData);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

---

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Zod Documentation](https://zod.dev/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Next.js TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript)

---

## Enforcement

### ESLint Rules

Add these rules to `.eslintrc.json` to enforce best practices:

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
    "@typescript-eslint/prefer-optional-chain": "warn"
  }
}
```

### Pre-commit Hooks

Ensure TypeScript compiles without errors before committing:

```bash
# In .husky/pre-commit
pnpm tsc --noEmit
```

---

## Summary

**Key Takeaways:**

1. ✅ **Prefer type guards** over `as unknown as`
2. ✅ **Use native Web API types** when available
3. ✅ **Validate at runtime** with Zod or type guards
4. ✅ **Let TypeScript infer** types when possible
5. ❌ **Avoid `any`** unless absolutely necessary
6. ❌ **Never use `as unknown as`** without justification
7. ✅ **Use optional chaining** and nullish coalescing

Following these practices will help maintain type safety, catch bugs early, and make the codebase easier to refactor and maintain.
