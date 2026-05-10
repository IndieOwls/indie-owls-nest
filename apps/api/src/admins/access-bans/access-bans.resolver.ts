import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql'

import { AccessBansService } from './access-bans.service'
import { AccessBan } from './entities/access-ban.entity'
import { CreateAccessBanInput, UpdateAccessBanInput } from './dto'

import { LoggerService } from '../../modules/logger'

@Resolver(() => AccessBan)
export class AccessBansResolver {
  constructor(
    private readonly accessBansService: AccessBansService,
    private readonly logger: LoggerService,
  ) {}

  @Mutation(() => AccessBan, { name: 'createAccessBan' })
  create(@Args('createAccessBanInput') createAccessBanInput: CreateAccessBanInput) {
    this.logger.log(
      `Creating access ban for input: ${JSON.stringify(createAccessBanInput)}`,
      'AccessBansResolver.create',
    )
    return this.accessBansService.create(createAccessBanInput)
  }

  @Query(() => [AccessBan], { name: 'accessBans' })
  findAll() {
    this.logger.log('Fetching all access bans', 'AccessBansResolver.findAll')
    return this.accessBansService.findAll()
  }

  @Query(() => AccessBan, { name: 'accessBan' })
  findOne(@Args('userId', { type: () => Int }) id: AccessBan['userId']) {
    this.logger.log(`Fetching access ban for ID: ${id}`, 'AccessBansResolver.findOne')
    return this.accessBansService.findOne(+id)
  }

  @Mutation(() => AccessBan, { name: 'updateAccessBan' })
  update(
    @Args('userId', { type: () => Int }) id: AccessBan['userId'],
    @Args('updateAccessBanInput') updateAccessBanInput: UpdateAccessBanInput,
  ) {
    this.logger.log(`Updating access ban for ID ${id}`, 'AccessBansResolver.update')
    return this.accessBansService.update(+id, updateAccessBanInput)
  }

  @Mutation(() => AccessBan, { name: 'removeAccessBan' })
  remove(@Args('userId', { type: () => Int }) id: AccessBan['userId']) {
    this.logger.log(`Removing access ban for ID ${id}`, 'AccessBansResolver.remove')
    return this.accessBansService.remove(+id)
  }
}
