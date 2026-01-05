/**
 * Swagger 2.0 Spec File Mode E2E Tests
 *
 * playground-swagger 테스트 - Swagger 2.0 YAML 파일 기반 Mock 서버
 * 대상: packages/sample-swagger/swagger.yaml
 *
 * OpenAPI 3.x E2E 테스트와 동일한 구조로 Swagger 2.0 지원 검증
 */
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('Swagger 2.0 Spec File Mode E2E', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../../playground-swagger', import.meta.url)),
    dev: true,
  })

  // ============================================
  // Page Loading Tests
  // ============================================
  describe('Page Loading', () => {
    it('should render index page without error', async () => {
      const html = await $fetch('/')
      expect(html).toBeDefined()
      expect(typeof html).toBe('string')
      expect(html).not.toContain('500')
      expect(html).not.toContain('Internal Server Error')
    })
  })

  // ============================================
  // Schema Endpoint - Version Detection
  // ============================================
  describe('Schema Endpoint', () => {
    it('should return schema with swagger2 version', async () => {
      const response = await $fetch('/mock/__schema') as {
        openapi?: {
          _meta?: {
            specVersion?: string
          }
        }
      }

      expect(response).toBeDefined()
      expect(response.openapi).toBeDefined()
      expect(response.openapi?._meta?.specVersion).toBe('swagger2')
    })

    it('should contain API info', async () => {
      const response = await $fetch('/mock/__schema') as {
        openapi?: {
          info?: {
            title?: string
            version?: string
          }
        }
      }

      expect(response.openapi?.info).toBeDefined()
      expect(response.openapi?.info?.title).toBeDefined()
      expect(response.openapi?.info?.version).toBeDefined()
    })

    it('should contain paths', async () => {
      const response = await $fetch('/mock/__schema') as {
        openapi?: {
          paths?: unknown[]
        }
      }

      expect(response.openapi?.paths).toBeDefined()
      expect(Array.isArray(response.openapi?.paths)).toBe(true)
      expect(response.openapi!.paths!.length).toBeGreaterThan(0)
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
      it('should handle user deletion (204 No Content)', async () => {
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

      it('should return cursor pagination fields', async () => {
        const response = await $fetch('/mock/posts?limit=5') as {
          items?: unknown[]
          nextCursor?: string
          hasMore?: boolean
        }

        expect(response).toBeDefined()
        expect(response.nextCursor).toBeDefined()
        expect(response.hasMore).toBeDefined()
      })

      it('should support cursor parameter', async () => {
        const response = await $fetch('/mock/posts?cursor=abc123&limit=5')
        expect(response).toBeDefined()
      })

      it('should return consistent data for same cursor', async () => {
        const response1 = await $fetch('/mock/posts?cursor=test-cursor&limit=3') as { items: unknown[] }
        const response2 = await $fetch('/mock/posts?cursor=test-cursor&limit=3') as { items: unknown[] }
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
  })

  // ============================================
  // Comments API - Nested Resource
  // ============================================
  describe('Comments API', () => {
    describe('GET /mock/posts/{postId}/comments', () => {
      it('should return comments for a post', async () => {
        const response = await $fetch('/mock/posts/post-123/comments')
        expect(response).toBeDefined()
      })
    })

    describe('POST /mock/posts/{postId}/comments', () => {
      it('should handle comment creation', async () => {
        const response = await $fetch('/mock/posts/post-123/comments', {
          method: 'POST',
          body: {
            content: 'Test comment content',
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
    it('should return health status', async () => {
      const response = await $fetch('/mock/health')
      expect(response).toBeDefined()
    })

    it('should return version info', async () => {
      const response = await $fetch('/mock/version')
      expect(response).toBeDefined()
    })

    it('should return pong for ping', async () => {
      const response = await $fetch('/mock/ping') as { pong?: boolean }
      expect(response).toBeDefined()
      expect(typeof response).toBe('object')
    })

    it('should return tags array', async () => {
      const response = await $fetch('/mock/tags')
      expect(response).toBeDefined()
      expect(Array.isArray(response)).toBe(true)
    })
  })

  // ============================================
  // Edge Cases - Primitive Response Types
  // ============================================
  describe('EdgeCases - Primitive Responses', () => {
    it('should return integer for /stats/count', async () => {
      const response = await $fetch('/mock/stats/count')
      expect(response).toBeDefined()
      expect(typeof response).toBe('number')
      expect(Number.isInteger(response)).toBe(true)
    })

    it('should return string for /stats/status', async () => {
      const response = await $fetch('/mock/stats/status')
      expect(response).toBeDefined()
      expect(typeof response).toBe('string')
      expect(['healthy', 'degraded', 'critical']).toContain(response)
    })

    it('should return boolean for /stats/enabled', async () => {
      const response = await $fetch('/mock/stats/enabled')
      expect(response).toBeDefined()
      expect(typeof response).toBe('boolean')
    })
  })

  // ============================================
  // Edge Cases - Multiple Path Parameters
  // ============================================
  describe('EdgeCases - Multiple Path Parameters', () => {
    it('should handle 2 path parameters', async () => {
      const response = await $fetch('/mock/categories/cat-1/products/prod-1')
      expect(response).toBeDefined()
      expect(typeof response).toBe('object')
    })

    it('should handle 3 path parameters', async () => {
      const response = await $fetch('/mock/users/user-1/orders/order-1/items/item-1')
      expect(response).toBeDefined()
      expect(typeof response).toBe('object')
    })
  })

  // ============================================
  // Edge Cases - Direct Array Response
  // ============================================
  describe('EdgeCases - Direct Array Response', () => {
    it('should return direct array for /featured/products', async () => {
      const response = await $fetch('/mock/featured/products')
      expect(response).toBeDefined()
      expect(Array.isArray(response)).toBe(true)
    })

    it('should return string array for /search/suggestions', async () => {
      const response = await $fetch('/mock/search/suggestions?q=test')
      expect(response).toBeDefined()
      expect(Array.isArray(response)).toBe(true)
    })
  })

  // ============================================
  // Edge Cases - Schema Composition (allOf)
  // ============================================
  describe('EdgeCases - Schema Composition', () => {
    it('should handle allOf composition', async () => {
      const response = await $fetch('/mock/admin/users/admin-123')
      expect(response).toBeDefined()
      expect(typeof response).toBe('object')
    })
  })

  // ============================================
  // Edge Cases - Deeply Nested Objects
  // ============================================
  describe('EdgeCases - Deeply Nested', () => {
    it('should generate deeply nested object', async () => {
      const response = await $fetch('/mock/reports/report-123') as {
        id?: string
        metadata?: {
          author?: {
            department?: {
              organization?: {
                name?: string
              }
            }
          }
        }
      }

      expect(response).toBeDefined()
      expect(response.metadata).toBeDefined()
      expect(response.metadata?.author).toBeDefined()
      expect(response.metadata?.author?.department).toBeDefined()
      expect(response.metadata?.author?.department?.organization).toBeDefined()
    })
  })

  // ============================================
  // Edge Cases - Recursive Schema
  // ============================================
  describe('EdgeCases - Recursive Schema', () => {
    it('should handle recursive category tree', async () => {
      const response = await $fetch('/mock/categories/cat-1/tree') as {
        id?: string
        name?: string
        children?: unknown[]
      }

      expect(response).toBeDefined()
      expect(response.id).toBeDefined()
      expect(response.name).toBeDefined()
      // Children might be present or not depending on implementation
    })
  })

  // ============================================
  // Edge Cases - Various Numeric Types
  // ============================================
  describe('EdgeCases - Numeric Types', () => {
    it('should generate metrics with various numeric types', async () => {
      const response = await $fetch('/mock/analytics/metrics') as {
        totalUsers?: number
        cpuUsage?: number
        memoryUsage?: number
      }

      expect(response).toBeDefined()
      expect(typeof response).toBe('object')
    })
  })

  // ============================================
  // Edge Cases - Date Formats
  // ============================================
  describe('EdgeCases - Date Formats', () => {
    it('should generate event with date formats', async () => {
      const response = await $fetch('/mock/events/event-123') as {
        id?: string
        eventDate?: string
        startTime?: string
      }

      expect(response).toBeDefined()
      expect(response.eventDate).toBeDefined()
      expect(response.startTime).toBeDefined()
    })
  })

  // ============================================
  // Edge Cases - Map/Dictionary Types
  // ============================================
  describe('EdgeCases - Map Types', () => {
    it('should generate config map with additionalProperties', async () => {
      const response = await $fetch('/mock/config')
      expect(response).toBeDefined()
      expect(typeof response).toBe('object')
    })
  })

  // ============================================
  // Edge Cases - 204 No Content
  // ============================================
  describe('EdgeCases - 204 No Content', () => {
    it('should handle cache clear (204)', async () => {
      const response = await $fetch('/mock/cache', {
        method: 'DELETE',
      })
      expect(response === null || response === undefined || response === '').toBe(true)
    })

    it('should handle session delete (204)', async () => {
      const response = await $fetch('/mock/sessions/session-123', {
        method: 'DELETE',
      })
      expect(response === null || response === undefined || response === '').toBe(true)
    })
  })

  // ============================================
  // Meta Endpoints
  // ============================================
  describe('Meta Endpoints', () => {
    it('should reset cache via POST /mock/__reset', async () => {
      const response = await $fetch('/mock/__reset', {
        method: 'POST',
      })

      expect(response).toBeDefined()
    })
  })

  // ============================================
  // Data Consistency
  // ============================================
  describe('Data Consistency', () => {
    it('should return consistent data for same seed', async () => {
      const response1 = await $fetch('/mock/users?page=1&limit=3')
      const response2 = await $fetch('/mock/users?page=1&limit=3')
      expect(response1).toEqual(response2)
    })

    it('should return different data for different ids', async () => {
      // Use different user IDs instead of pagination params for data consistency test
      const response1 = await $fetch('/mock/users/user-test-1')
      const response2 = await $fetch('/mock/users/user-test-2')
      expect(response1).not.toEqual(response2)
    })
  })
})
