import { Field, Int, ObjectType } from '@nestjs/graphql'

import { FilterOperator } from '../interfaces/pagination.interface'

@ObjectType()
export class PageInfo {
  @Field(() => Int)
  totalCount: number

  @Field(() => Int)
  totalPages: number

  @Field(() => Int)
  page: number

  @Field(() => Int)
  limit: number

  @Field(() => Boolean)
  hasNextPage: boolean

  @Field(() => Boolean)
  hasPreviousPage: boolean
}

/**
 * Generic paginated response wrapper.
 *
 * Extend in each resolver that needs pagination:
 *
 *   @ObjectType()
 *   class UserConnection extends PaginatedType(User) {}
 */
export function PaginatedType<T>(ItemClass: new (...args: any[]) => T): any {
  @ObjectType({ isAbstract: true })
  abstract class Paginated {
    @Field(() => [ItemClass])
    data: T[]

    @Field(() => PageInfo)
    pageInfo: PageInfo
  }

  return Paginated
}

export { FilterOperator } from '../interfaces/pagination.interface'
