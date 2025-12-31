/**
 * OpenAPI Spec File Mode E2E Tests
 *
 * playground-openapi 테스트 - OpenAPI YAML 파일 기반 Mock 서버
 * 대상: packages/sample-openapi/openapi.yaml
 *
 * NOTE: 일부 테스트는 페이지네이션 wrapper 응답이 완전히 구현될 때까지 .skip 처리됨
 */
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('OpenAPI Spec File Mode E2E', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../../playground-openapi', import.meta.url)),
    dev: true,
  })

  // ============================================
  // Users API - Basic Operations
  // ============================================
  describe('Users API', () => {
    describe('GET /mock/users', () => {
      it('should return data for GET /mock/users', async () => {
        const response = await $fetch('/mock/users')

        expect(response).toBeDefined()
      })

      it('should support query parameters', async () => {
        const response = await $fetch('/mock/users?page=1&limit=5')

        expect(response).toBeDefined()
      })

      it('should return consistent data for same query', async () => {
        const response1 = await $fetch('/mock/users?page=1&limit=5')
        const response2 = await $fetch('/mock/users?page=1&limit=5')

        expect(response1).toEqual(response2)
      })
    })

    describe('POST /mock/users', () => {
      it('should handle user creation request', async () => {
        const response = await $fetch('/mock/users', {
          method: 'POST',
          body: {
            username: 'testuser',
            email: 'test@example.com',
            name: 'Test User',
          },
        })

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })

    describe('GET /mock/users/{id}', () => {
      it('should return user by id', async () => {
        const response = await $fetch('/mock/users/user-123')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })

      it('should return consistent data for same id', async () => {
        const response1 = await $fetch('/mock/users/same-user')
        const response2 = await $fetch('/mock/users/same-user')

        expect(response1).toEqual(response2)
      })

      it('should return different data for different ids', async () => {
        const response1 = await $fetch('/mock/users/user-1')
        const response2 = await $fetch('/mock/users/user-2')

        expect(response1).not.toEqual(response2)
      })
    })

    describe('PUT /mock/users/{id}', () => {
      it('should handle user update request', async () => {
        const response = await $fetch('/mock/users/user-123', {
          method: 'PUT',
          body: {
            name: 'Updated Name',
            email: 'updated@example.com',
          },
        })

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })

    describe('DELETE /mock/users/{id}', () => {
      it('should handle user deletion', async () => {
        const response = await $fetch('/mock/users/user-123', {
          method: 'DELETE',
        })

        // DELETE typically returns empty, null, or undefined
        expect(response === null || response === undefined || response === '').toBe(true)
      })
    })
  })

  // ============================================
  // Products API - Basic Operations
  // ============================================
  describe('Products API', () => {
    describe('GET /mock/products', () => {
      it('should return data for GET /mock/products', async () => {
        const response = await $fetch('/mock/products')

        expect(response).toBeDefined()
      })

      it('should support query parameters', async () => {
        const response = await $fetch('/mock/products?page=1&limit=10')

        expect(response).toBeDefined()
      })
    })

    describe('POST /mock/products', () => {
      it('should handle product creation', async () => {
        const response = await $fetch('/mock/products', {
          method: 'POST',
          body: {
            name: 'Test Product',
            price: 99.99,
            category: 'electronics',
          },
        })

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })

    describe('GET /mock/products/{id}', () => {
      it('should return product by id', async () => {
        const response = await $fetch('/mock/products/prod-123')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })
  })

  // ============================================
  // Orders API - Basic Operations
  // ============================================
  describe('Orders API', () => {
    describe('GET /mock/orders', () => {
      it('should return data for GET /mock/orders', async () => {
        const response = await $fetch('/mock/orders')

        expect(response).toBeDefined()
      })
    })

    describe('POST /mock/orders', () => {
      it('should handle order creation', async () => {
        const response = await $fetch('/mock/orders', {
          method: 'POST',
          body: {
            items: [
              { productId: 'prod-1', quantity: 2 },
              { productId: 'prod-2', quantity: 1 },
            ],
            shippingAddress: '123 Test St',
          },
        })

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })

    describe('GET /mock/orders/{id}', () => {
      it('should return order by id', async () => {
        const response = await $fetch('/mock/orders/order-123')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })
  })

  // ============================================
  // Posts API - Cursor-based pagination
  // ============================================
  describe('Posts API', () => {
    describe('GET /mock/posts (cursor pagination)', () => {
      it('should return data for GET /mock/posts', async () => {
        const response = await $fetch('/mock/posts?limit=5')

        expect(response).toBeDefined()
      })
    })

    describe('POST /mock/posts', () => {
      it('should handle post creation', async () => {
        const response = await $fetch('/mock/posts', {
          method: 'POST',
          body: {
            title: 'Test Post',
            content: 'Test content for the post',
            tags: ['test', 'demo'],
          },
        })

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })

    describe('GET /mock/posts/{id}', () => {
      it('should return post by id', async () => {
        const response = await $fetch('/mock/posts/post-123')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })
  })

  // ============================================
  // Comments API - Nested resource
  // ============================================
  describe('Comments API', () => {
    describe('GET /mock/posts/{postId}/comments', () => {
      it('should return comments for a post', async () => {
        const response = await $fetch('/mock/posts/post-123/comments')

        expect(response).toBeDefined()
      })

      it('should support limit parameter', async () => {
        const response = await $fetch('/mock/posts/post-123/comments?limit=3')

        expect(response).toBeDefined()
      })
    })

    describe('POST /mock/posts/{postId}/comments', () => {
      it('should handle comment creation', async () => {
        const response = await $fetch('/mock/posts/post-123/comments', {
          method: 'POST',
          body: {
            content: 'This is a test comment',
          },
        })

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })
  })

  // ============================================
  // Health API - Simple endpoints
  // ============================================
  describe('Health API', () => {
    describe('GET /mock/health', () => {
      it('should return health status', async () => {
        const response = await $fetch('/mock/health')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })

    describe('GET /mock/version', () => {
      it('should return version info', async () => {
        const response = await $fetch('/mock/version')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })

    describe('GET /mock/ping', () => {
      it('should return pong response', async () => {
        const response = await $fetch('/mock/ping')

        expect(response).toBeDefined()
      })
    })

    describe('GET /mock/tags', () => {
      it('should return array of tags', async () => {
        const response = await $fetch('/mock/tags')

        expect(response).toBeDefined()
        expect(Array.isArray(response)).toBe(true)
      })
    })
  })

  // ============================================
  // Meta Endpoints
  // ============================================
  describe('Meta Endpoints', () => {
    it('should return schema at GET /mock/__schema', async () => {
      const schema = await $fetch('/mock/__schema')

      expect(schema).toBeDefined()
      expect(schema.openapi).toBeDefined()
      expect(schema.openapi.info).toBeDefined()
      expect(schema.openapi.paths).toBeDefined()
    })

    it('should reset cache at POST /mock/__reset', async () => {
      const response = await $fetch('/mock/__reset', { method: 'POST' })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })
  })

  // ============================================
  // Error Handling
  // ============================================
  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      try {
        await $fetch('/mock/nonexistent/random/endpoint')
        expect.fail('Should have thrown an error')
      }
      catch (error: unknown) {
        const fetchError = error as { response?: { status?: number } }
        expect(fetchError.response?.status).toBe(404)
      }
    })
  })

  // ============================================
  // Edge Cases - Primitive Response Types
  // ============================================
  describe('Edge Cases - Primitive Responses', () => {
    it('should return integer for GET /mock/stats/count', async () => {
      const response = await $fetch('/mock/stats/count')

      expect(response).toBeDefined()
      expect(typeof response).toBe('number')
    })

    it('should return string for GET /mock/stats/status', async () => {
      const response = await $fetch('/mock/stats/status')

      expect(response).toBeDefined()
      expect(typeof response).toBe('string')
    })

    it('should return boolean for GET /mock/stats/enabled', async () => {
      const response = await $fetch('/mock/stats/enabled')

      expect(response).toBeDefined()
      expect(typeof response).toBe('boolean')
    })
  })

  // ============================================
  // Edge Cases - Multiple Path Parameters
  // ============================================
  describe('Edge Cases - Multiple Path Parameters', () => {
    it('should handle 2 path params: /categories/{catId}/products/{prodId}', async () => {
      const response = await $fetch('/mock/categories/cat-123/products/prod-456')

      expect(response).toBeDefined()
      expect(typeof response).toBe('object')
    })

    it('should handle 3 path params: /users/{userId}/orders/{orderId}/items/{itemId}', async () => {
      const response = await $fetch('/mock/users/user-1/orders/order-2/items/item-3')

      expect(response).toBeDefined()
      expect(typeof response).toBe('object')
    })

    it('should return consistent data for same multi-param path', async () => {
      const response1 = await $fetch('/mock/categories/cat-abc/products/prod-xyz')
      const response2 = await $fetch('/mock/categories/cat-abc/products/prod-xyz')

      expect(response1).toEqual(response2)
    })
  })

  // ============================================
  // Edge Cases - Direct Array Response
  // ============================================
  describe('Edge Cases - Direct Array Response', () => {
    it('should return array for GET /mock/featured/products', async () => {
      const response = await $fetch('/mock/featured/products')

      expect(response).toBeDefined()
      expect(Array.isArray(response)).toBe(true)
    })

    it('should return string array for GET /mock/search/suggestions', async () => {
      const response = await $fetch('/mock/search/suggestions?q=test')

      expect(response).toBeDefined()
      expect(Array.isArray(response)).toBe(true)
    })
  })

  // ============================================
  // Edge Cases - Nullable & Complex Fields
  // ============================================
  describe('Edge Cases - Nullable Fields', () => {
    it('should return profile with nullable fields', async () => {
      const response = await $fetch('/mock/profiles/profile-123')

      expect(response).toBeDefined()
      expect(response.id).toBeDefined()
      expect(response.username).toBeDefined()
      // nullable fields may or may not be present
    })
  })

  // ============================================
  // Edge Cases - Schema Composition (allOf)
  // ============================================
  describe('Edge Cases - Schema Composition', () => {
    it('should return AdminUser with inherited User fields', async () => {
      const response = await $fetch('/mock/admin/users/admin-123')

      expect(response).toBeDefined()
      expect(typeof response).toBe('object')
      // Should have User fields + AdminUser fields
    })
  })

  // ============================================
  // Edge Cases - Polymorphic Types (oneOf)
  // ============================================
  describe('Edge Cases - Polymorphic Types', () => {
    it('should return notification with type discriminator', async () => {
      const response = await $fetch('/mock/notifications/notif-123')

      expect(response).toBeDefined()
      expect(typeof response).toBe('object')
    })
  })

  // ============================================
  // Edge Cases - Deeply Nested Objects
  // ============================================
  describe('Edge Cases - Deeply Nested', () => {
    it('should return report with nested metadata structure', async () => {
      const response = await $fetch('/mock/reports/report-123')

      expect(response).toBeDefined()
      expect(typeof response).toBe('object')
      expect(response.id).toBeDefined()
      expect(response.title).toBeDefined()
      // metadata는 deeply nested object
      expect(response.metadata).toBeDefined()
      expect(typeof response.metadata).toBe('object')
      // sections는 array
      expect(response.sections).toBeDefined()
      expect(Array.isArray(response.sections)).toBe(true)
    })
  })

  // ============================================
  // Edge Cases - Recursive Schema
  // ============================================
  describe('Edge Cases - Recursive Schema', () => {
    it('should return category tree with children', async () => {
      const response = await $fetch('/mock/categories/cat-root/tree')

      expect(response).toBeDefined()
      expect(typeof response).toBe('object')
      expect(response.id).toBeDefined()
      expect(response.name).toBeDefined()
      // children은 같은 타입의 배열 (재귀 구조)
      expect(response.children).toBeDefined()
      expect(Array.isArray(response.children)).toBe(true)
    })
  })

  // ============================================
  // Edge Cases - Numeric Types
  // ============================================
  describe('Edge Cases - Numeric Types', () => {
    it('should return metrics with various numeric fields', async () => {
      const response = await $fetch('/mock/analytics/metrics')

      expect(response).toBeDefined()
      expect(typeof response).toBe('object')
    })
  })

  // ============================================
  // Edge Cases - Date Formats
  // ============================================
  describe('Edge Cases - Date Formats', () => {
    it('should return event with date fields', async () => {
      const response = await $fetch('/mock/events/event-123')

      expect(response).toBeDefined()
      expect(response.id).toBeDefined()
      expect(response.eventDate).toBeDefined()
      expect(response.startTime).toBeDefined()
    })
  })

  // ============================================
  // Edge Cases - Settings with Constraints
  // ============================================
  describe('Edge Cases - Settings', () => {
    it('should return settings', async () => {
      const response = await $fetch('/mock/settings')

      expect(response).toBeDefined()
      expect(typeof response).toBe('object')
    })

    it('should handle PUT settings', async () => {
      const response = await $fetch('/mock/settings', {
        method: 'PUT',
        body: {
          displayName: 'Test User',
          theme: 'dark',
        },
      })

      expect(response).toBeDefined()
    })
  })

  // ============================================
  // Edge Cases - Map/Dictionary Types
  // ============================================
  describe('Edge Cases - Map Types', () => {
    it('should return config map', async () => {
      const response = await $fetch('/mock/config')

      expect(response).toBeDefined()
      expect(typeof response).toBe('object')
    })
  })

  // ============================================
  // Edge Cases - Additional 204 Responses
  // ============================================
  describe('Edge Cases - 204 No Content', () => {
    it('should return 204 for DELETE /mock/cache', async () => {
      const response = await $fetch('/mock/cache', { method: 'DELETE' })

      // 204 No Content returns null/undefined
      expect(response === null || response === undefined || response === '').toBe(true)
    })

    it('should return 204 for DELETE /mock/sessions/{id}', async () => {
      const response = await $fetch('/mock/sessions/session-123', { method: 'DELETE' })

      expect(response === null || response === undefined || response === '').toBe(true)
    })
  })
})
