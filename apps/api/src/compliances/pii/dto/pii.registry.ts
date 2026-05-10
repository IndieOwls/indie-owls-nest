import { Logger } from '@nestjs/common'
import { TypeMetadataStorage } from '@nestjs/graphql'

import { PiiCategory } from './pii-category.enum'

export type PiiFieldEntry = {
  category: PiiCategory
  target: Function
}

/**
 * Module-level singleton registry of PII-tagged entity fields.
 *
 * The PiiGuard (a plain function — no DI available for field middleware)
 * imports this directly to look up whether a given GraphQL parent-type + field
 * is classified as PII and should be gated.
 */
class PiiRegistry {
  private map = new Map<string, Map<string, PiiFieldEntry>>()

  register(
    entityName: string,
    fieldName: string,
    category: PiiCategory,
    target: Function = Object,
  ): void {
    let entityFields = this.map.get(entityName)
    if (!entityFields) {
      entityFields = new Map()
      this.map.set(entityName, entityFields)
    }
    entityFields.set(fieldName, { category, target })
  }

  get(entityName: string, fieldName: string): PiiFieldEntry | undefined {
    return this.map.get(entityName)?.get(fieldName)
  }

  /** All PII fields registered for a given entity. */
  getEntityFields(entityName: string): Map<string, PiiFieldEntry> {
    return new Map(this.map.get(entityName) ?? [])
  }

  /** Every registered PII field across all entities. */
  entries(): [entityName: string, fieldName: string, entry: PiiFieldEntry][] {
    const result: [string, string, PiiFieldEntry][] = []
    for (const [entity, fields] of this.map) {
      for (const [field, entry] of fields) {
        result.push([entity, field, entry])
      }
    }
    return result
  }

  /**
   * Validates all registered PII fields at startup. Checks that each field
   * exists on its entity class and has nullable: true in its GraphQL metadata.
   * The @PiiField decorator forces nullable: true, but this catches cases
   * where the registry is manipulated directly.
   */
  validate(): void {
    const logger = new Logger('PiiRegistry')
    for (const [entityName, fieldName, entry] of this.entries()) {
      const { target } = entry
      // Skip manually registered entries without a real GraphQL entity class
      if (target === Object) continue
      const prototype = target.prototype
      const targetType = target as { new (...args: any[]): unknown }

      // Verify the property exists on the class prototype
      const type = Reflect.getMetadata('design:type', prototype, fieldName)
      if (!type) {
        logger.warn(
          `${entityName}.${fieldName} is registered as PII but the property does not exist on the class or has no design-time type`,
        )
        continue
      }

      // Check GraphQL field metadata for nullable: true
      try {
        const objTypeMeta = TypeMetadataStorage.getObjectTypeMetadataByTarget(targetType)
        const prop = objTypeMeta?.properties?.find((p) => p.name === fieldName)
        if (prop && !prop.options?.nullable) {
          logger.warn(
            `${entityName}.${fieldName} is registered as PII but is NOT nullable — PiiGuard will return null at runtime and GraphQL will error`,
          )
        }
      } catch {
        // TypeMetadataStorage may not be compiled yet — skip silently
      }
    }
  }
}

export const PII_REGISTRY = new PiiRegistry()
