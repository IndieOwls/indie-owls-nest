import { InputType, Int, Field } from '@nestjs/graphql'
import { IsInt, IsOptional, IsEmail, IsEnum, Min } from 'class-validator'
import { DataRequestType } from './data-request-type.enum'

@InputType()
export class CreateDataRequestInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  userId?: number

  @Field(() => String, { nullable: true })
  @IsEmail()
  @IsOptional()
  userEmail?: string

  @Field(() => DataRequestType)
  @IsEnum(DataRequestType)
  type: DataRequestType
}
