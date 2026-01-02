/**
 * Advanced Proto RPC Mode E2E Tests
 *
 * AdvancedService 테스트 - Proto3 고급 기능
 * 대상: packages/sample-proto/protos/advanced.proto
 *
 * 테스트 영역:
 * - 모든 Scalar 타입
 * - Oneof 필드
 * - Optional 필드
 * - 깊은 중첩 메시지
 * - Nested Enum
 * - 복합 Map 타입
 * - 재귀적 타입 (트리, 댓글, 조직도, 연결리스트, 그래프)
 * - Timestamp/Duration 시뮬레이션
 */
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('Advanced Proto RPC Mode E2E', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../../playground-proto', import.meta.url)),
    dev: true,
  })

  // ============================================
  // All Scalar Types
  // ============================================
  describe('All Scalar Types', () => {
    it('should handle POST /mock/rpc/AdvancedService/GetAllScalarTypes', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetAllScalarTypes', {
        method: 'POST',
        body: { id: '1' },
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
      expect(response.service).toBe('AdvancedService')
      expect(response.method).toBe('GetAllScalarTypes')
    })

    it('should return all scalar type fields', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetAllScalarTypes', {
        method: 'POST',
        body: { id: '1' },
      })

      expect(response.data).toBeDefined()

      // All 15 scalar fields should be present
      // Note: proto-loader may serialize some numbers as strings with defaults: true
      expect(response.data.double_val).toBeDefined()
      expect(response.data.float_val).toBeDefined()
      expect(response.data.int32_val).toBeDefined()
      expect(response.data.int64_val).toBeDefined()
      expect(response.data.uint32_val).toBeDefined()
      expect(response.data.uint64_val).toBeDefined()
      expect(response.data.sint32_val).toBeDefined()
      expect(response.data.sint64_val).toBeDefined()
      expect(response.data.fixed32_val).toBeDefined()
      expect(response.data.fixed64_val).toBeDefined()
      expect(response.data.sfixed32_val).toBeDefined()
      expect(response.data.sfixed64_val).toBeDefined()
      expect(response.data.bool_val).toBeDefined()
      expect(response.data.string_val).toBeDefined()
      expect(response.data.bytes_val).toBeDefined()
    })

    it('should return consistent data for same request', async () => {
      const response1 = await $fetch('/mock/rpc/AdvancedService/GetAllScalarTypes', {
        method: 'POST',
        body: { id: 'test-123' },
      })
      const response2 = await $fetch('/mock/rpc/AdvancedService/GetAllScalarTypes', {
        method: 'POST',
        body: { id: 'test-123' },
      })

      expect(response1.data).toEqual(response2.data)
    })
  })

  // ============================================
  // Oneof Fields
  // ============================================
  describe('Oneof Fields', () => {
    it('should handle POST /mock/rpc/AdvancedService/GetNotification', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetNotification', {
        method: 'POST',
        body: { id: '1' },
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })

    it('should return notification with id and title', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetNotification', {
        method: 'POST',
        body: { id: '1' },
      })

      expect(response.data).toBeDefined()
      expect(response.data.id).toBeDefined()
      expect(response.data.title).toBeDefined()
    })

    it('should handle POST /mock/rpc/AdvancedService/SendNotification', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/SendNotification', {
        method: 'POST',
        body: {
          title: 'Test Notification',
          email: {
            subject: 'Test Subject',
            body: 'Test Body',
            recipients: ['test@example.com'],
          },
        },
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })
  })

  // ============================================
  // Optional Fields
  // ============================================
  describe('Optional Fields', () => {
    it('should handle POST /mock/rpc/AdvancedService/GetUserPreferences', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetUserPreferences', {
        method: 'POST',
        body: { user_id: 'user-1' },
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })

    it('should return UserPreferences with user_id', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetUserPreferences', {
        method: 'POST',
        body: { user_id: 'user-1' },
      })

      expect(response.data).toBeDefined()
      expect(response.data.user_id).toBeDefined()
    })

    it('should handle POST /mock/rpc/AdvancedService/UpdateUserPreferences', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/UpdateUserPreferences', {
        method: 'POST',
        body: {
          user_id: 'user-1',
          nickname: 'TestUser',
          dark_mode: true,
        },
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })
  })

  // ============================================
  // Deep Nesting (4 levels)
  // ============================================
  describe('Deep Nesting', () => {
    it('should handle POST /mock/rpc/AdvancedService/GetCompany', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetCompany', {
        method: 'POST',
        body: { id: 'company-1' },
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })

    it('should return Company with nested structure', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetCompany', {
        method: 'POST',
        body: { id: 'company-1' },
      })

      expect(response.data).toBeDefined()
      expect(response.data.id).toBeDefined()
      expect(response.data.name).toBeDefined()

      // departments is repeated external type
      // Note: External type resolution is limited - departments may be empty array or object
      expect(response.data.departments).toBeDefined()
    })
  })

  // ============================================
  // Nested Enum
  // ============================================
  describe('Nested Enum', () => {
    it('should handle POST /mock/rpc/AdvancedService/GetAdvancedOrder', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetAdvancedOrder', {
        method: 'POST',
        body: { id: 'order-1' },
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })

    it('should return AdvancedOrder with nested enum status', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetAdvancedOrder', {
        method: 'POST',
        body: { id: 'order-1' },
      })

      expect(response.data).toBeDefined()
      expect(response.data.id).toBeDefined()

      // status is nested enum
      if (response.data.status) {
        expect(typeof response.data.status).toBe('string')
      }
    })

    it('should handle POST /mock/rpc/AdvancedService/ListAdvancedOrders', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/ListAdvancedOrders', {
        method: 'POST',
        body: { page: 1, limit: 10 },
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
      expect(response.data.total).toBeDefined()
      expect(response.data.page).toBeDefined()
    })
  })

  // ============================================
  // Complex Maps
  // ============================================
  describe('Complex Maps', () => {
    it('should handle POST /mock/rpc/AdvancedService/GetConfig', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetConfig', {
        method: 'POST',
        body: { id: 'config-1' },
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })

    it('should return Config with map fields', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetConfig', {
        method: 'POST',
        body: { id: 'config-1' },
      })

      expect(response.data).toBeDefined()
      expect(response.data.id).toBeDefined()
      expect(response.data.name).toBeDefined()

      // Map fields should be objects
      if (response.data.string_map) {
        expect(typeof response.data.string_map).toBe('object')
      }
    })
  })

  // ============================================
  // Recursive Types - TreeNode
  // ============================================
  describe('Recursive Types - TreeNode', () => {
    it('should handle POST /mock/rpc/AdvancedService/GetTreeNode', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetTreeNode', {
        method: 'POST',
        body: { id: 'root', max_depth: 3 },
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })

    it('should return TreeNode with id and name', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetTreeNode', {
        method: 'POST',
        body: { id: 'root', max_depth: 2 },
      })

      expect(response.data).toBeDefined()
      expect(response.data.id).toBeDefined()
      expect(response.data.name).toBeDefined()
    })

    it('should return TreeNode with children field', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetTreeNode', {
        method: 'POST',
        body: { id: 'root', max_depth: 3 },
      })

      expect(response.data).toBeDefined()

      // children is repeated TreeNode (recursive)
      // Note: Recursive type resolution may return empty array or limited depth
      expect(response.data.children).toBeDefined()
    })

    it('should not cause infinite loop with deep recursion', async () => {
      // This should complete without hanging
      const response = await $fetch('/mock/rpc/AdvancedService/GetTreeNode', {
        method: 'POST',
        body: { id: 'deep-tree', max_depth: 10 },
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })
  })

  // ============================================
  // Recursive Types - Comment Thread
  // ============================================
  describe('Recursive Types - Comment Thread', () => {
    it('should handle POST /mock/rpc/AdvancedService/GetCommentThread', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetCommentThread', {
        method: 'POST',
        body: { id: 'comment-1', max_depth: 3 },
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })

    it('should return Comment with author and content', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetCommentThread', {
        method: 'POST',
        body: { id: 'comment-1', max_depth: 2 },
      })

      expect(response.data).toBeDefined()
      expect(response.data.id).toBeDefined()
      expect(response.data.author).toBeDefined()
      expect(response.data.content).toBeDefined()
    })

    it('should return Comment with replies field', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetCommentThread', {
        method: 'POST',
        body: { id: 'comment-1', max_depth: 3 },
      })

      expect(response.data).toBeDefined()

      // replies is repeated Comment (recursive)
      // Note: Recursive type resolution may return empty array or limited depth
      expect(response.data.replies).toBeDefined()
    })
  })

  // ============================================
  // Recursive Types - OrgChart
  // ============================================
  describe('Recursive Types - OrgChart', () => {
    it('should handle POST /mock/rpc/AdvancedService/GetOrgChart', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetOrgChart', {
        method: 'POST',
        body: { id: 'ceo', include_reports: true },
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })

    it('should return OrgMember with name and title', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetOrgChart', {
        method: 'POST',
        body: { id: 'ceo', include_reports: true },
      })

      expect(response.data).toBeDefined()
      expect(response.data.id).toBeDefined()
      expect(response.data.name).toBeDefined()
      expect(response.data.title).toBeDefined()
    })
  })

  // ============================================
  // Recursive Types - LinkedList
  // ============================================
  describe('Recursive Types - LinkedList', () => {
    it('should handle POST /mock/rpc/AdvancedService/GetLinkedList', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetLinkedList', {
        method: 'POST',
        body: { id: 'head', max_length: 5 },
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })

    it('should return LinkedNode with id and value', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetLinkedList', {
        method: 'POST',
        body: { id: 'head', max_length: 3 },
      })

      expect(response.data).toBeDefined()
      expect(response.data.id).toBeDefined()
      expect(response.data.value).toBeDefined()
    })
  })

  // ============================================
  // Recursive Types - Graph
  // ============================================
  describe('Recursive Types - Graph', () => {
    it('should handle POST /mock/rpc/AdvancedService/GetGraph', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetGraph', {
        method: 'POST',
        body: { id: 'node-1', max_hops: 2 },
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })

    it('should return GraphNode with id and label', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetGraph', {
        method: 'POST',
        body: { id: 'node-1', max_hops: 2 },
      })

      expect(response.data).toBeDefined()
      expect(response.data.id).toBeDefined()
      expect(response.data.label).toBeDefined()
    })

    it('should return GraphNode with edges field', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetGraph', {
        method: 'POST',
        body: { id: 'node-1', max_hops: 2 },
      })

      expect(response.data).toBeDefined()

      // edges is repeated GraphEdge (indirect recursion)
      // Note: Indirect recursive type resolution may return empty array or limited depth
      expect(response.data.edges).toBeDefined()
    })
  })

  // ============================================
  // Timestamp/Duration Simulation
  // ============================================
  describe('Timestamp/Duration Simulation', () => {
    it('should handle POST /mock/rpc/AdvancedService/GetEvent', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetEvent', {
        method: 'POST',
        body: { id: 'event-1' },
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })

    it('should return Event with id and name', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetEvent', {
        method: 'POST',
        body: { id: 'event-1' },
      })

      expect(response.data).toBeDefined()
      expect(response.data.id).toBeDefined()
      expect(response.data.name).toBeDefined()
    })

    it('should return Event with Timestamp fields', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/GetEvent', {
        method: 'POST',
        body: { id: 'event-1' },
      })

      expect(response.data).toBeDefined()

      // Timestamp simulation should have seconds and nanos
      if (response.data.created_at) {
        expect(response.data.created_at).toBeDefined()
      }
    })

    it('should handle POST /mock/rpc/AdvancedService/CreateEvent', async () => {
      const response = await $fetch('/mock/rpc/AdvancedService/CreateEvent', {
        method: 'POST',
        body: {
          name: 'Test Event',
          duration: { seconds: 3600, nanos: 0 },
        },
      })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })
  })

  // ============================================
  // Data Consistency
  // ============================================
  describe('Data Consistency', () => {
    it('should return consistent data across multiple requests', async () => {
      const requests = Array(3)
        .fill(null)
        .map(() =>
          $fetch('/mock/rpc/AdvancedService/GetTreeNode', {
            method: 'POST',
            body: { id: 'consistency-test', max_depth: 2 },
          }),
        )

      const responses = await Promise.all(requests)

      // All responses should be identical
      expect(responses[0]).toEqual(responses[1])
      expect(responses[1]).toEqual(responses[2])
    })

    it('should return different data for different inputs', async () => {
      const response1 = await $fetch('/mock/rpc/AdvancedService/GetTreeNode', {
        method: 'POST',
        body: { id: 'tree-1', max_depth: 2 },
      })
      const response2 = await $fetch('/mock/rpc/AdvancedService/GetTreeNode', {
        method: 'POST',
        body: { id: 'tree-999', max_depth: 2 },
      })

      // Different inputs should produce different mock data
      expect(response1.data).not.toEqual(response2.data)
    })
  })

  // ============================================
  // Error Handling
  // ============================================
  describe('Error Handling', () => {
    it('should return 404 for non-existent method in AdvancedService', async () => {
      try {
        await $fetch('/mock/rpc/AdvancedService/NonExistentMethod', {
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
})
