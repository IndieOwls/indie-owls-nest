---
paths: ["**/*.spec.ts", "**/*.e2e-spec.ts"]
---

# Testing Rules

## Unit tests
- Use `@nestjs/testing` `Test.createTestingModule()` for NestJS component tests
- Mock all database dependencies: `{ provide: DRIZZLE, useValue: mock }`
- Mock `ConfigService`, `LoggerService`, and other global providers
- Use `jest.fn()` for method mocks, `jest.spyOn()` for partial mocks

## E2E tests
- Use `Test.createTestingModule({ imports: [AppModule] })` for full app bootstrap
- NODE_ENV=test is set automatically via the npm script
- `.env.test` is loaded by the env cascade when NODE_ENV=test
- Use supertest (`@nestjs/testing` + `supertest`) for HTTP endpoint testing

## Test structure
```
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should do what?', async () => {
      // arrange
      // act
      // assert
    })
  })
})
```

## What to test
- CRUD operations: success paths AND error paths (not found, conflict, server error)
- Auth guards: authenticated and unauthenticated variants
- Edge cases: empty results, duplicate entries, expired sessions
- DON'T test: trivial getters, TypeScript type checking, NestJS framework behavior
