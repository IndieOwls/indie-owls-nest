---
paths: ["**/*.ts", "**/*.tsx"]
---

# TypeScript Rules

## Naming conventions
- Files: `kebab-case.ts` (e.g., `session-auth.guard.ts`, `user-consents.service.ts`)
- Classes: PascalCase
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE for exported constants, camelCase for module-level
- Types/interfaces: PascalCase with `Type`/`Interface` suffix when ambiguous
- Enums: PascalCase members, UPPER_SNAKE_CASE values (e.g., `UserRole.ADMIN`)

## Imports
- Group imports: Node builtins → third-party → internal (separated by blank lines)
- Use path aliases where configured (e.g., `@app/` in tsconfig)
- Prefer `import type` for type-only imports to avoid bundling issues
- NEVER use `require()` — use ESM `import` statements

## Type safety
- Prefer `satisfies` over `as` for type assertions
- Use `unknown` instead of `any` when the type is genuinely unknown
- Explicitly type public function parameters and return types
- Use `Record<K, V>` over `{ [key: string]: any }`
- Prefer discriminated unions over optional fields for state machines

## Async
- Always `await` promises or attach `.catch()` — unhandled rejections crash Node
- Use `Promise.all()` for parallel independent operations
- Use `Promise.allSettled()` when partial failures are acceptable
