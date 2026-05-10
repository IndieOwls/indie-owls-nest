# Resolver Test Template

Follow this pattern for all resolver unit tests.

## Mock structure
- Use plain jest.fn() objects for all service mocks
- Reset mocks between tests with `beforeEach(() => jest.clearAllMocks())`
- Only mock the methods the resolver actually calls

## Standard imports
```typescript
import { Test, TestingModule } from '@nestjs/testing'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
```

## Test patterns

### 1. "should be defined" — always include

### 2. Success paths — one per resolver method
```typescript
it('should return all items', async () => {
  const expected = [{ id: 1 }]
  mockService.findAll.mockResolvedValue(expected)
  const result = await resolver.findAll()
  expect(result).toEqual(expected)
  expect(mockService.findAll).toHaveBeenCalledTimes(1)
})
```

### 3. Error paths — per method
```typescript
it('should throw when not found', async () => {
  mockService.findOne.mockRejectedValue(new NotFoundException())
  await expect(resolver.findOne(999)).rejects.toThrow(NotFoundException)
})
```

### 4. Logger verification — when resolver uses logger
```typescript
it('should log before creating', async () => {
  await resolver.create(input)
  expect(mockLogger.log).toHaveBeenCalled()
})
```

### 5. Authorization — when resolver has self-vs-admin logic
```typescript
it('should forbid non-admin updating another user', async () => {
  const currentUser = { id: 2, role: 'USER' }
  const input = { id: 1 } // different user
  resolver.updateUser(input, currentUser)
  await expect(result).rejects.toThrow(ForbiddenException)
})
```

## Provider setup patterns

With LoggerService:
```typescript
{ provide: LoggerService, useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() } }
```

With DRIZZLE:
```typescript
{ provide: DRIZZLE, useValue: { select: jest.fn(), insert: jest.fn(), update: jest.fn(), delete: jest.fn() } }
```
