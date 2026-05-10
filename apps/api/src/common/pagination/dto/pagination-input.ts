import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql'

import { FilterOperator } from '../interfaces/pagination.interface'

registerEnumType(FilterOperator, { name: 'FilterOperator' })

@InputType()
export class SortInput {
  @Field(() => String)
  field: string

  @Field(() => String, { defaultValue: 'ASC' })
  direction: 'ASC' | 'DESC'
}

@InputType()
export class FilterInput {
  @Field(() => String)
  field: string

  @Field(() => FilterOperator)
  operator: FilterOperator

  @Field(() => String, { nullable: true })
  value?: string | null
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true })
  page?: number | null

  @Field(() => Int, { nullable: true })
  limit?: number | null

  @Field(() => [SortInput], { nullable: true })
  sort?: SortInput[] | null

  @Field(() => [FilterInput], { nullable: true })
  filter?: FilterInput[] | null
}
