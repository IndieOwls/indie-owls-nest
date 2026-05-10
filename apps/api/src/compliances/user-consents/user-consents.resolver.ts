import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'

import { UserConsentsService } from './user-consents.service'

import { UserConsent } from './entities/user-consent.entity'
import { CreateUserConsentInput, UpdateUserConsentInput } from './dto'

@Resolver(() => UserConsent)
export class UserConsentsResolver {
  constructor(private readonly service: UserConsentsService) {}

  @Mutation(() => UserConsent)
  createUserConsent(
    @Args('createUserConsentInput') createUserConsentInput: CreateUserConsentInput,
  ) {
    return this.service.create(createUserConsentInput)
  }

  @Query(() => [UserConsent], { name: 'userConsents' })
  findAll() {
    return this.service.findAll()
  }

  @Query(() => UserConsent, { name: 'userConsent' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.service.findOne(id)
  }

  @Mutation(() => UserConsent)
  updateUserConsent(
    @Args('updateUserConsentInput') updateUserConsentInput: UpdateUserConsentInput,
  ) {
    return this.service.update(updateUserConsentInput.id, updateUserConsentInput)
  }

  @Mutation(() => UserConsent)
  removeUserConsent(@Args('id', { type: () => Int }) id: number) {
    return this.service.remove(id)
  }
}
