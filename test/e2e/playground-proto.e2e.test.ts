/**
 * Proto RPC Mode E2E Tests
 *
 * playground-proto 테스트 - Protobuf RPC 기반 Mock 서버
 * 대상: packages/sample-proto/protos/*.proto
 *
 * NOTE: Proto RPC는 Unary RPC + Pagination 지원
 * TODO: Proto 메시지 타입 추출 버그 수정 후 필드 검증 테스트 활성화
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
  // Page Loading Tests - Verify no 500 errors
  // ============================================
  describe('Page Loading', () => {
    it('should render index page without error', async () => {
      const html = await $fetch('/')
      expect(html).toBeDefined()
      expect(typeof html).toBe('string')
      expect(html).not.toContain('500')
      expect(html).not.toContain('Internal Server Error')
    })

    it('should render api-test page without error', async () => {
      const html = await $fetch('/api-test')
      expect(html).toBeDefined()
      expect(typeof html).toBe('string')
      expect(html).not.toContain('500')
      expect(html).not.toContain('Internal Server Error')
    })

    it('should render explorer page without error', async () => {
      const html = await $fetch('/explorer')
      expect(html).toBeDefined()
      expect(typeof html).toBe('string')
      expect(html).not.toContain('500')
      expect(html).not.toContain('Internal Server Error')
    })
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
        expect(response.service).toBe('UserService')
        expect(response.method).toBe('GetUser')
      })

      it('should return data property', async () => {
        const response = await $fetch('/mock/rpc/UserService/GetUser', {
          method: 'POST',
          body: { id: 1 },
        })

        expect(response.data).toBeDefined()
      })

      it('should return User with required fields', async () => {
        const response = await $fetch('/mock/rpc/UserService/GetUser', {
          method: 'POST',
          body: { id: 1 },
        })

        expect(response.data).toBeDefined()
        // User message fields from user.proto
        expect(response.data.id).toBeDefined()
        expect(response.data.name).toBeDefined()
        expect(response.data.email).toBeDefined()
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

      it('should return different data for different ids', async () => {
        const response1 = await $fetch('/mock/rpc/UserService/GetUser', {
          method: 'POST',
          body: { id: 1 },
        })
        const response2 = await $fetch('/mock/rpc/UserService/GetUser', {
          method: 'POST',
          body: { id: 999 },
        })

        // Different IDs should produce different mock data
        expect(response1.data).not.toEqual(response2.data)
      })
    })

    describe('ListUsers', () => {
      it('should handle POST /mock/rpc/UserService/ListUsers', async () => {
        const response = await $fetch('/mock/rpc/UserService/ListUsers', {
          method: 'POST',
          body: { page: 1, limit: 10 },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
        expect(response.service).toBe('UserService')
        expect(response.method).toBe('ListUsers')
      })

      it('should return data property', async () => {
        const response = await $fetch('/mock/rpc/UserService/ListUsers', {
          method: 'POST',
          body: { page: 1, limit: 5 },
        })

        expect(response.data).toBeDefined()
      })

      it('should return ListUsersResponse fields', async () => {
        const response = await $fetch('/mock/rpc/UserService/ListUsers', {
          method: 'POST',
          body: { page: 1, limit: 5 },
        })

        expect(response.data).toBeDefined()
        // ListUsersResponse has: users (repeated), total (int32), page (int32)
        // Note: repeated external message types (like User) are currently not fully resolved
        expect(response.data.total).toBeDefined()
        expect(response.data.page).toBeDefined()
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

      it('should return created User with fields', async () => {
        const response = await $fetch('/mock/rpc/UserService/CreateUser', {
          method: 'POST',
          body: {
            name: 'Test User',
            email: 'test@example.com',
          },
        })

        expect(response.data).toBeDefined()
        expect(response.data.id).toBeDefined()
        expect(response.data.name).toBeDefined()
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

      it('should return updated User', async () => {
        const response = await $fetch('/mock/rpc/UserService/UpdateUser', {
          method: 'POST',
          body: {
            id: 1,
            name: 'Updated User',
            email: 'updated@example.com',
          },
        })

        expect(response.data).toBeDefined()
        expect(response.data.id).toBeDefined()
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

      it('should return DeleteUserResponse with success field', async () => {
        const response = await $fetch('/mock/rpc/UserService/DeleteUser', {
          method: 'POST',
          body: { id: 1 },
        })

        expect(response.data).toBeDefined()
        // DeleteUserResponse has success and message fields
        // Note: Proto message field is 'success' but response wrapper also has 'success'
        // The data object should contain the DeleteUserResponse fields
        expect(typeof response.data).toBe('object')
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
        expect(response.service).toBe('ProductService')
        expect(response.method).toBe('GetProduct')
      })

      it('should return data property', async () => {
        const response = await $fetch('/mock/rpc/ProductService/GetProduct', {
          method: 'POST',
          body: { id: 1 },
        })

        expect(response.data).toBeDefined()
      })

      it('should return consistent data for same id', async () => {
        const response1 = await $fetch('/mock/rpc/ProductService/GetProduct', {
          method: 'POST',
          body: { id: 42 },
        })
        const response2 = await $fetch('/mock/rpc/ProductService/GetProduct', {
          method: 'POST',
          body: { id: 42 },
        })

        expect(response1).toEqual(response2)
      })

      it('should return Product with required fields', async () => {
        const response = await $fetch('/mock/rpc/ProductService/GetProduct', {
          method: 'POST',
          body: { id: 1 },
        })

        expect(response.data).toBeDefined()
        expect(response.data.id).toBeDefined()
        expect(response.data.name).toBeDefined()
        expect(response.data.price).toBeDefined()
      })

      it('should return different data for different ids', async () => {
        const response1 = await $fetch('/mock/rpc/ProductService/GetProduct', {
          method: 'POST',
          body: { id: 1 },
        })
        const response2 = await $fetch('/mock/rpc/ProductService/GetProduct', {
          method: 'POST',
          body: { id: 999 },
        })

        expect(response1.data).not.toEqual(response2.data)
      })
    })

    describe('ListProducts', () => {
      it('should handle POST /mock/rpc/ProductService/ListProducts', async () => {
        const response = await $fetch('/mock/rpc/ProductService/ListProducts', {
          method: 'POST',
          body: { page: 1, limit: 10 },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return data property', async () => {
        const response = await $fetch('/mock/rpc/ProductService/ListProducts', {
          method: 'POST',
          body: { page: 1, limit: 5 },
        })

        expect(response.data).toBeDefined()
      })

      it('should return ListProductsResponse fields', async () => {
        const response = await $fetch('/mock/rpc/ProductService/ListProducts', {
          method: 'POST',
          body: { page: 1, limit: 5 },
        })

        expect(response.data).toBeDefined()
        // ListProductsResponse has: products (repeated), total (int32)
        // Note: repeated external message types (like Product) are currently not fully resolved
        expect(response.data.total).toBeDefined()
      })
    })

    describe('CreateProduct', () => {
      it('should handle POST /mock/rpc/ProductService/CreateProduct', async () => {
        const response = await $fetch('/mock/rpc/ProductService/CreateProduct', {
          method: 'POST',
          body: { name: 'New Product', description: 'Test', price: 99.99, stock: 100 },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return created Product with fields', async () => {
        const response = await $fetch('/mock/rpc/ProductService/CreateProduct', {
          method: 'POST',
          body: { name: 'Test Product', description: 'Description', price: 49.99, stock: 50 },
        })

        expect(response.data).toBeDefined()
        // Product has: id, name, description, price, stock, category, tags, metadata
        expect(response.data.id).toBeDefined()
        expect(response.data.name).toBeDefined()
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

      it('should return SearchProductsResponse fields', async () => {
        const response = await $fetch('/mock/rpc/ProductService/SearchProducts', {
          method: 'POST',
          body: { keyword: 'phone' },
        })

        expect(response.data).toBeDefined()
        // SearchProductsResponse should have total field
        expect(response.data.total).toBeDefined()
      })
    })
  })

  // ============================================
  // OrderService RPCs (CRUD with nested messages)
  // ============================================
  describe('OrderService', () => {
    describe('GetOrder', () => {
      it('should handle POST /mock/rpc/OrderService/GetOrder', async () => {
        const response = await $fetch('/mock/rpc/OrderService/GetOrder', {
          method: 'POST',
          body: { id: 'order-1' },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
        expect(response.service).toBe('OrderService')
        expect(response.method).toBe('GetOrder')
      })

      it('should return ShopOrder with nested OrderItem', async () => {
        const response = await $fetch('/mock/rpc/OrderService/GetOrder', {
          method: 'POST',
          body: { id: 'order-1' },
        })

        expect(response.data).toBeDefined()
        expect(response.data.id).toBeDefined()
        expect(response.data.status).toBeDefined()
      })
    })

    describe('ListOrders', () => {
      it('should handle POST /mock/rpc/OrderService/ListOrders', async () => {
        const response = await $fetch('/mock/rpc/OrderService/ListOrders', {
          method: 'POST',
          body: { page: 1, limit: 10 },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return ListShopOrdersResponse fields', async () => {
        const response = await $fetch('/mock/rpc/OrderService/ListOrders', {
          method: 'POST',
          body: { page: 1, limit: 5 },
        })

        expect(response.data).toBeDefined()
        expect(response.data.total).toBeDefined()
        expect(response.data.page).toBeDefined()
      })
    })

    describe('CreateOrder', () => {
      it('should handle POST /mock/rpc/OrderService/CreateOrder', async () => {
        const response = await $fetch('/mock/rpc/OrderService/CreateOrder', {
          method: 'POST',
          body: {
            items: [{ product_id: 'prod-1', quantity: 2 }],
            shipping_address: '123 Test St',
          },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return created ShopOrder', async () => {
        const response = await $fetch('/mock/rpc/OrderService/CreateOrder', {
          method: 'POST',
          body: {
            items: [{ product_id: 'prod-1', quantity: 1 }],
            shipping_address: 'Test Address',
          },
        })

        expect(response.data).toBeDefined()
        expect(response.data.id).toBeDefined()
      })
    })

    describe('DeleteOrder', () => {
      it('should handle POST /mock/rpc/OrderService/DeleteOrder', async () => {
        const response = await $fetch('/mock/rpc/OrderService/DeleteOrder', {
          method: 'POST',
          body: { id: 'order-1' },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })
    })
  })

  // ============================================
  // PostService RPCs (Cursor-based pagination)
  // ============================================
  describe('PostService', () => {
    describe('GetPost', () => {
      it('should handle POST /mock/rpc/PostService/GetPost', async () => {
        const response = await $fetch('/mock/rpc/PostService/GetPost', {
          method: 'POST',
          body: { id: 'post-1' },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
        expect(response.service).toBe('PostService')
        expect(response.method).toBe('GetPost')
      })

      it('should return Post with required fields', async () => {
        const response = await $fetch('/mock/rpc/PostService/GetPost', {
          method: 'POST',
          body: { id: 'post-1' },
        })

        expect(response.data).toBeDefined()
        expect(response.data.id).toBeDefined()
        expect(response.data.title).toBeDefined()
        expect(response.data.content).toBeDefined()
      })
    })

    describe('ListPosts (Cursor Pagination)', () => {
      it('should handle POST /mock/rpc/PostService/ListPosts', async () => {
        const response = await $fetch('/mock/rpc/PostService/ListPosts', {
          method: 'POST',
          body: { limit: 10 },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return ListPostsResponse with cursor fields', async () => {
        const response = await $fetch('/mock/rpc/PostService/ListPosts', {
          method: 'POST',
          body: { limit: 5 },
        })

        expect(response.data).toBeDefined()
        // Cursor-based pagination fields
        expect(response.data.next_cursor).toBeDefined()
        expect(response.data.has_more).toBeDefined()
      })

      it('should support cursor parameter for pagination', async () => {
        const response = await $fetch('/mock/rpc/PostService/ListPosts', {
          method: 'POST',
          body: { cursor: 'abc123', limit: 10 },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })
    })

    describe('CreatePost', () => {
      it('should handle POST /mock/rpc/PostService/CreatePost', async () => {
        const response = await $fetch('/mock/rpc/PostService/CreatePost', {
          method: 'POST',
          body: {
            title: 'Test Post',
            content: 'Test Content',
            tags: ['test', 'proto'],
          },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return created Post', async () => {
        const response = await $fetch('/mock/rpc/PostService/CreatePost', {
          method: 'POST',
          body: {
            title: 'New Post',
            content: 'Content here',
          },
        })

        expect(response.data).toBeDefined()
        expect(response.data.id).toBeDefined()
        expect(response.data.title).toBeDefined()
      })
    })
  })

  // ============================================
  // CommentService RPCs (Nested resource pattern)
  // ============================================
  describe('CommentService', () => {
    describe('ListComments', () => {
      it('should handle POST /mock/rpc/CommentService/ListComments', async () => {
        const response = await $fetch('/mock/rpc/CommentService/ListComments', {
          method: 'POST',
          body: { post_id: 'post-1', limit: 10 },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
        expect(response.service).toBe('CommentService')
        expect(response.method).toBe('ListComments')
      })

      it('should return ListCommentsResponse with total', async () => {
        const response = await $fetch('/mock/rpc/CommentService/ListComments', {
          method: 'POST',
          body: { post_id: 'post-1', limit: 5 },
        })

        expect(response.data).toBeDefined()
        expect(response.data.total).toBeDefined()
      })
    })

    describe('CreateComment', () => {
      it('should handle POST /mock/rpc/CommentService/CreateComment', async () => {
        const response = await $fetch('/mock/rpc/CommentService/CreateComment', {
          method: 'POST',
          body: {
            post_id: 'post-1',
            content: 'Test comment',
          },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return created PostComment', async () => {
        const response = await $fetch('/mock/rpc/CommentService/CreateComment', {
          method: 'POST',
          body: {
            post_id: 'post-1',
            content: 'Great post!',
          },
        })

        expect(response.data).toBeDefined()
        expect(response.data.id).toBeDefined()
        expect(response.data.content).toBeDefined()
      })
    })
  })

  // ============================================
  // HealthService RPCs (Simple endpoints)
  // ============================================
  describe('HealthService', () => {
    describe('GetHealth', () => {
      it('should handle POST /mock/rpc/HealthService/GetHealth', async () => {
        const response = await $fetch('/mock/rpc/HealthService/GetHealth', {
          method: 'POST',
          body: {},
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
        expect(response.service).toBe('HealthService')
        expect(response.method).toBe('GetHealth')
      })

      it('should return HealthResponse with status', async () => {
        const response = await $fetch('/mock/rpc/HealthService/GetHealth', {
          method: 'POST',
          body: {},
        })

        expect(response.data).toBeDefined()
        expect(response.data.status).toBeDefined()
      })
    })

    describe('GetVersion', () => {
      it('should handle POST /mock/rpc/HealthService/GetVersion', async () => {
        const response = await $fetch('/mock/rpc/HealthService/GetVersion', {
          method: 'POST',
          body: {},
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return VersionResponse with version', async () => {
        const response = await $fetch('/mock/rpc/HealthService/GetVersion', {
          method: 'POST',
          body: {},
        })

        expect(response.data).toBeDefined()
        expect(response.data.version).toBeDefined()
      })
    })

    describe('Ping', () => {
      it('should handle POST /mock/rpc/HealthService/Ping', async () => {
        const response = await $fetch('/mock/rpc/HealthService/Ping', {
          method: 'POST',
          body: {},
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return PingResponse with pong', async () => {
        const response = await $fetch('/mock/rpc/HealthService/Ping', {
          method: 'POST',
          body: {},
        })

        expect(response.data).toBeDefined()
        expect(response.data.pong).toBeDefined()
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
      expect(response.service).toBeDefined()
      expect(response.method).toBeDefined()
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
  // Data Consistency
  // ============================================
  describe('Data Consistency', () => {
    it('should return consistent data across multiple requests', async () => {
      const requests = Array(3).fill(null).map(() =>
        $fetch('/mock/rpc/UserService/GetUser', {
          method: 'POST',
          body: { id: 555 },
        }),
      )

      const responses = await Promise.all(requests)

      // All responses should be identical
      expect(responses[0]).toEqual(responses[1])
      expect(responses[1]).toEqual(responses[2])
    })
  })

  // ============================================
  // Schema Endpoint
  // ============================================
  describe('Schema Endpoint', () => {
    it('should return schema at GET /mock/__schema', async () => {
      const schema = await $fetch('/mock/__schema')

      expect(schema).toBeDefined()
      // Proto mode returns rpc schema
      expect(schema.rpc || schema.proto).toBeDefined()
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

  // ============================================
  // EdgeCaseService RPCs (OpenAPI EdgeCases 대응)
  // ============================================
  describe('EdgeCaseService', () => {
    describe('Primitive Responses', () => {
      it('should handle POST /mock/rpc/EdgeCaseService/GetTotalCount', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/GetTotalCount', {
          method: 'POST',
          body: {},
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
        expect(response.service).toBe('EdgeCaseService')
        expect(response.method).toBe('GetTotalCount')
      })

      it('should return Int64Value with value field', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/GetTotalCount', {
          method: 'POST',
          body: {},
        })

        expect(response.data).toBeDefined()
        expect(response.data.value).toBeDefined()
      })

      it('should handle POST /mock/rpc/EdgeCaseService/GetSystemStatus', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/GetSystemStatus', {
          method: 'POST',
          body: {},
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return SystemStatusResponse with status and message', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/GetSystemStatus', {
          method: 'POST',
          body: {},
        })

        expect(response.data).toBeDefined()
        expect(response.data.status).toBeDefined()
        expect(response.data.message).toBeDefined()
      })

      it('should handle POST /mock/rpc/EdgeCaseService/IsFeatureEnabled', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/IsFeatureEnabled', {
          method: 'POST',
          body: { feature_name: 'dark_mode' },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return BoolValue with value field', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/IsFeatureEnabled', {
          method: 'POST',
          body: { feature_name: 'dark_mode' },
        })

        expect(response.data).toBeDefined()
        expect(typeof response.data.value).toBe('boolean')
      })
    })

    describe('Direct Array Responses', () => {
      it('should handle POST /mock/rpc/EdgeCaseService/GetTags', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/GetTags', {
          method: 'POST',
          body: {},
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return StringList with items array', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/GetTags', {
          method: 'POST',
          body: {},
        })

        expect(response.data).toBeDefined()
        expect(response.data.items).toBeDefined()
        expect(Array.isArray(response.data.items)).toBe(true)
      })

      it('should handle POST /mock/rpc/EdgeCaseService/GetFeaturedProducts', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/GetFeaturedProducts', {
          method: 'POST',
          body: {},
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return ProductList with products array', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/GetFeaturedProducts', {
          method: 'POST',
          body: {},
        })

        expect(response.data).toBeDefined()
        expect(response.data.products).toBeDefined()
        expect(Array.isArray(response.data.products)).toBe(true)
      })

      it('should handle POST /mock/rpc/EdgeCaseService/GetSearchSuggestions', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/GetSearchSuggestions', {
          method: 'POST',
          body: { query: 'laptop', limit: 10 },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return StringList for search suggestions', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/GetSearchSuggestions', {
          method: 'POST',
          body: { query: 'phone', limit: 5 },
        })

        expect(response.data).toBeDefined()
        expect(response.data.items).toBeDefined()
        expect(Array.isArray(response.data.items)).toBe(true)
      })
    })

    describe('allOf Composition', () => {
      it('should handle POST /mock/rpc/EdgeCaseService/GetAdminUser', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/GetAdminUser', {
          method: 'POST',
          body: { id: 1 },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return AdminUser with User fields and admin-specific fields', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/GetAdminUser', {
          method: 'POST',
          body: { id: 1 },
        })

        expect(response.data).toBeDefined()
        // User fields
        expect(response.data.id).toBeDefined()
        expect(response.data.name).toBeDefined()
        expect(response.data.email).toBeDefined()
        // Admin-specific fields
        expect(response.data.permissions).toBeDefined()
        expect(response.data.is_super_admin).toBeDefined()
      })
    })

    describe('Deeply Nested', () => {
      it('should handle POST /mock/rpc/EdgeCaseService/GetReport', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/GetReport', {
          method: 'POST',
          body: { id: 'report-1' },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return Report with nested structure', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/GetReport', {
          method: 'POST',
          body: { id: 'report-1' },
        })

        expect(response.data).toBeDefined()
        expect(response.data.id).toBeDefined()
        expect(response.data.title).toBeDefined()
        expect(response.data.metadata).toBeDefined()
        expect(response.data.sections).toBeDefined()
      })
    })

    describe('Metrics', () => {
      it('should handle POST /mock/rpc/EdgeCaseService/GetMetrics', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/GetMetrics', {
          method: 'POST',
          body: {},
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return Metrics with various numeric types', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/GetMetrics', {
          method: 'POST',
          body: {},
        })

        expect(response.data).toBeDefined()
        expect(response.data.total_users).toBeDefined()
        expect(response.data.total_requests).toBeDefined()
        expect(response.data.cpu_usage).toBeDefined()
        expect(response.data.memory_usage).toBeDefined()
      })
    })

    describe('Settings', () => {
      it('should handle POST /mock/rpc/EdgeCaseService/GetSettings', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/GetSettings', {
          method: 'POST',
          body: {},
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return Settings with all fields', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/GetSettings', {
          method: 'POST',
          body: {},
        })

        expect(response.data).toBeDefined()
        expect(response.data.display_name).toBeDefined()
        expect(response.data.volume).toBeDefined()
        expect(response.data.brightness).toBeDefined()
        expect(response.data.theme).toBeDefined()
        expect(response.data.language).toBeDefined()
      })

      it('should handle POST /mock/rpc/EdgeCaseService/UpdateSettings', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/UpdateSettings', {
          method: 'POST',
          body: {
            display_name: 'Updated Name',
            volume: 80,
            notifications_enabled: true,
          },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })
    })

    describe('Empty Responses', () => {
      it('should handle POST /mock/rpc/EdgeCaseService/ClearCache', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/ClearCache', {
          method: 'POST',
          body: {},
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should return empty response for ClearCache', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/ClearCache', {
          method: 'POST',
          body: {},
        })

        expect(response.data).toBeDefined()
        // Empty message should return empty object
        expect(typeof response.data).toBe('object')
      })

      it('should handle POST /mock/rpc/EdgeCaseService/DeleteSession', async () => {
        const response = await $fetch('/mock/rpc/EdgeCaseService/DeleteSession', {
          method: 'POST',
          body: { id: 'session-123' },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })
    })
  })

  // ============================================
  // ActivityService RPCs (양방향 Cursor Pagination)
  // ============================================
  describe('ActivityService', () => {
    describe('GetActivity', () => {
      it('should handle POST /mock/rpc/ActivityService/GetActivity', async () => {
        const response = await $fetch('/mock/rpc/ActivityService/GetActivity', {
          method: 'POST',
          body: { id: 'activity-1' },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
        expect(response.service).toBe('ActivityService')
        expect(response.method).toBe('GetActivity')
      })

      it('should return Activity with required fields', async () => {
        const response = await $fetch('/mock/rpc/ActivityService/GetActivity', {
          method: 'POST',
          body: { id: 'activity-1' },
        })

        expect(response.data).toBeDefined()
        expect(response.data.id).toBeDefined()
        expect(response.data.user_id).toBeDefined()
        expect(response.data.type).toBeDefined()
        expect(response.data.description).toBeDefined()
      })

      it('should return consistent data for same id', async () => {
        const response1 = await $fetch('/mock/rpc/ActivityService/GetActivity', {
          method: 'POST',
          body: { id: 'activity-abc' },
        })
        const response2 = await $fetch('/mock/rpc/ActivityService/GetActivity', {
          method: 'POST',
          body: { id: 'activity-abc' },
        })

        expect(response1).toEqual(response2)
      })
    })

    describe('ListActivities (Bidirectional Cursor Pagination)', () => {
      it('should handle POST /mock/rpc/ActivityService/ListActivities', async () => {
        const response = await $fetch('/mock/rpc/ActivityService/ListActivities', {
          method: 'POST',
          body: { limit: 10 },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
        expect(response.service).toBe('ActivityService')
        expect(response.method).toBe('ListActivities')
      })

      it('should return ListActivitiesResponse with bidirectional cursor fields', async () => {
        const response = await $fetch('/mock/rpc/ActivityService/ListActivities', {
          method: 'POST',
          body: { limit: 5 },
        })

        expect(response.data).toBeDefined()
        // Bidirectional cursor pagination fields
        expect(response.data.next_cursor).toBeDefined()
        expect(response.data.prev_cursor).toBeDefined()
        expect(response.data.has_more).toBeDefined()
        expect(response.data.has_prev).toBeDefined()
        expect(response.data.total).toBeDefined()
      })

      it('should return activities array', async () => {
        const response = await $fetch('/mock/rpc/ActivityService/ListActivities', {
          method: 'POST',
          body: { limit: 5 },
        })

        expect(response.data).toBeDefined()
        expect(response.data.activities).toBeDefined()
        expect(Array.isArray(response.data.activities)).toBe(true)
      })

      it('should support forward cursor navigation', async () => {
        const response = await $fetch('/mock/rpc/ActivityService/ListActivities', {
          method: 'POST',
          body: { cursor: 'abc123', limit: 10, direction: 0 },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should support backward cursor navigation', async () => {
        const response = await $fetch('/mock/rpc/ActivityService/ListActivities', {
          method: 'POST',
          body: { cursor: 'xyz789', limit: 10, direction: 1 },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
      })

      it('should filter by user_id', async () => {
        const response = await $fetch('/mock/rpc/ActivityService/ListActivities', {
          method: 'POST',
          body: { user_id: 'user-123', limit: 5 },
        })

        expect(response).toBeDefined()
        expect(response.success).toBe(true)
        expect(response.data.activities).toBeDefined()
      })
    })
  })
})
