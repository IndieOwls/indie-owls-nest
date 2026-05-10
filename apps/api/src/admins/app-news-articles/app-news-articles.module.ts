import { Module } from '@nestjs/common'

import { AppNewsArticlesResolver } from './app-news-articles.resolver'
import { AppNewsArticlesService } from './app-news-articles.service'

@Module({
  providers: [AppNewsArticlesResolver, AppNewsArticlesService],
  exports: [AppNewsArticlesService],
})
export class AppNewsArticlesModule {}
