// Test file to verify pre-commit hooks
// This file should be auto-formatted by Prettier and linted by ESLint

export const testMessage = 'Hello from validation test';

export function greet(name: string): string {
  return `Hello, ${name}!`;
}

// This should trigger formatting (missing semicolons will be added if configured)
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map((n) => n * 2);

console.log(doubled);
