import { InputType, Field, Int } from '@nestjs/graphql'
import { IsString, IsOptional, IsEnum, IsInt, Min, MaxLength } from 'class-validator'
import { AccessBanType } from './access-ban-type.enum'
import { AccessBanReasonType } from './access-ban-reason-type.enum'

@InputType()
export class CreateAccessBanInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  userId: number

  @Field(() => String)
  @IsString()
  @MaxLength(128)
  bannedBy: string

  @Field(() => String)
  @IsEnum(AccessBanReasonType)
  reasonType: AccessBanReasonType

  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(512)
  @IsOptional()
  reason?: string | null

  @Field(() => String, { defaultValue: AccessBanType.TEMPORARY })
  @IsEnum(AccessBanType)
  type: AccessBanType

  @Field(() => Date, { nullable: true })
  @IsOptional()
  expiresAt?: Date | null
}
