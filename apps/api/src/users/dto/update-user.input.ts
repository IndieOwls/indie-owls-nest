import { InputType, Field, Int, PartialType } from '@nestjs/graphql'
import { IsInt, Min } from 'class-validator'
import { CreateUserInput } from './create-user.input'

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  id: number
}
