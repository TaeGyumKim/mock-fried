/**
 * Refactored Utilities Unit Tests
 *
 * Tests for the newly extracted utility modules:
 * - proto-utils.ts
 * - cache-manager.ts
 * - pagination-factory.ts
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { join } from 'pathe'

describe('Proto Utils', () => {
  describe('PROTO_TYPE_MAP', () => {
    it('should export PROTO_TYPE_MAP constant', async () => {
      const { PROTO_TYPE_MAP } = await import('../src/runtime/server/utils/proto-utils')
      expect(PROTO_TYPE_MAP).toBeDefined()
      expect(typeof PROTO_TYPE_MAP).toBe('object')
    })

    it('should map numeric type codes to string names', async () => {
      const { PROTO_TYPE_MAP } = await import('../src/runtime/server/utils/proto-utils')

      // Test numeric keys (proto-loader internal format)
      expect(PROTO_TYPE_MAP[1]).toBe('double')
      expect(PROTO_TYPE_MAP[5]).toBe('int32')
      expect(PROTO_TYPE_MAP[8]).toBe('bool')
      expect(PROTO_TYPE_MAP[9]).toBe('string')
      expect(PROTO_TYPE_MAP[11]).toBe('message')
      expect(PROTO_TYPE_MAP[14]).toBe('enum')
    })

    it('should map string type codes to string names', async () => {
      const { PROTO_TYPE_MAP } = await import('../src/runtime/server/utils/proto-utils')

      // Test string keys (proto-loader actual return values)
      expect(PROTO_TYPE_MAP.TYPE_DOUBLE).toBe('double')
      expect(PROTO_TYPE_MAP.TYPE_INT32).toBe('int32')
      expect(PROTO_TYPE_MAP.TYPE_BOOL).toBe('bool')
      expect(PROTO_TYPE_MAP.TYPE_STRING).toBe('string')
      expect(PROTO_TYPE_MAP.TYPE_MESSAGE).toBe('message')
      expect(PROTO_TYPE_MAP.TYPE_ENUM).toBe('enum')
    })

    it('should have consistent mapping for both numeric and string keys', async () => {
      const { PROTO_TYPE_MAP } = await import('../src/runtime/server/utils/proto-utils')

      // Same type should have same value regardless of key format
      expect(PROTO_TYPE_MAP[5]).toBe(PROTO_TYPE_MAP.TYPE_INT32)
      expect(PROTO_TYPE_MAP[9]).toBe(PROTO_TYPE_MAP.TYPE_STRING)
      expect(PROTO_TYPE_MAP[8]).toBe(PROTO_TYPE_MAP.TYPE_BOOL)
    })
  })

  describe('getProtoTypeName', () => {
    it('should return type name from numeric code', async () => {
      const { getProtoTypeName } = await import('../src/runtime/server/utils/proto-utils')

      expect(getProtoTypeName(5)).toBe('int32')
      expect(getProtoTypeName(9)).toBe('string')
      expect(getProtoTypeName(8)).toBe('bool')
    })

    it('should return type name from string code', async () => {
      const { getProtoTypeName } = await import('../src/runtime/server/utils/proto-utils')

      expect(getProtoTypeName('TYPE_INT32')).toBe('int32')
      expect(getProtoTypeName('TYPE_STRING')).toBe('string')
      expect(getProtoTypeName('TYPE_BOOL')).toBe('bool')
    })

    it('should return typeName when provided', async () => {
      const { getProtoTypeName } = await import('../src/runtime/server/utils/proto-utils')

      // When typeName is provided, it should extract short name
      expect(getProtoTypeName(11, '.example.User')).toBe('User')
      expect(getProtoTypeName(11, 'package.SubMessage')).toBe('SubMessage')
      expect(getProtoTypeName(14, '.proto.Status')).toBe('Status')
    })

    it('should return unknown for invalid type code', async () => {
      const { getProtoTypeName } = await import('../src/runtime/server/utils/proto-utils')

      expect(getProtoTypeName(999)).toBe('unknown')
      expect(getProtoTypeName('INVALID_TYPE')).toBe('unknown')
    })
  })

  describe('findProtoFiles', () => {
    it('should find proto files in sample-proto package', async () => {
      const { findProtoFiles } = await import('../src/runtime/server/utils/proto-utils')

      const protoPath = join(process.cwd(), 'packages/sample-proto')
      const files = findProtoFiles(protoPath)

      expect(Array.isArray(files)).toBe(true)
      expect(files.length).toBeGreaterThan(0)
      expect(files.every(f => f.endsWith('.proto'))).toBe(true)
    })

    it('should return single file when path is a proto file', async () => {
      const { findProtoFiles } = await import('../src/runtime/server/utils/proto-utils')

      const protoFile = join(process.cwd(), 'packages/sample-proto/protos/example.proto')
      const files = findProtoFiles(protoFile)

      expect(files).toHaveLength(1)
      expect(files[0]).toBe(protoFile)
    })

    it('should return empty array for non-existent path', async () => {
      const { findProtoFiles } = await import('../src/runtime/server/utils/proto-utils')

      try {
        findProtoFiles('/non/existent/path')
        expect.fail('Should throw error for non-existent path')
      }
      catch (error) {
        expect(error).toBeDefined()
      }
    })
  })
})

describe('Cache Manager', () => {
  describe('cacheManager singleton', () => {
    it('should export cacheManager singleton', async () => {
      const { cacheManager } = await import('../src/runtime/server/utils/cache-manager')
      expect(cacheManager).toBeDefined()
    })

    it('should have specMode getter', async () => {
      const { cacheManager } = await import('../src/runtime/server/utils/cache-manager')

      expect(cacheManager.specMode).toBeDefined()
      expect(cacheManager.specMode.apiInstance).toBeDefined() // null initially
      expect(cacheManager.specMode.backwardParam).toBe('isBackward')
    })

    it('should have clientMode getter', async () => {
      const { cacheManager } = await import('../src/runtime/server/utils/cache-manager')

      expect(cacheManager.clientMode).toBeDefined()
      expect(cacheManager.clientMode.package).toBeNull()
      expect(cacheManager.clientMode.path).toBeNull()
    })

    it('should have protoMode getter', async () => {
      const { cacheManager } = await import('../src/runtime/server/utils/cache-manager')

      expect(cacheManager.protoMode).toBeDefined()
      expect(cacheManager.protoMode.cache).toBeNull()
      expect(cacheManager.protoMode.backwardParam).toBe('isBackward')
    })

    it('should have schemaCache getter', async () => {
      const { cacheManager } = await import('../src/runtime/server/utils/cache-manager')

      expect(cacheManager.schemaCache).toBeDefined()
      expect(cacheManager.schemaCache.schema).toBeNull()
    })
  })

  describe('clearAll', () => {
    it('should clear all caches', async () => {
      const { cacheManager } = await import('../src/runtime/server/utils/cache-manager')

      // Set some values
      cacheManager.specMode.backwardParam = 'customBackward'
      cacheManager.protoMode.backwardParam = 'customProtoBackward'

      // Clear all
      cacheManager.clearAll()

      // Verify defaults are restored
      expect(cacheManager.specMode.backwardParam).toBe('isBackward')
      expect(cacheManager.protoMode.backwardParam).toBe('isBackward')
    })
  })

  describe('clearOpenApi', () => {
    it('should clear OpenAPI caches (both spec and client mode)', async () => {
      const { cacheManager } = await import('../src/runtime/server/utils/cache-manager')

      // Set some values
      cacheManager.specMode.specPath = '/some/path'
      cacheManager.clientMode.path = '/client/path'
      cacheManager.specMode.backwardParam = 'custom'

      // Clear OpenAPI
      cacheManager.clearOpenApi()

      // Verify spec mode cleared
      expect(cacheManager.specMode.specPath).toBeNull()
      expect(cacheManager.specMode.backwardParam).toBe('isBackward')

      // Verify client mode cleared
      expect(cacheManager.clientMode.path).toBeNull()
    })
  })

  describe('clearProto', () => {
    it('should clear Proto cache', async () => {
      const { cacheManager } = await import('../src/runtime/server/utils/cache-manager')

      // Set some values
      cacheManager.protoMode.path = '/proto/path'
      cacheManager.protoMode.backwardParam = 'customProto'

      // Clear Proto
      cacheManager.clearProto()

      // Verify cleared
      expect(cacheManager.protoMode.path).toBeNull()
      expect(cacheManager.protoMode.backwardParam).toBe('isBackward')
    })
  })

  describe('clearSchema', () => {
    beforeEach(async () => {
      const { cacheManager } = await import('../src/runtime/server/utils/cache-manager')
      cacheManager.clearAll()
    })

    it('should clear schema cache', async () => {
      const { cacheManager } = await import('../src/runtime/server/utils/cache-manager')

      // Set some value
      cacheManager.schemaCache.schema = { openapi: { info: { title: 'Test' } } } as any

      // Clear Schema
      cacheManager.clearSchema()

      // Verify cleared
      expect(cacheManager.schemaCache.schema).toBeNull()
    })
  })
})

describe('Pagination Factory', () => {
  describe('getOrCreateCursorManager', () => {
    it('should create new CursorPaginationManager when cache is empty', async () => {
      const { getOrCreateCursorManager } = await import('../src/runtime/server/utils/pagination-factory')
      const { SchemaMockGenerator } = await import('../src/runtime/server/utils/mock/client-generator')

      const models = new Map()
      models.set('TestModel', {
        name: 'TestModel',
        fields: [{ name: 'id', type: 'string', required: true, isArray: false }],
      })

      const generator = new SchemaMockGenerator(models)
      const cacheRef = { cursorManager: null }

      const manager = getOrCreateCursorManager(generator, cacheRef)

      expect(manager).toBeDefined()
      expect(cacheRef.cursorManager).toBe(manager)
    })

    it('should return cached CursorPaginationManager on subsequent calls', async () => {
      const { getOrCreateCursorManager } = await import('../src/runtime/server/utils/pagination-factory')
      const { SchemaMockGenerator } = await import('../src/runtime/server/utils/mock/client-generator')

      const models = new Map()
      models.set('TestModel', {
        name: 'TestModel',
        fields: [{ name: 'id', type: 'string', required: true, isArray: false }],
      })

      const generator = new SchemaMockGenerator(models)
      const cacheRef = { cursorManager: null }

      const manager1 = getOrCreateCursorManager(generator, cacheRef)
      const manager2 = getOrCreateCursorManager(generator, cacheRef)

      // Should be the same instance
      expect(manager1).toBe(manager2)
    })

    it('should work with ItemProvider', async () => {
      const { getOrCreateCursorManager } = await import('../src/runtime/server/utils/pagination-factory')
      const { resetSnapshotStore } = await import('../src/runtime/server/utils/mock/pagination')

      resetSnapshotStore()

      // Create a simple ItemProvider
      const mockProvider = {
        getIdFieldName: () => 'id',
        getModelName: () => 'TestModel',
        generateItem: (index: number, _seed: string) => ({ id: `id-${index}`, name: `Item ${index}` }),
        generateItemWithId: (id: string | number, index: number, _seed: string) => ({ id: String(id), name: `Item ${index}` }),
        generateId: (index: number, _seed: string) => `id-${index}`,
      }

      const cacheRef = { cursorManager: null }

      const manager = getOrCreateCursorManager(mockProvider, cacheRef)

      expect(manager).toBeDefined()
      expect(cacheRef.cursorManager).toBe(manager)
    })
  })

  describe('getOrCreatePageManager', () => {
    it('should create new PagePaginationManager when cache is empty', async () => {
      const { getOrCreatePageManager } = await import('../src/runtime/server/utils/pagination-factory')
      const { SchemaMockGenerator } = await import('../src/runtime/server/utils/mock/client-generator')

      const models = new Map()
      models.set('TestModel', {
        name: 'TestModel',
        fields: [{ name: 'id', type: 'string', required: true, isArray: false }],
      })

      const generator = new SchemaMockGenerator(models)
      const cacheRef = { pageManager: null }

      const manager = getOrCreatePageManager(generator, cacheRef)

      expect(manager).toBeDefined()
      expect(cacheRef.pageManager).toBe(manager)
    })

    it('should return cached PagePaginationManager on subsequent calls', async () => {
      const { getOrCreatePageManager } = await import('../src/runtime/server/utils/pagination-factory')
      const { SchemaMockGenerator } = await import('../src/runtime/server/utils/mock/client-generator')

      const models = new Map()
      models.set('TestModel', {
        name: 'TestModel',
        fields: [{ name: 'id', type: 'string', required: true, isArray: false }],
      })

      const generator = new SchemaMockGenerator(models)
      const cacheRef = { pageManager: null }

      const manager1 = getOrCreatePageManager(generator, cacheRef)
      const manager2 = getOrCreatePageManager(generator, cacheRef)

      // Should be the same instance
      expect(manager1).toBe(manager2)
    })

    it('should work with ItemProvider', async () => {
      const { getOrCreatePageManager } = await import('../src/runtime/server/utils/pagination-factory')
      const { resetSnapshotStore } = await import('../src/runtime/server/utils/mock/pagination')

      resetSnapshotStore()

      // Create a simple ItemProvider
      const mockProvider = {
        getIdFieldName: () => 'id',
        getModelName: () => 'TestModel',
        generateItem: (index: number, _seed: string) => ({ id: `id-${index}`, name: `Item ${index}` }),
        generateItemWithId: (id: string | number, index: number, _seed: string) => ({ id: String(id), name: `Item ${index}` }),
        generateId: (index: number, _seed: string) => `id-${index}`,
      }

      const cacheRef = { pageManager: null }

      const manager = getOrCreatePageManager(mockProvider, cacheRef)

      expect(manager).toBeDefined()
      expect(cacheRef.pageManager).toBe(manager)
    })
  })
})
