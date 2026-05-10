import { InputType, Field, Int, PartialType } from '@nestjs/graphql'
import { IsInt, IsOptional, IsEnum, Min } from 'class-validator'
import { CreateDataRequestInput } from './create-data-request.input'
import { DataRequestStatus } from './data-request-status.enum'

@InputType()
export class UpdateDataRequestInput extends PartialType(CreateDataRequestInput) {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  id: number

  @Field(() => DataRequestStatus, { nullable: true })
  @IsEnum(DataRequestStatus)
  @IsOptional()
  status?: DataRequestStatus
}
