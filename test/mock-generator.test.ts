/**
 * Mock Generator Enhancement Verification Tests
 *
 * 이 테스트는 Mock Generator 강화 작업의 각 기능이 올바르게 구현되었는지 확인합니다.
 */
import { describe, it, expect, beforeEach } from 'vitest'

// ==============================================
// 1. Mock Generator 파일 분리 검증
// ==============================================

describe('Mock Generator File Separation', () => {
  it('should export shared utilities from mock/shared.ts', async () => {
    const shared = await import('../src/runtime/server/utils/mock/shared')

    expect(shared.hashString).toBeDefined()
    expect(shared.seededRandom).toBeDefined()
    expect(shared.SeededRandom).toBeDefined()
    expect(shared.generateId).toBeDefined()
    expect(shared.generateSnapshotId).toBeDefined()
  })

  it('should export proto generator from mock/proto-generator.ts', async () => {
    const proto = await import('../src/runtime/server/utils/mock/proto-generator')

    expect(proto.generateMockValueForProtoField).toBeDefined()
    expect(proto.generateMockMessage).toBeDefined()
    expect(proto.deriveSeedFromRequest).toBeDefined()
  })

  it('should export openapi generator from mock/openapi-generator.ts', async () => {
    const openapi = await import('../src/runtime/server/utils/mock/openapi-generator')

    expect(openapi.generateMockFromSchema).toBeDefined()
  })

  it('should export client generator from mock/client-generator.ts', async () => {
    const client = await import('../src/runtime/server/utils/mock/client-generator')

    expect(client.inferValueByFieldName).toBeDefined()
    expect(client.generateValueByType).toBeDefined()
    expect(client.inferTypeFromFieldName).toBeDefined()
    expect(client.SchemaMockGenerator).toBeDefined()
    expect(client.extractDataModelName).toBeDefined()
  })

  it('should maintain backward compatibility via mock/index.ts', async () => {
    const mock = await import('../src/runtime/server/utils/mock')

    // All previous exports should still work
    expect(mock.hashString).toBeDefined()
    expect(mock.SeededRandom).toBeDefined()
    expect(mock.generateMockFromSchema).toBeDefined()
    expect(mock.SchemaMockGenerator).toBeDefined()
    expect(mock.generateMockValueForProtoField).toBeDefined()
    expect(mock.generateMockMessage).toBeDefined()

    // New pagination exports
    expect(mock.CursorPaginationManager).toBeDefined()
    expect(mock.PagePaginationManager).toBeDefined()
    expect(mock.SnapshotStore).toBeDefined()
  })

  it('should maintain backward compatibility via mock-generator.ts wrapper', async () => {
    const mockGenerator = await import('../src/runtime/server/utils/mock-generator')

    // All exports should work via the wrapper
    expect(mockGenerator.hashString).toBeDefined()
    expect(mockGenerator.SeededRandom).toBeDefined()
    expect(mockGenerator.generateMockFromSchema).toBeDefined()
    expect(mockGenerator.SchemaMockGenerator).toBeDefined()
  })
})

// ==============================================
// 2. Cursor Pagination 연결성 검증
// ==============================================

describe('Cursor Pagination Connectivity', () => {
  let CursorPaginationManager: typeof import('../src/runtime/server/utils/mock/pagination').CursorPaginationManager
  let SchemaMockGenerator: typeof import('../src/runtime/server/utils/mock/client-generator').SchemaMockGenerator
  let encodeCursor: typeof import('../src/runtime/server/utils/mock/pagination').encodeCursor
  let decodeCursor: typeof import('../src/runtime/server/utils/mock/pagination').decodeCursor
  let resetSnapshotStore: typeof import('../src/runtime/server/utils/mock/pagination').resetSnapshotStore

  beforeEach(async () => {
    const pagination = await import('../src/runtime/server/utils/mock/pagination')
    const client = await import('../src/runtime/server/utils/mock/client-generator')

    CursorPaginationManager = pagination.CursorPaginationManager
    encodeCursor = pagination.encodeCursor
    decodeCursor = pagination.decodeCursor
    resetSnapshotStore = pagination.resetSnapshotStore
    SchemaMockGenerator = client.SchemaMockGenerator

    // Reset snapshot store between tests
    resetSnapshotStore()
  })

  it('should encode cursor with ID-based payload', () => {
    const payload = {
      lastId: 'item-123',
      direction: 'forward' as const,
      timestamp: Date.now(),
    }

    const cursor = encodeCursor(payload)
    expect(cursor).toBeTruthy()
    expect(typeof cursor).toBe('string')

    const decoded = decodeCursor(cursor)
    expect(decoded).toBeTruthy()
    expect(decoded?.lastId).toBe('item-123')
    expect(decoded?.direction).toBe('forward')
  })

  it('should generate cursor-based pages with connectivity', () => {
    // Setup mock generator with test models
    const models = new Map()
    models.set('User', {
      name: 'User',
      fields: [
        { name: 'id', type: 'string', required: true, isArray: false },
        { name: 'name', type: 'string', required: true, isArray: false },
      ],
    })

    const generator = new SchemaMockGenerator(models)
    const cursorManager = new CursorPaginationManager(generator)

    // First page
    const page1 = cursorManager.getCursorPage('User', {
      limit: 5,
      total: 20,
      seed: 'test',
    })

    expect(page1.items).toHaveLength(5)
    expect(page1.hasMore).toBe(true)
    expect(page1.nextCursor).toBeDefined()

    // Decode next cursor and verify it contains the last item's ID
    const nextPayload = decodeCursor(page1.nextCursor!)
    expect(nextPayload?.direction).toBe('forward')
    expect(nextPayload?.lastId).toBeDefined()

    // Second page using cursor
    const page2 = cursorManager.getCursorPage('User', {
      cursor: page1.nextCursor,
      limit: 5,
      total: 20,
      seed: 'test',
    })

    expect(page2.items).toHaveLength(5)
    expect(page2.prevCursor).toBeDefined()

    // Verify no duplicate items between pages
    const page1Ids = page1.items.map(i => i.id)
    const page2Ids = page2.items.map(i => i.id)
    const overlap = page1Ids.filter(id => page2Ids.includes(id))
    expect(overlap).toHaveLength(0)
  })

  it('should support backward navigation with prevCursor', () => {
    const models = new Map()
    models.set('Post', {
      name: 'Post',
      fields: [
        { name: 'id', type: 'string', required: true, isArray: false },
        { name: 'title', type: 'string', required: true, isArray: false },
      ],
    })

    const generator = new SchemaMockGenerator(models)
    const cursorManager = new CursorPaginationManager(generator)

    // Get first two pages
    const page1 = cursorManager.getCursorPage('Post', { limit: 5, total: 20, seed: 'nav-test' })
    const page2 = cursorManager.getCursorPage('Post', { cursor: page1.nextCursor, limit: 5, total: 20, seed: 'nav-test' })

    expect(page2.prevCursor).toBeDefined()

    // Go back using prevCursor
    const backToPage1 = cursorManager.getCursorPage('Post', { cursor: page2.prevCursor, limit: 5, total: 20, seed: 'nav-test' })

    // Should get first 5 items again
    expect(backToPage1.items).toHaveLength(5)
    expect(backToPage1.items[0].id).toBe(page1.items[0].id)
  })
})

// ==============================================
// 3. Page/Limit Snapshot 일관성 검증
// ==============================================

describe('Page Pagination Snapshot Consistency', () => {
  let PagePaginationManager: typeof import('../src/runtime/server/utils/mock/pagination').PagePaginationManager
  let SchemaMockGenerator: typeof import('../src/runtime/server/utils/mock/client-generator').SchemaMockGenerator
  let resetSnapshotStore: typeof import('../src/runtime/server/utils/mock/pagination').resetSnapshotStore

  beforeEach(async () => {
    const pagination = await import('../src/runtime/server/utils/mock/pagination')
    const client = await import('../src/runtime/server/utils/mock/client-generator')

    PagePaginationManager = pagination.PagePaginationManager
    resetSnapshotStore = pagination.resetSnapshotStore
    SchemaMockGenerator = client.SchemaMockGenerator

    resetSnapshotStore()
  })

  it('should maintain consistent data across page requests', () => {
    const models = new Map()
    models.set('Product', {
      name: 'Product',
      fields: [
        { name: 'id', type: 'string', required: true, isArray: false },
        { name: 'name', type: 'string', required: true, isArray: false },
        { name: 'price', type: 'number', required: true, isArray: false },
      ],
    })

    const generator = new SchemaMockGenerator(models)
    const pageManager = new PagePaginationManager(generator)

    // Request page 1
    const page1 = pageManager.getPagedResponse('Product', { page: 1, limit: 10, total: 50, seed: 'consistency-test' })

    // Request page 1 again
    const page1Again = pageManager.getPagedResponse('Product', { page: 1, limit: 10, total: 50, seed: 'consistency-test' })

    // Should return identical data
    expect(page1.items).toEqual(page1Again.items)
    expect(page1.pagination).toEqual(page1Again.pagination)
  })

  it('should create and reuse snapshots for caching', () => {
    const models = new Map()
    models.set('Order', {
      name: 'Order',
      fields: [
        { name: 'id', type: 'string', required: true, isArray: false },
        { name: 'total', type: 'number', required: true, isArray: false },
      ],
    })

    const generator = new SchemaMockGenerator(models)
    const pageManager = new PagePaginationManager(generator, {
      config: { includeSnapshotId: true },
    })

    // First request creates snapshot
    const page1 = pageManager.getPagedResponse('Order', { page: 1, limit: 5, total: 30, seed: 'snapshot-test' })
    expect(page1._snapshotId).toBeDefined()

    // Second request should reuse snapshot
    const page2 = pageManager.getPagedResponse('Order', { page: 2, limit: 5, total: 30, seed: 'snapshot-test' })
    expect(page2._snapshotId).toBe(page1._snapshotId)
  })

  it('should return correct pagination metadata', () => {
    const models = new Map()
    models.set('Item', {
      name: 'Item',
      fields: [
        { name: 'id', type: 'string', required: true, isArray: false },
      ],
    })

    const generator = new SchemaMockGenerator(models)
    const pageManager = new PagePaginationManager(generator)

    const result = pageManager.getPagedResponse('Item', { page: 2, limit: 15, total: 100, seed: 'meta-test' })

    expect(result.pagination.page).toBe(2)
    expect(result.pagination.limit).toBe(15)
    expect(result.pagination.total).toBe(100)
    expect(result.pagination.totalPages).toBe(7) // Math.ceil(100/15) = 7
  })

  it('should support offset-based pagination', () => {
    const models = new Map()
    models.set('Record', {
      name: 'Record',
      fields: [
        { name: 'id', type: 'string', required: true, isArray: false },
      ],
    })

    const generator = new SchemaMockGenerator(models)
    const pageManager = new PagePaginationManager(generator)

    const result = pageManager.getOffsetResponse('Record', { offset: 20, limit: 10, total: 100, seed: 'offset-test' })

    expect(result.items).toHaveLength(10)
    expect(result.offset).toBe(20)
    expect(result.limit).toBe(10)
    expect(result.total).toBe(100)
  })

  it('should return different items for different pages (no overlap)', () => {
    const models = new Map()
    models.set('Article', {
      name: 'Article',
      fields: [
        { name: 'id', type: 'string', required: true, isArray: false },
        { name: 'title', type: 'string', required: true, isArray: false },
      ],
    })

    const generator = new SchemaMockGenerator(models)
    const pageManager = new PagePaginationManager(generator)

    // Request multiple pages
    const page1 = pageManager.getPagedResponse('Article', { page: 1, limit: 10, total: 50, seed: 'overlap-test' })
    const page2 = pageManager.getPagedResponse('Article', { page: 2, limit: 10, total: 50, seed: 'overlap-test' })
    const page3 = pageManager.getPagedResponse('Article', { page: 3, limit: 10, total: 50, seed: 'overlap-test' })

    // Verify each page has correct count
    expect(page1.items).toHaveLength(10)
    expect(page2.items).toHaveLength(10)
    expect(page3.items).toHaveLength(10)

    // Extract IDs
    const page1Ids = page1.items.map(i => i.id)
    const page2Ids = page2.items.map(i => i.id)
    const page3Ids = page3.items.map(i => i.id)

    // Check no overlap between pages
    const overlap12 = page1Ids.filter(id => page2Ids.includes(id))
    const overlap23 = page2Ids.filter(id => page3Ids.includes(id))
    const overlap13 = page1Ids.filter(id => page3Ids.includes(id))

    expect(overlap12).toHaveLength(0)
    expect(overlap23).toHaveLength(0)
    expect(overlap13).toHaveLength(0)

    // Verify all IDs are unique within each page
    expect(new Set(page1Ids).size).toBe(10)
    expect(new Set(page2Ids).size).toBe(10)
    expect(new Set(page3Ids).size).toBe(10)
  })

  it('should generate sequential but unique IDs across all pages', () => {
    const models = new Map()
    models.set('Item', {
      name: 'Item',
      fields: [
        { name: 'id', type: 'string', required: true, isArray: false },
      ],
    })

    const generator = new SchemaMockGenerator(models)
    const pageManager = new PagePaginationManager(generator)

    // Get all 5 pages (total 50 items, 10 per page)
    const allItems: Record<string, unknown>[] = []
    for (let page = 1; page <= 5; page++) {
      const result = pageManager.getPagedResponse('Item', { page, limit: 10, total: 50, seed: 'sequential-test' })
      allItems.push(...result.items)
    }

    // All 50 items should have unique IDs
    const allIds = allItems.map(i => i.id)
    expect(new Set(allIds).size).toBe(50)
  })
})

// ==============================================
// 4. OpenAPI Client Package 파싱 검증 (openapi-generator 출력)
// ==============================================

describe('OpenAPI Client Package Parsing', () => {
  it('should have correct package structure', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')

    const packagePath = path.resolve(process.cwd(), 'packages/openapi-client')
    expect(fs.existsSync(packagePath)).toBe(true)

    // Check essential files exist (openapi-generator output)
    expect(fs.existsSync(path.join(packagePath, 'package.json'))).toBe(true)
    expect(fs.existsSync(path.join(packagePath, 'src/index.ts'))).toBe(true)
    expect(fs.existsSync(path.join(packagePath, 'src/runtime.ts'))).toBe(true)
    expect(fs.existsSync(path.join(packagePath, 'src/apis/index.ts'))).toBe(true)
    expect(fs.existsSync(path.join(packagePath, 'src/models/index.ts'))).toBe(true)
  })

  it('should export all model types and helper functions', async () => {
    const models = await import('../packages/openapi-client/src/models')

    // Core model helper functions (openapi-generator output)
    expect(models.UserFromJSON).toBeDefined()
    expect(models.UserToJSON).toBeDefined()
    expect(models.PostFromJSON).toBeDefined()
    expect(models.PostToJSON).toBeDefined()
    expect(models.ProductFromJSON).toBeDefined()
    expect(models.ProductToJSON).toBeDefined()
    expect(models.OrderFromJSON).toBeDefined()
    expect(models.OrderToJSON).toBeDefined()
    expect(models.CommentFromJSON).toBeDefined()
    expect(models.CommentToJSON).toBeDefined()
  })

  it('should export all API classes', async () => {
    const apis = await import('../packages/openapi-client/src/apis')

    expect(apis.UsersApi).toBeDefined()
    expect(apis.PostsApi).toBeDefined()
    expect(apis.ProductsApi).toBeDefined()
    expect(apis.OrdersApi).toBeDefined()
    expect(apis.CommentsApi).toBeDefined()
    expect(apis.HealthApi).toBeDefined()
  })

  it('should have correct response type enums', async () => {
    // openapi-generator creates enum types for response enums
    const models = await import('../packages/openapi-client/src/models')

    // Check that pagination and list response types exist
    expect(models.UserListResponseFromJSON).toBeDefined()
    expect(models.ProductListResponseFromJSON).toBeDefined()
    expect(models.OrderListResponseFromJSON).toBeDefined()
    expect(models.PostListResponseFromJSON).toBeDefined()
    expect(models.CommentListResponseFromJSON).toBeDefined()
  })
})

// ==============================================
// 5. 하위 호환성 검증
// ==============================================

describe('Backward Compatibility', () => {
  it('should allow importing from original mock-generator.ts path', async () => {
    // This should work without errors
    const mockGenerator = await import('../src/runtime/server/utils/mock-generator')

    // Test that all original exports are available
    expect(typeof mockGenerator.hashString).toBe('function')
    expect(typeof mockGenerator.seededRandom).toBe('function')
    expect(mockGenerator.SeededRandom).toBeDefined()
    expect(mockGenerator.SchemaMockGenerator).toBeDefined()
    expect(typeof mockGenerator.generateMockFromSchema).toBe('function')
    expect(typeof mockGenerator.generateMockValueForProtoField).toBe('function')
    expect(typeof mockGenerator.generateMockMessage).toBe('function')
    expect(typeof mockGenerator.deriveSeedFromRequest).toBe('function')
  })

  it('should maintain seeded random consistency', async () => {
    const { SeededRandom } = await import('../src/runtime/server/utils/mock-generator')

    // Same seed should produce same results
    const rng1 = new SeededRandom('test-seed')
    const rng2 = new SeededRandom('test-seed')

    const values1 = [rng1.next(), rng1.next(), rng1.next()]
    const values2 = [rng2.next(), rng2.next(), rng2.next()]

    expect(values1).toEqual(values2)
  })

  it('should maintain hash consistency', async () => {
    const { hashString } = await import('../src/runtime/server/utils/mock-generator')

    // Same input should produce same hash
    const hash1 = hashString('test-input')
    const hash2 = hashString('test-input')

    expect(hash1).toBe(hash2)

    // Different input should produce different hash
    const hash3 = hashString('different-input')
    expect(hash1).not.toBe(hash3)
  })

  it('should maintain SchemaMockGenerator API compatibility', async () => {
    const { SchemaMockGenerator } = await import('../src/runtime/server/utils/mock-generator')

    const models = new Map()
    models.set('TestModel', {
      name: 'TestModel',
      fields: [
        { name: 'id', type: 'string', required: true, isArray: false },
        { name: 'name', type: 'string', required: true, isArray: false },
      ],
    })

    const generator = new SchemaMockGenerator(models)

    // generateOne should work
    const item = generator.generateOne('TestModel', 'seed-123')
    expect(item).toBeDefined()
    expect(item.id).toBeDefined()
    expect(item.name).toBeDefined()

    // generateList should still work (deprecated but functional)
    const list = generator.generateList('TestModel', { page: 1, limit: 5, total: 20 })
    expect(list.items).toHaveLength(5)
    expect(list.pagination.page).toBe(1)

    // generateCursorList should still work (deprecated but functional)
    const cursorList = generator.generateCursorList('TestModel', { limit: 5, total: 20 })
    expect(cursorList.items).toHaveLength(5)
    expect(cursorList.hasMore).toBe(true)
  })
})
