/**
 * OpenAPI Handler E2E Tests
 *
 * 실제 HTTP 요청을 통한 핸들러 동작 검증
 */
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('OpenAPI Handler E2E', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/handlers', import.meta.url)),
    dev: true,
  })

  describe('GET requests', () => {
    it('should return mock data for GET /mock/users', async () => {
      const response = await $fetch('/mock/users')

      expect(response).toBeDefined()
      expect(Array.isArray(response)).toBe(true)
    })

    it('should return mock data for GET /mock/users/:id', async () => {
      const response = await $fetch('/mock/users/123')

      expect(response).toBeDefined()
      expect(typeof response).toBe('object')
    })

    it('should return consistent data for same path params', async () => {
      const response1 = await $fetch('/mock/users/abc')
      const response2 = await $fetch('/mock/users/abc')

      // 동일한 seed(path param)로 동일한 결과
      expect(response1).toEqual(response2)
    })

    it('should return different data for different path params', async () => {
      const response1 = await $fetch('/mock/users/user1')
      const response2 = await $fetch('/mock/users/user2')

      // 다른 seed(path param)로 다른 결과
      expect(response1).not.toEqual(response2)
    })
  })

  describe('POST requests', () => {
    it('should handle POST /mock/posts with body', async () => {
      const response = await $fetch('/mock/posts', {
        method: 'POST',
        body: {
          title: 'Test Post',
          content: 'Test Content',
        },
      })

      expect(response).toBeDefined()
      expect(typeof response).toBe('object')
    })
  })

  describe('Schema endpoint', () => {
    it('should return schema at GET /mock/__schema', async () => {
      const schema = await $fetch('/mock/__schema')

      expect(schema).toBeDefined()
      expect(schema.openapi).toBeDefined()
      expect(schema.openapi.info).toBeDefined()
      expect(schema.openapi.info.title).toBe('Test API')
      expect(schema.openapi.paths).toBeDefined()
      expect(Array.isArray(schema.openapi.paths)).toBe(true)
    })

    it('should include path-level params in schema', async () => {
      const schema = await $fetch('/mock/__schema')

      // /users/{id} 엔드포인트 찾기
      const userEndpoint = schema.openapi.paths.find(
        (p: { path: string, method: string }) => p.path === '/users/{id}' && p.method === 'GET',
      )

      expect(userEndpoint).toBeDefined()
      expect(userEndpoint.parameters).toBeDefined()
      expect(userEndpoint.parameters.some((p: { name: string }) => p.name === 'id')).toBe(true)
    })
  })

  describe('Reset endpoint', () => {
    it('should reset cache at POST /mock/__reset', async () => {
      const response = await $fetch('/mock/__reset', { method: 'POST' })

      expect(response).toBeDefined()
      expect(response.success).toBe(true)
      expect(response.message).toContain('reset')
    })
  })

  describe('Error handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      try {
        await $fetch('/mock/nonexistent/endpoint')
        expect.fail('Should have thrown an error')
      }
      catch (error: unknown) {
        const fetchError = error as { response?: { status?: number } }
        expect(fetchError.response?.status).toBe(404)
      }
    })
  })
})
