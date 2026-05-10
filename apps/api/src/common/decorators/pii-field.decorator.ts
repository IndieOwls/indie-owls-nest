import { Field } from '@nestjs/graphql'
import type { ReturnTypeFunc, FieldOptions } from '@nestjs/graphql'

import { PiiCategory } from '../../compliances/pii/dto/pii-category.enum'
import { PII_REGISTRY } from '../../compliances/pii/dto/pii.registry'
import { PiiGuard } from '../guards/pii-guard'

/**
 * Marks a class property as containing PII of a given category, registers it
 * in the global PII registry, AND applies the PiiGuard middleware so it's
 * automatically masked from unauthorized viewers.
 *
 * Replaces both @PiiField + @Field() for PII-bearing fields:
 *
 *   @PiiField(PiiCategory.EMAIL, () => String)
 *   email?: string | null
 *
 * The PiiGuard middleware and nullable: true are injected automatically —
 * you can't forget either.
 *
 * For additional field options (description, deprecationReason, etc.):
 *
 *   @PiiField(PiiCategory.EMAIL, () => String, { description: 'Verified email' })
 *   email?: string | null
 *
 * Without a return type, the decorator relies on reflect-metadata for type
 * inference (requires emitDecoratorMetadata in tsconfig):
 *
 *   @PiiField(PiiCategory.EMAIL)
 *   email?: string | null
 */
export function PiiField(
  category: PiiCategory,
  returnType?: ReturnTypeFunc,
  options?: FieldOptions,
): PropertyDecorator {
  return (target, propertyKey) => {
    PII_REGISTRY.register(
      target.constructor.name,
      String(propertyKey),
      category,
      target.constructor,
    )

    const merged: FieldOptions = { ...options, nullable: true, middleware: [PiiGuard] }

    if (returnType) {
      Field(returnType, merged)(target, propertyKey)
    } else {
      Field(merged)(target, propertyKey)
    }
  }
}
