import { InputType, Field } from '@nestjs/graphql'
import { IsString, IsOptional, MaxLength, MinLength, Matches } from 'class-validator'

@InputType()
export class CreateOrganizationInput {
  @Field(() => String)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(128)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must contain only lowercase letters, numbers, and hyphens' })
  slug?: string
}
