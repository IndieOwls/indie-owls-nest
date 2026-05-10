import { Test, TestingModule } from '@nestjs/testing'
import { OrganizationsService } from './organizations.service'
import { DRIZZLE } from '../../databases'
import { LoggerService } from '../logger'

describe('OrganizationsService', () => {
  let service: OrganizationsService
  let mockDb: any

  const mockOrg = { id: 1, name: 'Test Org', slug: 'test-org', createdAt: new Date(), updatedAt: new Date() }
  const mockMember = { organizationId: 1, userId: 1, role: 'OWNER', joinedAt: new Date() }

  beforeEach(async () => {
    mockDb = {}
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: LoggerService, useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() } },
      ],
    }).compile()

    service = module.get<OrganizationsService>(OrganizationsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create an org with the creator as OWNER in a transaction', async () => {
      const txReturn = {
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockOrg]),
        }),
      }

      mockDb.transaction = jest.fn().mockImplementation(async (cb: any) => {
        const tx = { insert: jest.fn().mockReturnValue(txReturn) }
        return cb(tx)
      })

      const result = await service.create(1, { name: 'Test Org' })
      expect(result).toEqual(mockOrg)
      expect(mockDb.transaction).toHaveBeenCalled()
    })
  })

  describe('findById', () => {
    it('should return the org when found', async () => {
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockOrg]),
          }),
        }),
      })

      const result = await service.findById(1)
      expect(result).toEqual(mockOrg)
    })

    it('should throw when not found', async () => {
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      })

      await expect(service.findById(999)).rejects.toThrow()
    })
  })

  describe('findBySlug', () => {
    it('should return the org when found', async () => {
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockOrg]),
          }),
        }),
      })

      const result = await service.findBySlug('test-org')
      expect(result).toEqual(mockOrg)
    })
  })

  describe('getMyOrganizations', () => {
    it('should return orgs the user belongs to', async () => {
      const membershipRows = [
        { organizationId: 1 },
        { organizationId: 2 },
      ]
      const orgRows = [
        mockOrg,
        { id: 2, name: 'Other Org', slug: 'other-org', createdAt: new Date(), updatedAt: new Date() },
      ]

      let queryStage = 0
      mockDb.select = jest.fn().mockImplementation(() => ({
        from: jest.fn().mockImplementation(() => ({
          where: jest.fn().mockImplementation(() => {
            queryStage++
            if (queryStage === 1) return Promise.resolve(membershipRows)
            return Promise.resolve(orgRows)
          }),
        })),
      }))

      const result = await service.getMyOrganizations(1)
      expect(result).toHaveLength(2)
    })
  })

  describe('getMembers', () => {
    it('should return members with usernames', async () => {
      const rows = [{ organizationId: 1, userId: 1, role: 'OWNER', joinedAt: new Date(), username: 'alice' }]
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(rows),
          }),
        }),
      })

      const result = await service.getMembers(1)
      expect(result).toHaveLength(1)
      expect(result[0].username).toBe('alice')
    })
  })

  describe('addMember', () => {
    it('should insert a membership', async () => {
      mockDb.insert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockMember]),
        }),
      })

      const result = await service.addMember(1, 2)
      expect(result).toEqual(mockMember)
    })
  })

  describe('remove', () => {
    it('should delete the org and return true', async () => {
      mockDb.delete = jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(true),
      })

      const result = await service.remove(1)
      expect(result).toBe(true)
    })
  })
})
