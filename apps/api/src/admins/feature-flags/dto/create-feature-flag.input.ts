import { InputType, Field } from '@nestjs/graphql'
import { IsString, IsOptional, IsBoolean, MaxLength, MinLength } from 'class-validator'

@InputType()
export class CreateFeatureFlagInput {
  @Field(() => String)
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  name: string

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(512)
  description?: string | null

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  special?: string | null

  @Field(() => Boolean)
  @IsBoolean()
  enabled: boolean

  @Field(() => [String], { nullable: true })
  @IsString({ each: true })
  @IsOptional()
  allowedRoles?: string[]
}
