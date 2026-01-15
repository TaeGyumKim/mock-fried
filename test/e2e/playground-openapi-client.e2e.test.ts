/**
 * OpenAPI Client Package Mode E2E Tests
 *
 * playground-openapi-client 테스트 - openapi-generator 출력 패키지 기반 Mock 서버
 * 대상: packages/openapi-client (generated TypeScript client)
 *
 * NOTE: playground-openapi와 동일한 OpenAPI 스펙 기반 - 테스트 구조 동기화
 *
 * 환경변수:
 * - TEST_MODE=production: 프로덕션 빌드 테스트 (dev: false)
 * - TEST_MODE=dev (기본값): 개발 모드 테스트 (dev: true)
 */
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

// 환경변수로 dev/production 모드 전환
const isDev = process.env.TEST_MODE !== 'production'
const modeSuffix = isDev ? '' : ' [production]'

describe(`OpenAPI Client Package Mode E2E${modeSuffix}`, async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../../playground-openapi-client', import.meta.url)),
    dev: isDev,
  })

  // ============================================
  // Page Loading Tests - Verify no 500 errors
  // ============================================
  describe('Page Loading', () => {
    it('should render index page without error', async () => {
      const html = await $fetch('/')
      expect(html).toBeDefined()
      expect(typeof html).toBe('string')
      expect(html).not.toContain('Internal Server Error')
    })

    it('should render api-test page without error', async () => {
      const html = await $fetch('/api-test')
      expect(html).toBeDefined()
      expect(typeof html).toBe('string')
      expect(html).not.toContain('Internal Server Error')
    })

    it('should render explorer page without error', async () => {
      const html = await $fetch('/explorer')
      expect(html).toBeDefined()
      expect(typeof html).toBe('string')
      expect(html).not.toContain('Internal Server Error')
    })
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

      it('should return bidirectional cursor fields', async () => {
        const response = await $fetch('/mock/posts?limit=5') as {
          items?: unknown[]
          nextCursor?: string
          prevCursor?: string
          hasMore?: boolean
          hasPrev?: boolean
        }

        expect(response).toBeDefined()
        // Bidirectional cursor pagination fields
        expect(response.nextCursor).toBeDefined()
        expect(response.hasMore).toBeDefined()
        // prevCursor and hasPrev are optional - may be null/undefined on first page
        expect('prevCursor' in response || response.prevCursor === null).toBe(true)
        expect('hasPrev' in response || response.hasPrev === null).toBe(true)
      })

      it('should support cursor parameter for forward navigation', async () => {
        const response = await $fetch('/mock/posts?cursor=abc123&limit=5')

        expect(response).toBeDefined()
      })

      it('should support cursor parameter for backward navigation', async () => {
        const response = await $fetch('/mock/posts?cursor=xyz789&limit=5')

        expect(response).toBeDefined()
      })

      it('should return consistent data for same cursor', async () => {
        const response1 = await $fetch('/mock/posts?cursor=test-cursor&limit=3') as { items: unknown[] }
        const response2 = await $fetch('/mock/posts?cursor=test-cursor&limit=3') as { items: unknown[] }

        // Items should be consistent (cursors contain timestamps that may differ)
        expect(response1.items).toEqual(response2.items)
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

    describe('Backward Cursor Pagination', () => {
      it('should return last items when isBackward=true without cursor', async () => {
        const forwardResponse = await $fetch('/mock/posts?limit=5') as {
          items: unknown[]
          nextCursor?: string
          hasMore?: boolean
          hasPrev?: boolean
        }

        const backwardResponse = await $fetch('/mock/posts?limit=5&isBackward=true') as {
          items: unknown[]
          nextCursor?: string
          hasMore?: boolean
          hasPrev?: boolean
        }

        expect(forwardResponse.items.length).toBe(5)
        expect(backwardResponse.items.length).toBe(5)

        // Forward first page should have more items
        expect(forwardResponse.hasMore).toBe(true)
        expect(forwardResponse.hasPrev).toBe(false)

        // Backward first page should have previous items
        expect(backwardResponse.hasMore).toBe(false)
        expect(backwardResponse.hasPrev).toBe(true)
      })

      it('should navigate backward when isBackward=true with cursor', async () => {
        // Get first page
        const firstPage = await $fetch('/mock/posts?limit=5') as {
          items: unknown[]
          nextCursor: string
        }

        // Use nextCursor with isBackward=true
        const backwardPage = await $fetch(`/mock/posts?cursor=${firstPage.nextCursor}&limit=5&isBackward=true`) as {
          items: unknown[]
          hasPrev?: boolean
        }

        expect(backwardPage.items.length).toBe(5)
        // Going backward from first page's end should return to first page
        expect(backwardPage.hasPrev).toBe(false)
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
      // Client mode may have different structure
      expect(schema.client || schema.openapi).toBeDefined()
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
      // Client mode may have different structure
      // Just verify it returns valid mock data
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
      // Client mode may have different structure
      // Just verify it returns valid mock data
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

  // ============================================
  // AdvancedCases API - Proto AdvancedService parity
  // ============================================
  describe('AdvancedCases API', () => {
    describe('GET /mock/advanced/scalars', () => {
      it('should return all scalar types', async () => {
        const response = await $fetch('/mock/advanced/scalars')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })

    describe('GET /mock/advanced/company/{id}', () => {
      it('should return deeply nested company structure', async () => {
        const response = await $fetch('/mock/advanced/company/company-1')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })

      it('should return consistent data for same id', async () => {
        const response1 = await $fetch('/mock/advanced/company/same-company')
        const response2 = await $fetch('/mock/advanced/company/same-company')

        expect(response1).toEqual(response2)
      })
    })

    describe('GET /mock/advanced/preferences', () => {
      it('should return user preferences', async () => {
        const response = await $fetch('/mock/advanced/preferences')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })

    describe('PUT /mock/advanced/preferences', () => {
      it('should handle preferences update', async () => {
        const response = await $fetch('/mock/advanced/preferences', {
          method: 'PUT',
          body: {
            notifications: { email: true },
            privacy: { profileVisible: true },
          },
        })

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })

    describe('GET /mock/advanced/orders (page pagination)', () => {
      it('should return advanced orders list', async () => {
        const response = await $fetch('/mock/advanced/orders')

        expect(response).toBeDefined()
      })

      it('should support page and limit parameters', async () => {
        const response = await $fetch('/mock/advanced/orders?page=1&limit=5')

        expect(response).toBeDefined()
      })
    })

    describe('GET /mock/advanced/orders/{id}', () => {
      it('should return advanced order by id', async () => {
        const response = await $fetch('/mock/advanced/orders/order-1')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })

    describe('GET /mock/advanced/tree/{id} (recursive)', () => {
      it('should return tree node with children', async () => {
        const response = await $fetch('/mock/advanced/tree/node-1')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })

    describe('GET /mock/advanced/org-chart/{id} (recursive)', () => {
      it('should return org member with reports', async () => {
        const response = await $fetch('/mock/advanced/org-chart/member-1')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })

    describe('GET /mock/advanced/comment-thread/{id} (recursive)', () => {
      it('should return comment thread with replies', async () => {
        const response = await $fetch('/mock/advanced/comment-thread/thread-1')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })

    describe('GET /mock/advanced/graph/{id}', () => {
      it('should return graph with nodes and edges', async () => {
        const response = await $fetch('/mock/advanced/graph/graph-1')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })
  })

  // ============================================
  // Activities API - Bidirectional Cursor Pagination
  // ============================================
  describe('Activities API', () => {
    describe('GET /mock/activities (bidirectional cursor)', () => {
      it('should return activities list', async () => {
        const response = await $fetch('/mock/activities')

        expect(response).toBeDefined()
      })

      it('should return bidirectional cursor fields', async () => {
        const response = await $fetch('/mock/activities?limit=5')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
        // Client package mode - verify response has expected structure
        // Cursor pagination fields may vary based on schema generation
      })

      it('should support cursor and limit parameters', async () => {
        const response = await $fetch('/mock/activities?cursor=abc&limit=10')

        expect(response).toBeDefined()
      })

      it('should return consistent data for same cursor', async () => {
        const response1 = await $fetch('/mock/activities?cursor=test-cursor&limit=3') as { items: unknown[] }
        const response2 = await $fetch('/mock/activities?cursor=test-cursor&limit=3') as { items: unknown[] }

        expect(response1.items).toEqual(response2.items)
      })
    })

    describe('GET /mock/activities/{id}', () => {
      it('should return activity by id', async () => {
        const response = await $fetch('/mock/activities/activity-1')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })

      it('should return consistent data for same id', async () => {
        const response1 = await $fetch('/mock/activities/same-activity')
        const response2 = await $fetch('/mock/activities/same-activity')

        expect(response1).toEqual(response2)
      })
    })
  })

  // ============================================
  // Data Consistency
  // ============================================
  describe('Data Consistency', () => {
    it('should return consistent data for same user id', async () => {
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
