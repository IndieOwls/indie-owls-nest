import { InputType, Field, Int, PartialType } from '@nestjs/graphql'
import { IsInt, Min } from 'class-validator'
import { CreateFeatureFlagInput } from './create-feature-flag.input'

@InputType()
export class UpdateFeatureFlagInput extends PartialType(CreateFeatureFlagInput) {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  id: number
}
