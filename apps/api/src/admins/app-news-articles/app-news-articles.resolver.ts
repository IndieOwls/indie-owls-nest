import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'

import { AppNewsArticlesService } from './app-news-articles.service'
import { AppNewsArticle } from './entities/app-news-article.entity'
import { CreateAppNewsArticleInput, UpdateAppNewsArticleInput } from './dto'

import { LoggerService } from '../../modules/logger'

@Resolver(() => AppNewsArticle)
export class AppNewsArticlesResolver {
  constructor(
    private readonly service: AppNewsArticlesService,
    private readonly logger: LoggerService,
  ) {}

  @Mutation(() => AppNewsArticle, { name: 'createAppNewsArticle' })
  createAppNewsArticle(
    @Args('createAppNewsArticleInput') createAppNewsArticleInput: CreateAppNewsArticleInput,
  ) {
    this.logger.log(
      `Creating app news article with input: ${JSON.stringify(createAppNewsArticleInput)}`,
      'AppNewsArticlesResolver.createAppNewsArticle',
    )
    return this.service.create(createAppNewsArticleInput)
  }

  @Query(() => [AppNewsArticle], { name: 'appNewsArticles' })
  findAll() {
    this.logger.log('Fetching all app news articles', 'AppNewsArticlesResolver.findAll')
    return this.service.findAll()
  }

  @Query(() => [AppNewsArticle], { name: 'publishedAppNewsArticles' })
  findPublished() {
    this.logger.log(
      'Fetching all published app news articles',
      'AppNewsArticlesResolver.findPublished',
    )
    return this.service.findPublished()
  }

  @Query(() => AppNewsArticle, { name: 'appNewsArticle' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    this.logger.log(`Fetching app news article with ID: ${id}`, 'AppNewsArticlesResolver.findOne')
    return this.service.findOne(id)
  }

  @Mutation(() => AppNewsArticle, { name: 'updateAppNewsArticle' })
  updateAppNewsArticle(
    @Args('updateAppNewsArticleInput') updateAppNewsArticleInput: UpdateAppNewsArticleInput,
  ) {
    this.logger.log(
      `Updating app news article with ID: ${updateAppNewsArticleInput.id}`,
      'AppNewsArticlesResolver.updateAppNewsArticle',
    )
    return this.service.update(updateAppNewsArticleInput.id, updateAppNewsArticleInput)
  }

  @Mutation(() => AppNewsArticle, { name: 'removeAppNewsArticle' })
  removeAppNewsArticle(@Args('id', { type: () => Int }) id: number) {
    this.logger.log(
      `Removing app news article with ID: ${id}`,
      'AppNewsArticlesResolver.removeAppNewsArticle',
    )
    return this.service.remove(id)
  }
}
