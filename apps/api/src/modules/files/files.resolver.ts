import { ObjectType, Field, Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql'

import { User } from '../../users/entities/user.entity'

import { FilesService } from './files.service'
import { File } from './entities/file.entity'

@ObjectType()
class UploadUrl {
  @Field(() => String)
  url: string

  @Field(() => String)
  key: string
}

@Resolver(() => File)
export class FilesResolver {
  constructor(private readonly files: FilesService) {}

  @Query(() => [File], { name: 'myFiles' })
  myFiles() {
    return this.files.findByUser(0)
  }

  @Query(() => File, { name: 'file' })
  findOne(@Args('id', { type: () => ID }) id: number) {
    return this.files.findOne(id)
  }

  @Mutation(() => File, { name: 'uploadFile' })
  async uploadFile(
    @Args('originalName') originalName: string,
    @Args('mimeType') mimeType: string,
    @Args('folder') folder: string,
    @Args('base64', { type: () => String }) base64: string,
    @Args('organizationId', { type: () => Int, nullable: true }) organizationId?: number,
  ): Promise<File> {
    const buffer = Buffer.from(base64, 'base64')
    return this.files.upload(0, buffer, originalName, mimeType, folder, organizationId)
  }

  @Mutation(() => Boolean, { name: 'deleteFile' })
  async deleteFile(@Args('id', { type: () => ID }) id: number): Promise<boolean> {
    return this.files.delete(id, 0)
  }

  @Mutation(() => UploadUrl, { name: 'requestUploadUrl' })
  async requestUploadUrl(
    @Args('originalName') originalName: string,
    @Args('mimeType') mimeType: string,
    @Args('folder') folder: string,
  ): Promise<UploadUrl> {
    const result = await this.files.getSignedUploadUrl(originalName, mimeType, folder)
    return { url: result.url, key: result.key }
  }

  @Mutation(() => File, { name: 'confirmUpload' })
  async confirmUpload(
    @Args('originalName') originalName: string,
    @Args('mimeType') mimeType: string,
    @Args('folder') folder: string,
    @Args('key') key: string,
    @Args('size', { type: () => Int }) size: number,
    @Args('organizationId', { type: () => Int, nullable: true }) organizationId?: number,
  ): Promise<File> {
    return this.files.confirmUpload(0, key, originalName, mimeType, folder, organizationId, size)
  }
}
