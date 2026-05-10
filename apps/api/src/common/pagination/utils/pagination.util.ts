import { and, asc, desc, eq, gt, gte, inArray, like, lt, lte, ne, not, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'

import type { PaginateOptions, PaginatedResult, FilterArg } from '../interfaces/pagination.interface'
import { FilterOperator } from '../interfaces/pagination.interface'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/**
 * Apply pagination, sorting, and filtering to a Drizzle query.
 *
 * Works against any Drizzle table. Filters are AND-ed together.
 * The optional `where` parameter accepts raw Drizzle SQL conditions
 * that are AND-ed with any structured filters.
 *
 * @example
 * ```ts
 * const result = await paginate(db, users, {
 *   page: 1,
 *   limit: 20,
 *   sort: [{ field: 'createdAt', direction: 'DESC' }],
 *   filter: [{ field: 'role', operator: FilterOperator.EQ, value: 'ADMIN' }],
 * })
 * ```
 */
export async function paginate<T extends Record<string, any>>(
  db: { select: Function },
  table: Record<string, any>,
  options: PaginateOptions = {},
): Promise<PaginatedResult<T>> {
  const limit = Math.min(Math.max(options.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT)
  const page = Math.max(options.page ?? 1, 1)
  const offset = (page - 1) * limit

  // Build conditions from filters
  const conditions: SQL[] = []
  if (options.where) conditions.push(options.where)
  if (options.filter?.length) {
    for (const f of options.filter) {
      const col = table[f.field]
      if (!col) continue
      const cond = buildCondition(col, f)
      if (cond) conditions.push(cond)
    }
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  // Count
  const [countRow] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(table)
    .where(where)

  const totalCount = countRow?.count ?? 0
  const totalPages = Math.ceil(totalCount / limit)

  // Build ORDER BY
  const orderBy: any[] = []
  if (options.sort?.length) {
    for (const s of options.sort) {
      const col = table[s.field]
      if (col) orderBy.push(s.direction === 'DESC' ? desc(col) : asc(col))
    }
  }

  // Execute
  const data: T[] = await db
    .select()
    .from(table)
    .where(where)
    .orderBy(...orderBy)
    .limit(limit)
    .offset(offset)

  return {
    data,
    totalCount,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

function buildCondition(col: any, filter: FilterArg): SQL | undefined {
  const { operator, value } = filter

  switch (operator) {
    case FilterOperator.EQ:
      return value === null ? not(eq(col, col)) : eq(col, value)
    case FilterOperator.NEQ:
      return value === null ? eq(col, col) : ne(col, value)
    case FilterOperator.CONTAINS:
      return like(col, `%${value}%`)
    case FilterOperator.GT:
      return gt(col, value)
    case FilterOperator.GTE:
      return gte(col, value)
    case FilterOperator.LT:
      return lt(col, value)
    case FilterOperator.LTE:
      return lte(col, value)
    case FilterOperator.IN:
      return inArray(col, Array.isArray(value) ? value : [value])
    default:
      return undefined
  }
}
