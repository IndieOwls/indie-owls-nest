import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql'

import { LoggerService } from '../modules/logger/services/logger.service'
import { UsersService } from './users.service'
import { User } from './entities/user.entity'

import { CreateUserInput, UpdateUserInput } from './dto'

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: LoggerService,
  ) {}

  @Mutation(() => User, { name: 'createUser' })
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    this.logger.log(
      `[Users.createUser] Creating user with input: ${JSON.stringify(createUserInput)}`,
    )
    return this.usersService.create(createUserInput)
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => ID }) id: User['id']) {
    this.logger.log(`[Users.findOne] Fetching user with ID: ${id}`)
    return this.usersService.findOne(id)
  }

  @Query(() => [User], { name: 'users' })
  findAll() {
    this.logger.log(`[Users.findAll] Fetching all users`)
    return this.usersService.findAll()
  }

  @Mutation(() => User, { name: 'updateUser' })
  updateUser(@Args('input') input: UpdateUserInput) {
    this.logger.log(`[Users.updateUser] Updating user with input: ${JSON.stringify(input)}`)
    return this.usersService.update(input)
  }

  @Mutation(() => User, { name: 'removeUser' })
  removeUser(@Args('id', { type: () => ID }) id: User['id']) {
    this.logger.log(`[Users.removeUser] Soft-deleting user with ID: ${id}`)
    return this.usersService.softDelete(id)
  }

  @Mutation(() => User, { name: 'restoreUser' })
  restoreUser(@Args('id', { type: () => ID }) id: User['id']) {
    this.logger.log(`[Users.restoreUser] Restoring user with ID: ${id}`)
    return this.usersService.restore(id)
  }
}
