import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'

import { DataRequest, dataRequests } from './entities/data-request.entity'
import { CreateDataRequestInput, UpdateDataRequestInput, DataRequestType } from './dto'

import { LoggerService } from '../../modules/logger'
import { DRIZZLE, type DrizzleDB } from '../../databases'

@Injectable()
export class DataRequestService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly logger: LoggerService,
  ) {}

  async create(input: { userId: number; userEmail: string; type: DataRequestType }) {
    try {
      const [dataRequest] = await this.db.insert(dataRequests).values(input).returning()
      return dataRequest
    } catch (err: any) {
      this.logger.error('Error creating data request:', err)
      throw new InternalServerErrorException('Failed to create data request')
    }
  }

  async findAll() {
    try {
      return await this.db.select().from(dataRequests)
    } catch (err: any) {
      this.logger.error('Error fetching data requests:', err)
      throw new InternalServerErrorException('Failed to fetch data requests')
    }
  }

  async findOne(id: DataRequest['id']) {
    try {
      const [dataRequest] = await this.db.select().from(dataRequests).where(eq(dataRequests.id, id))
      if (!dataRequest) throw new NotFoundException(`Data request ${id} not found`)
      return dataRequest
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err
      this.logger.error(`Error fetching data request with id ${id}:`, err)
      throw new InternalServerErrorException('Failed to fetch data request')
    }
  }

  async update(id: DataRequest['id'], input: UpdateDataRequestInput) {
    try {
      const [dataRequest] = await this.db
        .update(dataRequests)
        .set(input)
        .where(eq(dataRequests.id, id))
        .returning()
      return dataRequest
    } catch (err: any) {
      this.logger.error(`Error updating data request with id ${id}:`, err)
      throw new InternalServerErrorException('Failed to update data request')
    }
  }

  async remove(id: DataRequest['id']) {
    try {
      await this.db.delete(dataRequests).where(eq(dataRequests.id, id))
      return true
    } catch (err: any) {
      this.logger.error(`Error deleting data request with id ${id}:`, err)
      throw new InternalServerErrorException('Failed to delete data request')
    }
  }
}
