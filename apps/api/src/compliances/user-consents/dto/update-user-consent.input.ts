import { CreateUserConsentInput } from './create-user-consent.input'
import { InputType, Field, Int, PartialType } from '@nestjs/graphql'
import { IsInt, Min } from 'class-validator'

@InputType()
export class UpdateUserConsentInput extends PartialType(CreateUserConsentInput) {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  id: number
}
