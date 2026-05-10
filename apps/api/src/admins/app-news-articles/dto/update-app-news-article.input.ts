import { InputType, Field, Int, PartialType } from '@nestjs/graphql'
import { IsInt, Min } from 'class-validator'
import { CreateAppNewsArticleInput } from './create-app-news-article.input'

@InputType()
export class UpdateAppNewsArticleInput extends PartialType(CreateAppNewsArticleInput) {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  id: number
}
