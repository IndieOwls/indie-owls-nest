# Service Test Template

Copy this file to `src/{module}/{your-service}.spec.ts` and adapt.

## Basic service (DRIZZLE + LoggerService)

The most common pattern — a service that queries the database and logs.

```typescript
import { Test, TestingModule } from '@nestjs/testing'
import { YourService } from './your.service'
import { DRIZZLE } from '../../databases'
import { LoggerService } from '../../modules/logger'

describe('YourService', () => {
  let service: YourService

  // Mock DRIZZLE with the methods your service actually calls.
  // Start with an empty object and add mocks as you write tests:
  //   useValue: { select: jest.fn(), insert: jest.fn(), ... }
  const mockDb = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: LoggerService, useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() } },
      ],
    }).compile()

    service = module.get<YourService>(YourService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // --- CRUD skeletons — uncomment and adapt ---

  // describe('create', () => {
  //   it('should insert a record and return it', async () => {
  //     const input = { name: 'test' }
  //     const expected = { id: 1, ...input }
  //     mockDb.insert = jest.fn().mockReturnValue({
  //       values: jest.fn().mockReturnValue({
  //         returning: jest.fn().mockResolvedValue([expected]),
  //       }),
  //     })
  //
  //     const result = await service.create(input)
  //     expect(result).toEqual(expected)
  //   })
  //
  //   it('should throw on unique constraint violation', async () => {
  //     const error = new Error('duplicate key')
  //     error.code = '23505'
  //     error.constraint = 'some_unique_idx'
  //     mockDb.insert = jest.fn().mockReturnValue({
  //       values: jest.fn().mockReturnValue({
  //         returning: jest.fn().mockRejectedValue(error),
  //       }),
  //     })
  //
  //     await expect(service.create({ name: 'dup' })).rejects.toThrow()
  //   })
  // })

  // describe('findAll', () => {
  //   it('should return all non-deleted records', async () => {
  //     const rows = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]
  //     mockDb.select = jest.fn().mockReturnValue({
  //       from: jest.fn().mockReturnValue({
  //         where: jest.fn().mockResolvedValue(rows),
  //       }),
  //     })
  //
  //     const result = await service.findAll()
  //     expect(result).toHaveLength(2)
  //   })
  // })

  // describe('findOne', () => {
  //   it('should return the record when found', async () => {
  //     const expected = { id: 1, name: 'test' }
  //     mockDb.select = jest.fn().mockReturnValue({
  //       from: jest.fn().mockReturnValue({
  //         where: jest.fn().mockReturnValue({
  //           limit: jest.fn().mockResolvedValue([expected]),
  //         }),
  //       }),
  //     })
  //
  //     const result = await service.findOne(1)
  //     expect(result).toEqual(expected)
  //   })
  //
  //   it('should throw NotFoundException when not found', async () => {
  //     mockDb.select = jest.fn().mockReturnValue({
  //       from: jest.fn().mockReturnValue({
  //         where: jest.fn().mockReturnValue({
  //           limit: jest.fn().mockResolvedValue([]),
  //         }),
  //       }),
  //     })
  //
  //     await expect(service.findOne(999)).rejects.toThrow()
  //   })
  // })

  // describe('remove', () => {
  //   it('should delete the record', async () => {
  //     mockDb.delete = jest.fn().mockReturnValue({
  //       where: jest.fn().mockResolvedValue(true),
  //     })
  //
  //     const result = await service.remove(1)
  //     expect(result).toBe(true)
  //   })
  // })
})
```

## Service with ConfigService + injected dependencies

For services that read configuration or depend on other services.

```typescript
import { Test, TestingModule } from '@nestjs/testing'
import { YourService } from './your.service'
import { DRIZZLE } from '../../databases'
import { ConfigService } from '@nestjs/config'

describe('YourService', () => {
  let service: YourService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        { provide: DRIZZLE, useValue: {} },
        {
          provide: ConfigService,
          useValue: { get: jest.fn((key: string) => {
            const config = { 'session.durationDays': 7, 'app.url': 'http://test.local' }
            return config[key] ?? 'test'
          })},
        },
        // Add other services the constructor needs:
        // { provide: QueueService, useValue: { add: jest.fn() } },
        // { provide: CacheService, useValue: { get: jest.fn(), set: jest.fn(), delete: jest.fn() } },
      ],
    }).compile()

    service = module.get<YourService>(YourService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
```

## Resolver with @Auth() guard

Resolvers decorated with `@Auth()` trigger `RolesGuard`, which needs `SessionAuthGuard`.

```typescript
import { Test, TestingModule } from '@nestjs/testing'
import { YourResolver } from './your.resolver'
import { YourService } from './your.service'
import { DRIZZLE } from '../../databases'
import { LoggerService } from '../../modules/logger'
import { SessionAuthGuard } from '../../common/guards/session-auth.guard'

describe('YourResolver', () => {
  let resolver: YourResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourResolver,
        YourService,
        { provide: DRIZZLE, useValue: {} },
        { provide: LoggerService, useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() } },
        // @Auth() triggers RolesGuard which injects SessionAuthGuard
        { provide: SessionAuthGuard, useValue: { canActivate: jest.fn() } },
        // Add CacheService if your service uses it:
        // { provide: CacheService, useValue: { get: jest.fn(), set: jest.fn(), delete: jest.fn() } },
      ],
    }).compile()

    resolver = module.get<YourResolver>(YourResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
```

## Mock reference

| Dependency | Mock value |
|-----------|------------|
| `DRIZZLE` | `useValue: {}` — add `select`, `insert`, `update`, `delete`, `execute` mocks per test |
| `LoggerService` | `useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() }` |
| `ConfigService` | `useValue: { get: jest.fn((key) => ...) }` |
| `CacheService` | `useValue: { get: jest.fn(), set: jest.fn(), delete: jest.fn() }` |
| `QueueService` | `useValue: { add: jest.fn() }` |
| `SessionAuthGuard` | `useValue: { canActivate: jest.fn() }` — needed when resolver uses `@Auth()` |

## Tips

- **Mock DRIZZLE per test**: Set up `mockDb.select`, `mockDb.insert`, etc. inside each `it()` block.
- **Drizzle query chaining**: Drizzle builds queries via method chaining (`db.select().from().where()`). Each method must return an object with the next method. Example:
  ```typescript
  mockDb.select = jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([row]),
      }),
    }),
  })
  ```
- **Error codes**: Unique constraint violations use `error.code = '23505'`.
- **NotFoundException**: Services throw `NotFoundException` when rows aren't found. Assert with `rejects.toThrow()`.
