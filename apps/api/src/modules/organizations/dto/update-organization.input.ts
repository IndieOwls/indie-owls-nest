import { InputType, Field, Int, PartialType } from '@nestjs/graphql'
import { IsInt, Min } from 'class-validator'
import { CreateOrganizationInput } from './create-organization.input'

@InputType()
export class UpdateOrganizationInput extends PartialType(CreateOrganizationInput) {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  id: number
}
