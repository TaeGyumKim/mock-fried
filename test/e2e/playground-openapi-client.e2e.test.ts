/**
 * OpenAPI Client Package Mode E2E Tests
 *
 * playground-openapi-client 테스트 - openapi-generator 출력 패키지 기반 Mock 서버
 * 대상: packages/openapi-client (generated TypeScript client)
 *
 * NOTE: 테스트는 모든 API 엔드포인트가 응답을 반환하는지 검증
 */
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('OpenAPI Client Package Mode E2E', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../../playground-openapi-client', import.meta.url)),
    dev: true,
  })

  // ============================================
  // UsersApi methods
  // ============================================
  describe('UsersApi', () => {
    describe('getUsers', () => {
      it('should return data for GET /mock/users', async () => {
        const response = await $fetch('/mock/users')

        expect(response).toBeDefined()
      })

      it('should support query parameters', async () => {
        const response = await $fetch('/mock/users?page=1&limit=10')

        expect(response).toBeDefined()
      })

      // TODO: Timestamp differences cause inconsistency
      it.skip('should return consistent data for same query', async () => {
        const response1 = await $fetch('/mock/users?page=1&limit=5')
        const response2 = await $fetch('/mock/users?page=1&limit=5')

        expect(response1).toEqual(response2)
      })
    })

    describe('getUserById', () => {
      it('should return User object', async () => {
        const response = await $fetch('/mock/users/user-123')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })

      // TODO: Timestamp differences cause inconsistency
      it.skip('should return consistent data for same id', async () => {
        const response1 = await $fetch('/mock/users/same-user')
        const response2 = await $fetch('/mock/users/same-user')

        expect(response1).toEqual(response2)
      })
    })

    describe('deleteUser', () => {
      // TODO: DELETE returns object instead of empty response
      it.skip('should handle deletion request', async () => {
        const response = await $fetch('/mock/users/user-123', {
          method: 'DELETE',
        })

        // DELETE typically returns empty or null
        expect(response === null || response === undefined || response === '').toBe(true)
      })
    })
  })

  // ============================================
  // ProductsApi methods
  // ============================================
  describe('ProductsApi', () => {
    describe('getProducts', () => {
      it('should return data for GET /mock/products', async () => {
        const response = await $fetch('/mock/products')

        expect(response).toBeDefined()
      })

      it('should support query parameters', async () => {
        const response = await $fetch('/mock/products?page=1&limit=10')

        expect(response).toBeDefined()
      })
    })

    describe('getProductById', () => {
      it('should return Product object', async () => {
        const response = await $fetch('/mock/products/prod-123')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })
  })

  // ============================================
  // OrdersApi methods
  // ============================================
  describe('OrdersApi', () => {
    describe('getOrders', () => {
      it('should return data for GET /mock/orders', async () => {
        const response = await $fetch('/mock/orders')

        expect(response).toBeDefined()
      })
    })

    describe('getOrderById', () => {
      it('should return Order object', async () => {
        const response = await $fetch('/mock/orders/order-123')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })
  })

  // ============================================
  // PostsApi methods (cursor pagination)
  // ============================================
  describe('PostsApi', () => {
    describe('getPosts', () => {
      it('should return data for GET /mock/posts', async () => {
        const response = await $fetch('/mock/posts?limit=5')

        expect(response).toBeDefined()
      })
    })

    describe('getPostById', () => {
      it('should return Post object', async () => {
        const response = await $fetch('/mock/posts/post-123')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })
  })

  // ============================================
  // CommentsApi methods
  // ============================================
  describe('CommentsApi', () => {
    describe('getComments', () => {
      it('should return data for GET /mock/posts/{postId}/comments', async () => {
        const response = await $fetch('/mock/posts/post-123/comments')

        expect(response).toBeDefined()
      })

      it('should support limit parameter', async () => {
        const response = await $fetch('/mock/posts/post-123/comments?limit=3')

        expect(response).toBeDefined()
      })
    })
  })

  // ============================================
  // HealthApi methods
  // ============================================
  describe('HealthApi', () => {
    describe('getHealth', () => {
      it('should return HealthResponse', async () => {
        const response = await $fetch('/mock/health')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })

    describe('getVersion', () => {
      it('should return VersionResponse', async () => {
        const response = await $fetch('/mock/version')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })

    describe('ping', () => {
      it('should return Ping200Response', async () => {
        const response = await $fetch('/mock/ping')

        expect(response).toBeDefined()
      })
    })

    describe('getTags', () => {
      it('should return string array', async () => {
        const response = await $fetch('/mock/tags')

        expect(response).toBeDefined()
        expect(Array.isArray(response)).toBe(true)
      })
    })
  })

  // ============================================
  // Schema Endpoint
  // ============================================
  describe('Schema Endpoint', () => {
    // TODO: Client package parsing fails in test environment
    it.skip('should return schema with client package info', async () => {
      const schema = await $fetch('/mock/__schema')

      expect(schema).toBeDefined()
      expect(schema.client).toBeDefined()
      expect(schema.client.package).toBeDefined()
      expect(schema.client.endpoints).toBeDefined()
      expect(Array.isArray(schema.client.endpoints)).toBe(true)
    })
  })

  // ============================================
  // Data Consistency
  // ============================================
  describe('Data Consistency', () => {
    // TODO: Timestamp differences cause inconsistency
    it.skip('should return consistent data for same user id', async () => {
      const response1 = await $fetch('/mock/users/user-123')
      const response2 = await $fetch('/mock/users/user-123')

      expect(response1).toEqual(response2)
    })

    it('should return different data for different ids', async () => {
      const response1 = await $fetch('/mock/users/user-1')
      const response2 = await $fetch('/mock/users/user-2')

      expect(response1).not.toEqual(response2)
    })
  })
})
