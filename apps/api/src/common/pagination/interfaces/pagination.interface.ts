import type { SQL } from 'drizzle-orm'

export interface SortArg {
  field: string
  direction: 'ASC' | 'DESC'
}

export interface FilterArg {
  field: string
  operator: FilterOperator
  value: any
}

export enum FilterOperator {
  EQ = 'EQ',
  NEQ = 'NEQ',
  CONTAINS = 'CONTAINS',
  GT = 'GT',
  GTE = 'GTE',
  LT = 'LT',
  LTE = 'LTE',
  IN = 'IN',
}

export interface PaginateOptions {
  /** Additional WHERE conditions AND-ed with filters */
  where?: SQL | undefined
  /** 1-indexed page number (default: 1) */
  page?: number
  /** Items per page (default: 20, max: 100) */
  limit?: number
  /** Sort configuration */
  sort?: SortArg[]
  /** Filter configuration */
  filter?: FilterArg[]
}

export interface PaginatedResult<T> {
  data: T[]
  totalCount: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
