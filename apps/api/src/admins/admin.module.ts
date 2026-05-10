import { Module } from '@nestjs/common'

import { AccessBansModule } from './access-bans/access-bans.module'
import { FeatureFlagsModule } from './feature-flags/feature-flags.module'
import { AppNewsArticlesModule } from './app-news-articles/app-news-articles.module'

@Module({
  imports: [AccessBansModule, FeatureFlagsModule, AppNewsArticlesModule],
  exports: [AccessBansModule, FeatureFlagsModule, AppNewsArticlesModule],
})
export class AdminModule {}
