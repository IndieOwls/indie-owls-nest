import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql'

import { User } from '../../users/entities/user.entity'

import { OrganizationsService } from './organizations.service'
import { Organization } from './entities/organization.entity'
import { OrganizationMember } from './entities/organization-member.entity'
import { CreateOrganizationInput, UpdateOrganizationInput } from './dto'

@Resolver(() => Organization)
export class OrganizationsResolver {
  constructor(private readonly service: OrganizationsService) {}

  @Mutation(() => Organization)
  async createOrganization(
    @Args('input') input: CreateOrganizationInput,
  ) {
    return this.service.create(0, input) // userId placeholder — auth TBD
  }

  @Query(() => [Organization], { name: 'organizations' })
  getMyOrganizations() {
    return this.service.getMyOrganizations(0) // userId placeholder — auth TBD
  }

  @Query(() => Organization, { name: 'organization' })
  async getOrganization(@Args('slug', { type: () => String }) slug: string) {
    return this.service.findBySlug(slug)
  }

  @Query(() => [OrganizationMember], { name: 'organizationMembers' })
  async getOrganizationMembers(
    @Args('slug', { type: () => String }) slug: string,
  ) {
    const org = await this.service.findBySlug(slug)
    return this.service.getMembers(org.id)
  }

  @Mutation(() => Organization)
  updateOrganization(@Args('input') input: UpdateOrganizationInput) {
    return this.service.update(input.id, input)
  }

  @Mutation(() => Boolean)
  deleteOrganization(@Args('id', { type: () => ID }) id: number) {
    return this.service.remove(id)
  }
}
