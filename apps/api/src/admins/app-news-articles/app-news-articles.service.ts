import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { and, eq, isNull } from 'drizzle-orm'

import { CreateAppNewsArticleInput, UpdateAppNewsArticleInput } from './dto'

import { LoggerService } from '../../modules/logger'
import { DRIZZLE, type DrizzleDB } from '../../databases'
import { AppNewsArticle, appNewsArticles } from './entities/app-news-article.entity'

@Injectable()
export class AppNewsArticlesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly logger: LoggerService,
  ) {}

  async create(createAppNewsArticleInput: CreateAppNewsArticleInput) {
    try {
      const [article] = await this.db
        .insert(appNewsArticles)
        .values(createAppNewsArticleInput)
        .returning()
      return article
    } catch (err: any) {
      this.logger.error('Error creating app news article:', err)
      throw new InternalServerErrorException('Unable to create app news article')
    }
  }

  async findAll() {
    try {
      const articles = await this.db.select().from(appNewsArticles)
      return articles
    } catch (err: any) {
      this.logger.error('Error fetching app news articles:', err)
      throw new InternalServerErrorException('Unable to fetch app news articles')
    }
  }

  async findPublished() {
    try {
      const articles = await this.db
        .select()
        .from(appNewsArticles)
        .where(and(eq(appNewsArticles.isPublished, true), isNull(appNewsArticles.deletedAt)))
      return articles
    } catch (err: any) {
      this.logger.error('Error fetching published app news articles:', err)
      throw new InternalServerErrorException('Unable to fetch published app news articles')
    }
  }

  async findOne(id: AppNewsArticle['id']) {
    try {
      const [article] = await this.db
        .select()
        .from(appNewsArticles)
        .where(and(eq(appNewsArticles.id, id), isNull(appNewsArticles.deletedAt)))
        .limit(1)
      if (!article) {
        throw new NotFoundException(`App news article with ID ${id} not found`)
      }
      return article
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err
      this.logger.error(`Error fetching app news article with ID ${id}:`, err)
      throw new InternalServerErrorException('Unable to fetch app news article')
    }
  }

  async update(id: AppNewsArticle['id'], updateAppNewsArticleInput: UpdateAppNewsArticleInput) {
    try {
      const [article] = await this.db
        .update(appNewsArticles)
        .set(updateAppNewsArticleInput)
        .where(and(eq(appNewsArticles.id, id), isNull(appNewsArticles.deletedAt)))
        .returning()
      if (!article) {
        throw new NotFoundException(`App news article with ID ${id} not found`)
      }
      return article
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err
      this.logger.error(`Error updating app news article with ID ${id}:`, err)
      throw new InternalServerErrorException('Unable to update app news article')
    }
  }

  async remove(id: AppNewsArticle['id']) {
    try {
      const [article] = await this.db
        .update(appNewsArticles)
        .set({ deletedAt: new Date() })
        .where(and(eq(appNewsArticles.id, id), isNull(appNewsArticles.deletedAt)))
        .returning()
      if (!article) {
        throw new NotFoundException(`App news article with ID ${id} not found`)
      }
      return article
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err
      this.logger.error(`Error removing app news article with ID ${id}:`, err)
      throw new InternalServerErrorException('Unable to remove app news article')
    }
  }
}
