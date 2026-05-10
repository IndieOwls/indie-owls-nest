import { AccessBan } from '../entities/access-ban.entity'
import { AlternateBanSource } from './alternate-ban-source.enum'

export type BannedBy = AccessBan['userId'] | AlternateBanSource
