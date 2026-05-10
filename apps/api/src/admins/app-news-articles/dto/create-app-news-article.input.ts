import { InputType, Int, Field } from '@nestjs/graphql'
import { IsString, IsOptional, IsBoolean, IsUrl, MaxLength, MinLength } from 'class-validator'

@InputType()
export class CreateAppNewsArticleInput {
  @Field(() => String)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string

  @Field(() => String)
  @IsString()
  @MaxLength(10000)
  content: string

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean

  @Field(() => Int, { nullable: true })
  @IsOptional()
  authorId?: number | null

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  sourceUrl?: string | null
}
