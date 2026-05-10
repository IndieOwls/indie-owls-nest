import { InputType, Field, Int, PartialType } from '@nestjs/graphql'
import { IsInt, Min } from 'class-validator'
import { CreateNotificationInput } from './create-notification.input'

@InputType()
export class UpdateNotificationInput extends PartialType(CreateNotificationInput) {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  id: number
}
