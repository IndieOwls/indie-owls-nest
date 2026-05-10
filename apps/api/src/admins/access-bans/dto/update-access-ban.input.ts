import { InputType, Field, Int, PartialType } from '@nestjs/graphql'
import { IsString, IsInt, Min, MaxLength } from 'class-validator'
import { CreateAccessBanInput } from './create-access-ban.input'

@InputType()
export class UpdateAccessBanInput extends PartialType(CreateAccessBanInput) {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  userId: number

  @Field(() => String)
  @IsString()
  @MaxLength(128)
  bannedBy: string
}
