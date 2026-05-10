import { InputType, Field } from '@nestjs/graphql'
import { IsString, IsOptional, IsEmail, MaxLength, MinLength } from 'class-validator'

@InputType()
export class CreateUserInput {
  @Field(() => String)
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  username: string

  @Field(() => String)
  @IsEmail()
  @MaxLength(255)
  email: string

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(128)
  displayName?: string | null

  @Field(() => String, { nullable: true })
  @IsEmail()
  @IsOptional()
  altEmail?: string | null
}
