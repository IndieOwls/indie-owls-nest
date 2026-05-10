import { join } from 'path'
import { TAG_V1 } from './configs/main.config'

export const WEB_CLIENT = join(process.cwd(), '../../apps/web/dist')
export const ADMIN_CLIENT = join(process.cwd(), '../../apps/admin/dist')

export const PATH_PREFIX = `api/${TAG_V1}`

export const API_GRAPHQL = `${PATH_PREFIX}/graphql`
export const API_ADMIN = `${PATH_PREFIX}/admin`
export const API_BILLING_WEBHOOK = `${PATH_PREFIX}/billing/webhook`
export const API_MAINTENANCE = `${PATH_PREFIX}/maintenance`

export const THROTTLE_LIMIT = 60
export const THROTTLE_TTL = 60_000

export const ERR_CODE_UNIQUE = '23505'
