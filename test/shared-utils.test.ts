/**
 * Shared Utilities Unit Tests
 *
 * src/runtime/server/utils/mock/shared.ts 유틸리티 함수 테스트
 */
import { describe, it, expect } from 'vitest'

describe('Shared Utilities', () => {
  describe('hashString', () => {
    let hashString: (str: string) => number

    it('should import hashString', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      hashString = shared.hashString
      expect(hashString).toBeDefined()
    })

    it('should return consistent hash for same input', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      hashString = shared.hashString

      const hash1 = hashString('test-string')
      const hash2 = hashString('test-string')

      expect(hash1).toBe(hash2)
    })

    it('should return different hash for different input', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      hashString = shared.hashString

      const hash1 = hashString('string-a')
      const hash2 = hashString('string-b')

      expect(hash1).not.toBe(hash2)
    })

    it('should handle empty string', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      hashString = shared.hashString

      const hash = hashString('')
      expect(typeof hash).toBe('number')
    })

    it('should handle unicode strings', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      hashString = shared.hashString

      const hash1 = hashString('한글 테스트')
      const hash2 = hashString('한글 테스트')

      expect(hash1).toBe(hash2)
    })

    it('should handle very long strings', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      hashString = shared.hashString

      const longString = 'a'.repeat(10000)
      const hash = hashString(longString)

      expect(typeof hash).toBe('number')
      expect(Number.isFinite(hash)).toBe(true)
    })
  })

  describe('SeededRandom', () => {
    it('should generate consistent sequence for same seed', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      const { SeededRandom } = shared

      const rng1 = new SeededRandom('test-seed')
      const rng2 = new SeededRandom('test-seed')

      const sequence1 = [rng1.next(), rng1.next(), rng1.next()]
      const sequence2 = [rng2.next(), rng2.next(), rng2.next()]

      expect(sequence1).toEqual(sequence2)
    })

    it('should generate different sequence for different seed', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      const { SeededRandom } = shared

      const rng1 = new SeededRandom('seed-a')
      const rng2 = new SeededRandom('seed-b')

      const value1 = rng1.next()
      const value2 = rng2.next()

      expect(value1).not.toBe(value2)
    })

    it('should generate values between 0 and 1', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      const { SeededRandom } = shared

      const rng = new SeededRandom('distribution-test')

      for (let i = 0; i < 100; i++) {
        const value = rng.next()
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(1)
      }
    })

    it('should generate integers in range with nextInt', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      const { SeededRandom } = shared

      const rng = new SeededRandom('int-test')

      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(10, 20)
        expect(value).toBeGreaterThanOrEqual(10)
        expect(value).toBeLessThanOrEqual(20)
        expect(Number.isInteger(value)).toBe(true)
      }
    })

    it('should pick items consistently with pick', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      const { SeededRandom } = shared

      const items = ['a', 'b', 'c', 'd', 'e']

      const rng1 = new SeededRandom('pick-test')
      const rng2 = new SeededRandom('pick-test')

      const picked1 = [rng1.pick(items), rng1.pick(items), rng1.pick(items)]
      const picked2 = [rng2.pick(items), rng2.pick(items), rng2.pick(items)]

      expect(picked1).toEqual(picked2)
    })

    it('should handle boolean generation with chance', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      const { SeededRandom } = shared

      const rng = new SeededRandom('bool-test')

      let trueCount = 0
      let falseCount = 0

      for (let i = 0; i < 100; i++) {
        if (rng.chance(0.5)) {
          trueCount++
        }
        else {
          falseCount++
        }
      }

      // Should have some of both (very unlikely to be all one value)
      expect(trueCount).toBeGreaterThan(0)
      expect(falseCount).toBeGreaterThan(0)
    })
  })

  describe('generateId', () => {
    it('should generate unique IDs for different seeds', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      const { generateId } = shared

      const ids = new Set<string>()
      for (let i = 0; i < 100; i++) {
        ids.add(generateId('test', `seed-${i}`))
      }

      expect(ids.size).toBe(100)
    })

    it('should generate consistent ID for same seed', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      const { generateId } = shared

      const id1 = generateId('user', 'same-seed')
      const id2 = generateId('user', 'same-seed')

      expect(id1).toBe(id2)
    })

    it('should include prefix in generated ID', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      const { generateId } = shared

      const id = generateId('user', 'test-seed')

      expect(id).toMatch(/^user-/)
    })
  })

  describe('generateSnapshotId', () => {
    it('should generate snapshot ID with correct format', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      const { generateSnapshotId } = shared

      const id = generateSnapshotId()

      // Format: snap-{timestamp_base36}-{random_base36}
      expect(id).toMatch(/^snap-[a-z0-9]+-[a-z0-9]+$/)
    })

    it('should generate unique IDs on each call', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      const { generateSnapshotId } = shared

      const ids = new Set<string>()
      for (let i = 0; i < 10; i++) {
        ids.add(generateSnapshotId())
      }

      // Each call should generate unique ID (non-deterministic by design)
      expect(ids.size).toBe(10)
    })
  })

  describe('generateIdValue', () => {
    it('should generate consistent ID for same params', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      const { generateIdValue } = shared

      // generateIdValue(fieldName, index, seed)
      const id1 = generateIdValue('id', 0, 'test-seed')
      const id2 = generateIdValue('id', 0, 'test-seed')

      expect(id1).toBe(id2)
    })

    it('should generate different ID for different index', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      const { generateIdValue } = shared

      const id1 = generateIdValue('id', 0, 'test-seed')
      const id2 = generateIdValue('id', 1, 'test-seed')

      expect(id1).not.toBe(id2)
    })

    it('should generate different ID for different seed', async () => {
      const shared = await import('../src/runtime/server/utils/mock/shared')
      const { generateIdValue } = shared

      const id1 = generateIdValue('id', 0, 'seed-a')
      const id2 = generateIdValue('id', 0, 'seed-b')

      expect(id1).not.toBe(id2)
    })
  })
})

describe('Pagination Edge Cases', () => {
  describe('Page Pagination', () => {
    let PagePaginationManager: typeof import('../src/runtime/server/utils/mock/pagination').PagePaginationManager
    let SchemaMockGenerator: typeof import('../src/runtime/server/utils/mock/client-generator').SchemaMockGenerator
    let resetSnapshotStore: typeof import('../src/runtime/server/utils/mock/pagination').resetSnapshotStore

    const setupModules = async () => {
      const pagination = await import('../src/runtime/server/utils/mock/pagination')
      const client = await import('../src/runtime/server/utils/mock/client-generator')

      PagePaginationManager = pagination.PagePaginationManager
      resetSnapshotStore = pagination.resetSnapshotStore
      SchemaMockGenerator = client.SchemaMockGenerator

      resetSnapshotStore()
    }

    it('should handle empty result (total = 0)', async () => {
      await setupModules()

      const models = new Map()
      models.set('EmptyModel', {
        name: 'EmptyModel',
        fields: [{ name: 'id', type: 'string', required: true, isArray: false }],
      })

      const generator = new SchemaMockGenerator(models)
      const pageManager = new PagePaginationManager(generator)

      const result = pageManager.getPagedResponse('EmptyModel', {
        page: 1,
        limit: 10,
        total: 0,
        seed: 'empty-test',
      })

      expect(result.items).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
      expect(result.pagination.totalPages).toBe(0)
    })

    it('should handle last page with partial items', async () => {
      await setupModules()

      const models = new Map()
      models.set('PartialModel', {
        name: 'PartialModel',
        fields: [{ name: 'id', type: 'string', required: true, isArray: false }],
      })

      const generator = new SchemaMockGenerator(models)
      const pageManager = new PagePaginationManager(generator)

      // Total 25, limit 10 -> page 3 should have 5 items
      const result = pageManager.getPagedResponse('PartialModel', {
        page: 3,
        limit: 10,
        total: 25,
        seed: 'partial-test',
      })

      expect(result.items).toHaveLength(5)
      expect(result.pagination.page).toBe(3)
      expect(result.pagination.totalPages).toBe(3)
    })

    it('should handle page beyond total (return empty)', async () => {
      await setupModules()

      const models = new Map()
      models.set('BeyondModel', {
        name: 'BeyondModel',
        fields: [{ name: 'id', type: 'string', required: true, isArray: false }],
      })

      const generator = new SchemaMockGenerator(models)
      const pageManager = new PagePaginationManager(generator)

      // Total 20, limit 10 -> page 5 should have 0 items
      const result = pageManager.getPagedResponse('BeyondModel', {
        page: 5,
        limit: 10,
        total: 20,
        seed: 'beyond-test',
      })

      expect(result.items).toHaveLength(0)
    })

    it('should handle limit = 1', async () => {
      await setupModules()

      const models = new Map()
      models.set('SingleModel', {
        name: 'SingleModel',
        fields: [{ name: 'id', type: 'string', required: true, isArray: false }],
      })

      const generator = new SchemaMockGenerator(models)
      const pageManager = new PagePaginationManager(generator)

      const result = pageManager.getPagedResponse('SingleModel', {
        page: 1,
        limit: 1,
        total: 100,
        seed: 'single-test',
      })

      expect(result.items).toHaveLength(1)
      expect(result.pagination.totalPages).toBe(100)
    })

    it('should handle total = 1', async () => {
      await setupModules()

      const models = new Map()
      models.set('OneItemModel', {
        name: 'OneItemModel',
        fields: [{ name: 'id', type: 'string', required: true, isArray: false }],
      })

      const generator = new SchemaMockGenerator(models)
      const pageManager = new PagePaginationManager(generator)

      const result = pageManager.getPagedResponse('OneItemModel', {
        page: 1,
        limit: 10,
        total: 1,
        seed: 'one-item-test',
      })

      expect(result.items).toHaveLength(1)
      expect(result.pagination.totalPages).toBe(1)
    })
  })

  describe('Cursor Pagination', () => {
    let CursorPaginationManager: typeof import('../src/runtime/server/utils/mock/pagination').CursorPaginationManager
    let SchemaMockGenerator: typeof import('../src/runtime/server/utils/mock/client-generator').SchemaMockGenerator
    let resetSnapshotStore: typeof import('../src/runtime/server/utils/mock/pagination').resetSnapshotStore

    const setupModules = async () => {
      const pagination = await import('../src/runtime/server/utils/mock/pagination')
      const client = await import('../src/runtime/server/utils/mock/client-generator')

      CursorPaginationManager = pagination.CursorPaginationManager
      resetSnapshotStore = pagination.resetSnapshotStore
      SchemaMockGenerator = client.SchemaMockGenerator

      resetSnapshotStore()
    }

    it('should handle empty result (total = 0)', async () => {
      await setupModules()

      const models = new Map()
      models.set('EmptyCursor', {
        name: 'EmptyCursor',
        fields: [{ name: 'id', type: 'string', required: true, isArray: false }],
      })

      const generator = new SchemaMockGenerator(models)
      const cursorManager = new CursorPaginationManager(generator)

      const result = cursorManager.getCursorPage('EmptyCursor', {
        limit: 10,
        total: 0,
        seed: 'empty-cursor-test',
      })

      expect(result.items).toHaveLength(0)
      expect(result.hasMore).toBe(false)
      expect(result.nextCursor).toBeUndefined()
    })

    it('should handle last page (hasMore = false)', async () => {
      await setupModules()

      const models = new Map()
      models.set('LastCursor', {
        name: 'LastCursor',
        fields: [{ name: 'id', type: 'string', required: true, isArray: false }],
      })

      const generator = new SchemaMockGenerator(models)
      const cursorManager = new CursorPaginationManager(generator)

      // Get all items in one request
      const result = cursorManager.getCursorPage('LastCursor', {
        limit: 100,
        total: 10,
        seed: 'last-cursor-test',
      })

      expect(result.items).toHaveLength(10)
      expect(result.hasMore).toBe(false)
    })

    it('should handle limit = 1', async () => {
      await setupModules()

      const models = new Map()
      models.set('SingleCursor', {
        name: 'SingleCursor',
        fields: [{ name: 'id', type: 'string', required: true, isArray: false }],
      })

      const generator = new SchemaMockGenerator(models)
      const cursorManager = new CursorPaginationManager(generator)

      const result = cursorManager.getCursorPage('SingleCursor', {
        limit: 1,
        total: 10,
        seed: 'single-cursor-test',
      })

      expect(result.items).toHaveLength(1)
      expect(result.hasMore).toBe(true)
      expect(result.nextCursor).toBeDefined()
    })
  })
})
