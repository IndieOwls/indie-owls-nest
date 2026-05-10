import { InputType, Int, Field } from '@nestjs/graphql'
import { IsInt, IsBoolean, IsEnum, Min } from 'class-validator'
import { ConsentType } from './consent-type.enum'

@InputType()
export class CreateUserConsentInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  userId: number

  @Field(() => ConsentType)
  @IsEnum(ConsentType)
  consentType: ConsentType

  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  granted: boolean
}
