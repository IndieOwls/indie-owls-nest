import { NotFoundException } from '@nestjs/common'
import { Resolver, Mutation, Args, ID, Query } from '@nestjs/graphql'

import { DataRequestService } from './data-request.service'
import { DataRequest } from './entities/data-request.entity'
import {
  CreateDataRequestInput,
  UpdateDataRequestInput,
  DataRequestType,
  DataRequestStatus,
} from './dto'

import { CompliancePiiService, PiiReport } from '../pii'

@Resolver()
export class DataRequestResolver {
  constructor(
    private readonly service: DataRequestService,
    private readonly compliance: CompliancePiiService,
  ) {}

  @Mutation(() => DataRequest, { name: 'createDataRequest' })
  async createDataRequest(@Args('input') input: CreateDataRequestInput) {
    return this.service.create({
      userId: input.userId ?? 0,
      userEmail: input.userEmail ?? '',
      type: input.type,
    })
  }

  @Query(() => [DataRequest], { name: 'dataRequests' })
  findAll() {
    return this.service.findAll()
  }

  @Query(() => DataRequest, { name: 'dataRequest' })
  findOne(@Args('id', { type: () => ID }) id: DataRequest['id']) {
    return this.service.findOne(id)
  }

  @Mutation(() => DataRequest, { name: 'updateDataRequest' })
  updateDataRequest(
    @Args('id', { type: () => ID }) id: DataRequest['id'],
    @Args('input') input: UpdateDataRequestInput,
  ) {
    return this.service.update(id, input)
  }

  @Mutation(() => Boolean, { name: 'deleteDataRequest' })
  deleteDataRequest(@Args('id', { type: () => ID }) id: DataRequest['id']) {
    return this.service.remove(id)
  }

  @Mutation(() => PiiReport, { name: 'fulfillDataRequest' })
  async fulfillDataRequest(@Args('id', { type: () => ID }) id: number) {
    const req = await this.service.findOne(id)
    if (!req) {
      throw new NotFoundException(`Data request ${id} not found`)
    }
    if (!req.userId) {
      throw new NotFoundException('Data request has no associated user — cannot fulfill')
    }

    const report =
      req.type === DataRequestType.DELETION
        ? await this.compliance.anonymizePii(req.userId)
        : await this.compliance.collectPii(req.userId)

    await this.service.update(req.id, { id: req.id, status: DataRequestStatus.COMPLETED })
    return report
  }
}
