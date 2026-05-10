import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'

import { CreateNotificationInput, UpdateNotificationInput } from './dto'

import { LoggerService } from '../../modules/logger'
import { DRIZZLE, type DrizzleDB } from '../../databases'
import { Notification, notifications } from './entities/notification.entity'

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly logger: LoggerService,
  ) {}

  async create(createNotificationInput: CreateNotificationInput): Promise<Notification> {
    try {
      const [notification] = await this.db
        .insert(notifications)
        .values(createNotificationInput)
        .returning()

      return notification
    } catch (err: any) {
      this.logger.error('Error creating notification:', err)
      throw new InternalServerErrorException('Unable to create notification')
    }
  }

  async findAll(): Promise<Notification[]> {
    try {
      return await this.db.select().from(notifications)
    } catch (err: any) {
      this.logger.error('Error fetching notifications:', err)
      throw new InternalServerErrorException('Unable to fetch notifications')
    }
  }

  async findOne(id: Notification['id']): Promise<Notification> {
    try {
      const [notification] = await this.db
        .select()
        .from(notifications)
        .where(eq(notifications.id, id))
        .limit(1)

      if (!notification) {
        throw new NotFoundException(`Notification ${id} not found`)
      }

      return notification
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err
      this.logger.error(`Error fetching notification with ID ${id}:`, err)
      throw new InternalServerErrorException('Unable to fetch notification')
    }
  }

  async update(
    id: Notification['id'],
    updateNotificationInput: UpdateNotificationInput,
  ): Promise<Notification> {
    try {
      const [notification] = await this.db
        .update(notifications)
        .set(updateNotificationInput)
        .where(eq(notifications.id, id))
        .returning()

      if (!notification) {
        throw new NotFoundException(`Notification ${id} not found`)
      }

      return notification
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err
      this.logger.error(`Error updating notification with ID ${id}:`, err)
      throw new InternalServerErrorException('Unable to update notification')
    }
  }

  async remove(id: Notification['id']): Promise<Notification> {
    try {
      const [notification] = await this.db
        .delete(notifications)
        .where(eq(notifications.id, id))
        .returning()

      if (!notification) {
        throw new NotFoundException(`Notification ${id} not found`)
      }

      return notification
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err
      this.logger.error(`Error deleting notification with ID ${id}:`, err)
      throw new InternalServerErrorException('Unable to delete notification')
    }
  }
}
