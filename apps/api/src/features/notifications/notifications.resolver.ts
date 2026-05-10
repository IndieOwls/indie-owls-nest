import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'

import { NotificationsService } from './notifications.service'
import { Notification } from './entities/notification.entity'
import { CreateNotificationInput, UpdateNotificationInput } from './dto'

import { LoggerService } from '../../modules/logger'

@Resolver(() => Notification)
export class NotificationsResolver {
  constructor(
    private readonly service: NotificationsService,
    private readonly logger: LoggerService,
  ) {}

  @Mutation(() => Notification)
  createNotification(
    @Args('createNotificationInput') createNotificationInput: CreateNotificationInput,
  ) {
    this.logger.log(
      `Creating notification with input: ${JSON.stringify(createNotificationInput)}`,
      'NotificationsResolver.createNotification',
    )
    return this.service.create(createNotificationInput)
  }

  @Query(() => [Notification], { name: 'notifications' })
  findAll() {
    this.logger.log('Fetching all notifications', 'NotificationsResolver.findAll')
    return this.service.findAll()
  }

  @Query(() => Notification, { name: 'notification' })
  findOne(@Args('id', { type: () => Int }) id: Notification['id']) {
    this.logger.log(`Fetching notification with id: ${id}`, 'NotificationsResolver.findOne')
    return this.service.findOne(id)
  }

  @Mutation(() => Notification)
  updateNotification(
    @Args('updateNotificationInput') updateNotificationInput: UpdateNotificationInput,
  ) {
    this.logger.log(
      `Updating notification with input: ${JSON.stringify(updateNotificationInput)}`,
      'NotificationsResolver.updateNotification',
    )
    return this.service.update(updateNotificationInput.id, updateNotificationInput)
  }

  @Mutation(() => Notification)
  removeNotification(@Args('id', { type: () => Int }) id: Notification['id']) {
    this.logger.log(`Removing notification with id: ${id}`, 'NotificationsResolver.removeNotification')
    return this.service.remove(id)
  }
}
