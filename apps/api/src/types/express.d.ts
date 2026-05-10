import { Organization } from '../modules/organizations/entities/organization.entity'
import { User } from '../users/entities/user.entity'

declare global {
  namespace Express {
    interface Request {
      user?: User
      organization?: Organization
      apiKey?: string
    }
  }
}
