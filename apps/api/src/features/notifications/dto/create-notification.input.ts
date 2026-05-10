import { InputType, Int, Field } from '@nestjs/graphql'
import { IsInt, IsOptional, IsString, IsEnum, Min, MaxLength } from 'class-validator'
import { NotificationType } from './notification-type.enum'

@InputType()
export class CreateNotificationInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  userId: number

  @Field(() => NotificationType)
  @IsEnum(NotificationType)
  type: NotificationType

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  referenceId?: number | null

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(128)
  referenceType?: string | null

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string | null

  @Field(() => String)
  @IsString()
  @MaxLength(5000)
  message: string
}
