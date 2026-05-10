import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BullModule } from '@nestjs/bullmq'
import { BullBoardModule } from '@bull-board/nestjs'
import { ExpressAdapter } from '@bull-board/express'

import { QueueService } from './interfaces/queue-service.interface'
import { BullMqQueueService } from './providers/bull-mq-queue.service'

import { EmailWorker } from './workers/email.worker'

import { PATH_PREFIX } from '../../constants'

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host') ?? 'localhost',
          port: config.get<number>('redis.port') ?? 6379,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'email' },
    ),
    BullBoardModule.forRoot({
      route: `/${PATH_PREFIX}/queues`,
      adapter: ExpressAdapter,
    }),
  ],
  providers: [
    { provide: QueueService, useClass: BullMqQueueService },
    EmailWorker,
  ],
  exports: [QueueService],
})
export class QueueModule {}
