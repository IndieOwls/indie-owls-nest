import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { DatabaseModule } from '../../databases/database.module'
import { LoggerModule } from '../logger/logger.module'

import { StorageService } from './interfaces/storage-service.interface'
import { LocalStorageService } from './providers/local-storage.service'
import { S3StorageService } from './providers/s3-storage.service'
import { ImageService } from './image.service'
import { FilesService } from './files.service'
import { FilesResolver } from './files.resolver'

@Module({
  imports: [ConfigModule, DatabaseModule, LoggerModule],
  providers: [
    {
      provide: StorageService,
      useFactory: (config: ConfigService) => {
        const driver = config.get<string>('storage.driver')
        return driver === 's3' ? new S3StorageService(config) : new LocalStorageService(config)
      },
      inject: [ConfigService],
    },
    ImageService,
    FilesService,
    FilesResolver,
  ],
  exports: [FilesService, StorageService, ImageService],
})
export class FilesModule {}
