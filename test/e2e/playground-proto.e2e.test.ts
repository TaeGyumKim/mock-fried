/**
 * Proto RPC Mode E2E Tests
 *
 * playground-proto 테스트 - Protobuf RPC 기반 Mock 서버
 * 대상: packages/sample-proto/protos/example.proto
 *
 * NOTE: Proto RPC는 기본 구현만 지원 (Unary RPC)
 */
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('Proto RPC Mode E2E', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../../playground-proto', import.meta.url)),
    dev: true,
  })

  // ============================================
  // UserService RPCs
  // ============================================
  describe('UserService', () => {
    describe('GetUser', () => {
      it('should handle POST /mock/rpc/UserService/GetUser', async () => {
        const response = await $fetch('/mock/rpc/UserService/GetUser', {
          method: 'POST',
          body: { id: 1 },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return consistent data for same id', async () => {
        const response1 = await $fetch('/mock/rpc/UserService/GetUser', {
          method: 'POST',
          body: { id: 123 },
        })
        const response2 = await $fetch('/mock/rpc/UserService/GetUser', {
          method: 'POST',
          body: { id: 123 },
        })

        expect(response1).toEqual(response2)
      })
    })

    describe('ListUsers', () => {
      it('should handle POST /mock/rpc/UserService/ListUsers', async () => {
        const response = await $fetch('/mock/rpc/UserService/ListUsers', {
          method: 'POST',
          body: { page: 1, pageSize: 10 },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })
    })

    describe('CreateUser', () => {
      it('should handle POST /mock/rpc/UserService/CreateUser', async () => {
        const response = await $fetch('/mock/rpc/UserService/CreateUser', {
          method: 'POST',
          body: {
            name: 'Test User',
            email: 'test@example.com',
          },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })
    })

    describe('UpdateUser', () => {
      it('should handle POST /mock/rpc/UserService/UpdateUser', async () => {
        const response = await $fetch('/mock/rpc/UserService/UpdateUser', {
          method: 'POST',
          body: {
            id: 1,
            name: 'Updated User',
            email: 'updated@example.com',
          },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })
    })

    describe('DeleteUser', () => {
      it('should handle POST /mock/rpc/UserService/DeleteUser', async () => {
        const response = await $fetch('/mock/rpc/UserService/DeleteUser', {
          method: 'POST',
          body: { id: 1 },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })
    })
  })

  // ============================================
  // ProductService RPCs
  // ============================================
  describe('ProductService', () => {
    describe('GetProduct', () => {
      it('should handle POST /mock/rpc/ProductService/GetProduct', async () => {
        const response = await $fetch('/mock/rpc/ProductService/GetProduct', {
          method: 'POST',
          body: { id: 1 },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })
    })

    describe('ListProducts', () => {
      it('should handle POST /mock/rpc/ProductService/ListProducts', async () => {
        const response = await $fetch('/mock/rpc/ProductService/ListProducts', {
          method: 'POST',
          body: { page: 1, pageSize: 10 },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })
    })

    describe('SearchProducts', () => {
      it('should handle POST /mock/rpc/ProductService/SearchProducts', async () => {
        const response = await $fetch('/mock/rpc/ProductService/SearchProducts', {
          method: 'POST',
          body: { keyword: 'test' },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })
    })
  })

  // ============================================
  // Response Structure
  // ============================================
  describe('Response Structure', () => {
    it('should have consistent response wrapper', async () => {
      const response = await $fetch('/mock/rpc/UserService/GetUser', {
        method: 'POST',
        body: { id: 1 },
      })

      expect(response.success).toBeDefined()
      expect(response.data).toBeDefined()
    })

    it('should include service and method in response', async () => {
      const response = await $fetch('/mock/rpc/UserService/GetUser', {
        method: 'POST',
        body: { id: 1 },
      })

      expect(response.service).toBe('UserService')
      expect(response.method).toBe('GetUser')
    })
  })

  // ============================================
  // Schema Endpoint
  // ============================================
  describe('Schema Endpoint', () => {
    // TODO: Proto schema structure differs from expected
    it.skip('should return proto schema at GET /mock/__schema', async () => {
      const schema = await $fetch('/mock/__schema')

      expect(schema).toBeDefined()
      expect(schema.proto).toBeDefined()
    })
  })

  // ============================================
  // Error Handling
  // ============================================
  describe('Error Handling', () => {
    it('should return 404 for non-existent service', async () => {
      try {
        await $fetch('/mock/rpc/NonExistentService/GetUser', {
          method: 'POST',
          body: {},
        })
        expect.fail('Should have thrown an error')
      }
      catch (error: unknown) {
        const fetchError = error as { response?: { status?: number } }
        expect(fetchError.response?.status).toBe(404)
      }
    })

    it('should return 404 for non-existent method', async () => {
      try {
        await $fetch('/mock/rpc/UserService/NonExistentMethod', {
          method: 'POST',
          body: {},
        })
        expect.fail('Should have thrown an error')
      }
      catch (error: unknown) {
        const fetchError = error as { response?: { status?: number } }
        expect(fetchError.response?.status).toBe(404)
      }
    })
  })

  // ============================================
  // Meta Endpoints
  // ============================================
  describe('Meta Endpoints', () => {
    it('should reset cache at POST /mock/__reset', async () => {
      const response = await $fetch('/mock/__reset', { method: 'POST' })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })
  })
})
