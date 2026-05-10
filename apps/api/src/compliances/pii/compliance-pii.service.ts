import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { eq } from 'drizzle-orm'

import { DRIZZLE, type DrizzleDB } from '../../databases'
import { users, dataRequests } from '../../databases/schema'
import { PII_REGISTRY } from './dto/pii.registry'
import { PiiReport, EntityPiiGroup, PiiFieldValue } from './dto/pii-report.type'
import { PiiCategory } from './dto/pii-category.enum'

@Injectable()
export class CompliancePiiService implements OnModuleInit {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  onModuleInit() {
    PII_REGISTRY.validate()
  }

  async collectPii(userId: number): Promise<PiiReport> {
    const [user] = (await this.db.select().from(users).where(eq(users.id, userId)).limit(1)) ?? []

    const consolidated = this.extractPii('User', user ?? {})

    const records: EntityPiiGroup[] = []

    const dataRequestRows = await this.db
      .select()
      .from(dataRequests)
      .where(eq(dataRequests.userId, userId))
    if (dataRequestRows.length > 0) {
      const fields = dataRequestRows.flatMap((r) => this.extractPii('DataRequest', r))
      if (fields.length > 0) {
        records.push({
          entity: 'DataRequest',
          description: 'Data privacy requests filed by the user',
          fields,
        })
      }
    }

    return { userId, consolidated, records }
  }

  async anonymizePii(userId: number): Promise<PiiReport> {
    const report = await this.collectPii(userId)

    const userPiiFields = PII_REGISTRY.getEntityFields('User')
    if (userPiiFields.size > 0) {
      const setValues: Record<string, null> = {}
      for (const [field] of userPiiFields) {
        setValues[field] = null
      }
      await this.db.update(users).set(setValues).where(eq(users.id, userId))
    }

    const dataRequestPiiFields = PII_REGISTRY.getEntityFields('DataRequest')
    if (dataRequestPiiFields.size > 0) {
      const setValues: Record<string, null> = {}
      for (const [field] of dataRequestPiiFields) {
        setValues[field] = null
      }
      await this.db.update(dataRequests).set(setValues).where(eq(dataRequests.userId, userId))
    }

    await this.db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, userId))

    return report
  }

  private extractPii(entityName: string, row: Record<string, any>): PiiFieldValue[] {
    const fields = PII_REGISTRY.getEntityFields(entityName)
    const result: PiiFieldValue[] = []
    for (const [fieldName, entry] of fields) {
      if (row[fieldName] != null) {
        result.push({
          fieldName,
          category: entry.category,
          value: String(row[fieldName]),
        })
      }
    }
    return result
  }
}
