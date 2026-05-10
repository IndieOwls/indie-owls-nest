import { ObjectType, Field, Int } from '@nestjs/graphql'
import { PiiCategory } from './pii-category.enum'

@ObjectType()
export class PiiFieldValue {
  @Field(() => String)
  fieldName: string

  @Field(() => PiiCategory)
  category: PiiCategory

  @Field(() => String, { nullable: true })
  value: string | null
}

@ObjectType()
export class EntityPiiGroup {
  @Field(() => String)
  entity: string

  @Field(() => String)
  description: string

  @Field(() => [PiiFieldValue])
  fields: PiiFieldValue[]
}

@ObjectType()
export class PiiReport {
  @Field(() => Int)
  userId: number

  @Field(() => [PiiFieldValue])
  consolidated: PiiFieldValue[]

  @Field(() => [EntityPiiGroup])
  records: EntityPiiGroup[]
}
