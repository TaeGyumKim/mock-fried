/**
 * OpenAPI Client Package Mode v7 Format E2E Tests
 *
 * playground-openapi-client-v7 테스트 - openapi-generator v7 형식 파싱 검증
 * 대상: packages/openapi-client-v7 (v7 format TypeScript client)
 *
 * v7 형식 특징:
 * - path: `/users/{id}`.replace(...) 형태 (inline path)
 * - requestParameters.param (dot notation)
 * - 다중 path param에 chained .replace() 호출
 */
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('OpenAPI Client Package v7 Format E2E', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../../playground-openapi-client-v7', import.meta.url)),
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
  // Schema Endpoint - Verify v7 format parsing
  // ============================================
  describe('Schema Endpoint', () => {
    it('should return parsed API endpoints from v7 format client', async () => {
      const response = await $fetch('/mock/__schema') as {
        openapi: {
          paths: Array<{ path: string, method: string }>
          _meta?: {
            source: string
            endpointCount: number
            modelCount: number
          }
        }
      }

      expect(response).toBeDefined()
      expect(response.openapi).toBeDefined()
      expect(response.openapi._meta?.source).toBe('client-package')
      expect(response.openapi._meta?.endpointCount).toBeGreaterThan(0)
      expect(response.openapi.paths).toBeInstanceOf(Array)
      expect(response.openapi.paths.length).toBeGreaterThan(0)
    })

    it('should parse v7 format paths correctly', async () => {
      const response = await $fetch('/mock/__schema') as {
        openapi: {
          paths: Array<{ path: string, method: string }>
        }
      }

      // v7 형식에서 path 파싱 검증
      const pathMap = new Map(response.openapi.paths.map(p => [`${p.method} ${p.path}`, p]))

      // Users API paths
      expect(pathMap.has('GET /users')).toBe(true)
      expect(pathMap.has('POST /users')).toBe(true)
      expect(pathMap.has('GET /users/{id}')).toBe(true)
      expect(pathMap.has('DELETE /users/{id}')).toBe(true)

      // Posts API paths
      expect(pathMap.has('GET /posts')).toBe(true)
      expect(pathMap.has('GET /posts/{postId}')).toBe(true)

      // Health API paths
      expect(pathMap.has('GET /health')).toBe(true)
      expect(pathMap.has('GET /version')).toBe(true)
      expect(pathMap.has('GET /ping')).toBe(true)

      // Comments API paths (nested with multiple path params)
      expect(pathMap.has('GET /posts/{postId}/comments')).toBe(true)
      expect(pathMap.has('GET /posts/{postId}/comments/{commentId}')).toBe(true)
    })
  })

  // ============================================
  // Users API - Page Pagination
  // ============================================
  describe('Users API', () => {
    describe('GET /mock/users', () => {
      it('should return user list', async () => {
        const response = await $fetch('/mock/users')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })

      it('should support pagination parameters', async () => {
        const response = await $fetch('/mock/users?page=1&limit=5')

        expect(response).toBeDefined()
      })

      it('should return consistent data for same query', async () => {
        const response1 = await $fetch('/mock/users?page=1&limit=5')
        const response2 = await $fetch('/mock/users?page=1&limit=5')

        expect(response1).toEqual(response2)
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
    })

    describe('POST /mock/users', () => {
      it('should handle user creation', async () => {
        const response = await $fetch('/mock/users', {
          method: 'POST',
          body: { name: 'Test User', email: 'test@example.com' },
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

        // DELETE typically returns empty response
        expect(response === null || response === undefined || response === '').toBe(true)
      })
    })
  })

  // ============================================
  // Posts API - Cursor Pagination
  // ============================================
  describe('Posts API', () => {
    describe('GET /mock/posts', () => {
      it('should return post list with cursor pagination', async () => {
        const response = await $fetch('/mock/posts') as {
          items: unknown[]
          nextCursor?: string
          hasMore: boolean
        }

        expect(response).toBeDefined()
        expect(response.items).toBeInstanceOf(Array)
        expect(typeof response.hasMore).toBe('boolean')
      })

      it('should support cursor parameter', async () => {
        const response = await $fetch('/mock/posts?limit=5')

        expect(response).toBeDefined()
      })
    })

    describe('GET /mock/posts/{postId}', () => {
      it('should return post by id', async () => {
        const response = await $fetch('/mock/posts/post-123')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })

    describe('GET /mock/users/{authorId}/posts', () => {
      it('should return posts by author', async () => {
        const response = await $fetch('/mock/users/user-123/posts')

        expect(response).toBeDefined()
      })
    })

    describe('Backward Cursor Pagination', () => {
      it('should return last items when isBackward=true without cursor', async () => {
        // Forward pagination (default)
        const forwardResponse = await $fetch('/mock/posts?limit=5') as {
          items: Array<{ id: string }>
          nextCursor?: string
          hasMore: boolean
        }

        // Backward pagination (start from end)
        const backwardResponse = await $fetch('/mock/posts?limit=5&isBackward=true') as {
          items: Array<{ id: string }>
          nextCursor?: string
          hasMore: boolean
        }

        expect(forwardResponse.items.length).toBe(5)
        expect(backwardResponse.items.length).toBe(5)

        // Forward starts from beginning (has more), backward starts from end (no more)
        expect(forwardResponse.hasMore).toBe(true)
        expect(backwardResponse.hasMore).toBe(false)

        // Items should be different (different positions in list)
        expect(forwardResponse.items[0].id).not.toBe(backwardResponse.items[0].id)
      })

      it('should navigate backward when isBackward=true with cursor', async () => {
        // Get first page (forward)
        const firstPage = await $fetch('/mock/posts?limit=5') as {
          items: Array<{ id: string }>
          nextCursor?: string
          hasMore: boolean
        }

        expect(firstPage.nextCursor).toBeDefined()
        expect(firstPage.hasMore).toBe(true)

        // Go backward from anchor using isBackward=true with nextCursor
        // This should return items before the anchor (i.e., back to first page)
        const backPage = await $fetch(`/mock/posts?limit=5&cursor=${firstPage.nextCursor}&isBackward=true`) as {
          items: Array<{ id: string }>
          hasMore: boolean
        }

        // Should go backward from anchor, getting first page items
        expect(backPage.items.length).toBe(5)
        // First page items should match when going backward from anchor
        expect(backPage.items[0].id).toBe(firstPage.items[0].id)
      })
    })
  })

  // ============================================
  // Health API - No Parameters
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
      it('should return ping response', async () => {
        const response = await $fetch('/mock/ping')

        expect(response).toBeDefined()
      })
    })
  })

  // ============================================
  // Comments API - Multiple Path Parameters
  // ============================================
  describe('Comments API - Multiple Path Params', () => {
    describe('GET /mock/posts/{postId}/comments', () => {
      it('should return comments for a post', async () => {
        const response = await $fetch('/mock/posts/post-123/comments')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })

      it('should support limit parameter', async () => {
        const response = await $fetch('/mock/posts/post-123/comments?limit=5')

        expect(response).toBeDefined()
      })
    })

    describe('GET /mock/posts/{postId}/comments/{commentId}', () => {
      it('should return specific comment with two path params', async () => {
        const response = await $fetch('/mock/posts/post-123/comments/comment-456')

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })

      it('should return consistent data for same path params', async () => {
        const response1 = await $fetch('/mock/posts/post-1/comments/comment-1')
        const response2 = await $fetch('/mock/posts/post-1/comments/comment-1')

        expect(response1).toEqual(response2)
      })
    })

    describe('PUT /mock/posts/{postId}/comments/{commentId}', () => {
      it('should handle comment update with two path params', async () => {
        const response = await $fetch('/mock/posts/post-123/comments/comment-456', {
          method: 'PUT',
          body: { content: 'Updated comment' },
        })

        expect(response).toBeDefined()
        expect(typeof response).toBe('object')
      })
    })

    describe('DELETE /mock/posts/{postId}/comments/{commentId}', () => {
      it('should handle comment deletion with two path params', async () => {
        const response = await $fetch('/mock/posts/post-123/comments/comment-456', {
          method: 'DELETE',
        })

        // DELETE typically returns empty response
        expect(response === null || response === undefined || response === '').toBe(true)
      })
    })
  })

  // ============================================
  // Reset Endpoint
  // ============================================
  describe('Reset Endpoint', () => {
    it('should reset cache successfully', async () => {
      const response = await $fetch('/mock/__reset', { method: 'POST' }) as { success: boolean }

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
    })
  })
})
