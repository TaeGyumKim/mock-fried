/**
 * Spec Loader Unit Tests
 *
 * Tests for the spec-loader utility that handles:
 * - Swagger 2.0 and OpenAPI 3.x loading
 * - Version detection
 * - Schema definitions access
 * - Parameter merging
 */
import { describe, it, expect } from 'vitest'
import { join } from 'pathe'

const OPENAPI_SPEC_PATH = join(process.cwd(), 'packages/sample-openapi/openapi.yaml')
const SWAGGER_SPEC_PATH = join(process.cwd(), 'packages/sample-swagger/swagger.yaml')

describe('Spec Loader', () => {
  describe('loadSpec', () => {
    it('should load OpenAPI 3.x spec', async () => {
      const { loadSpec } = await import('../src/runtime/server/utils/spec-loader')

      const result = await loadSpec(OPENAPI_SPEC_PATH)

      expect(result).toBeDefined()
      expect(result.version).toBe('openapi3')
      expect(result.spec).toBeDefined()
      expect(result.dereferenced).toBeDefined()
    })

    it('should load Swagger 2.0 spec', async () => {
      const { loadSpec } = await import('../src/runtime/server/utils/spec-loader')

      const result = await loadSpec(SWAGGER_SPEC_PATH)

      expect(result).toBeDefined()
      expect(result.version).toBe('swagger2')
      expect(result.spec).toBeDefined()
      expect(result.dereferenced).toBeDefined()
    })

    it('should dereference $ref in spec', async () => {
      const { loadSpec } = await import('../src/runtime/server/utils/spec-loader')

      const result = await loadSpec(OPENAPI_SPEC_PATH)

      // Check that $refs are resolved in dereferenced spec
      const paths = result.dereferenced.paths as Record<string, Record<string, unknown>>
      const getUsersOp = paths['/users']?.get as Record<string, unknown>
      const responses = getUsersOp?.responses as Record<string, Record<string, unknown>>
      const response200 = responses?.['200']

      expect(response200).toBeDefined()
      // The schema should be dereferenced (no $ref)
      const content = response200?.content as Record<string, Record<string, unknown>>
      const jsonContent = content?.['application/json']
      expect(jsonContent?.schema).toBeDefined()
    })

    it('should throw error for non-existent file', async () => {
      const { loadSpec } = await import('../src/runtime/server/utils/spec-loader')

      await expect(loadSpec('/non/existent/path.yaml')).rejects.toThrow()
    })
  })

  describe('isSwagger2', () => {
    it('should return true for Swagger 2.0 spec', async () => {
      const { loadSpec, isSwagger2 } = await import('../src/runtime/server/utils/spec-loader')

      const result = await loadSpec(SWAGGER_SPEC_PATH)

      expect(isSwagger2(result.spec)).toBe(true)
    })

    it('should return false for OpenAPI 3.x spec', async () => {
      const { loadSpec, isSwagger2 } = await import('../src/runtime/server/utils/spec-loader')

      const result = await loadSpec(OPENAPI_SPEC_PATH)

      expect(isSwagger2(result.spec)).toBe(false)
    })
  })

  describe('isOpenApi3', () => {
    it('should return true for OpenAPI 3.x spec', async () => {
      const { loadSpec, isOpenApi3 } = await import('../src/runtime/server/utils/spec-loader')

      const result = await loadSpec(OPENAPI_SPEC_PATH)

      expect(isOpenApi3(result.spec)).toBe(true)
    })

    it('should return false for Swagger 2.0 spec', async () => {
      const { loadSpec, isOpenApi3 } = await import('../src/runtime/server/utils/spec-loader')

      const result = await loadSpec(SWAGGER_SPEC_PATH)

      expect(isOpenApi3(result.spec)).toBe(false)
    })
  })

  describe('getSchemaDefinitions', () => {
    it('should return definitions for Swagger 2.0 spec', async () => {
      const { loadSpec, getSchemaDefinitions } = await import('../src/runtime/server/utils/spec-loader')

      const result = await loadSpec(SWAGGER_SPEC_PATH)
      const schemas = getSchemaDefinitions(result.spec)

      expect(schemas).toBeDefined()
      expect(typeof schemas).toBe('object')
      expect(schemas.User).toBeDefined()
      expect(schemas.Product).toBeDefined()
    })

    it('should return components.schemas for OpenAPI 3.x spec', async () => {
      const { loadSpec, getSchemaDefinitions } = await import('../src/runtime/server/utils/spec-loader')

      const result = await loadSpec(OPENAPI_SPEC_PATH)
      const schemas = getSchemaDefinitions(result.spec)

      expect(schemas).toBeDefined()
      expect(typeof schemas).toBe('object')
      expect(schemas.User).toBeDefined()
      expect(schemas.Product).toBeDefined()
    })
  })

  describe('getResponseSchema', () => {
    it('should get response schema from OpenAPI 3.x', async () => {
      const { loadSpec, getResponseSchema } = await import('../src/runtime/server/utils/spec-loader')

      const result = await loadSpec(OPENAPI_SPEC_PATH)
      const paths = result.dereferenced.paths as Record<string, Record<string, unknown>>
      const getUsersOp = paths['/users']?.get as Record<string, unknown>
      const responses = getUsersOp?.responses as Record<string, Record<string, unknown>>

      const schema = getResponseSchema(responses, result.spec)

      expect(schema).toBeDefined()
    })

    it('should get response schema from Swagger 2.0', async () => {
      const { loadSpec, getResponseSchema } = await import('../src/runtime/server/utils/spec-loader')

      const result = await loadSpec(SWAGGER_SPEC_PATH)
      const paths = result.dereferenced.paths as Record<string, Record<string, unknown>>
      const getUsersOp = paths['/users']?.get as Record<string, unknown>
      const responses = getUsersOp?.responses as Record<string, Record<string, unknown>>

      const schema = getResponseSchema(responses, result.spec)

      expect(schema).toBeDefined()
    })

    it('should return undefined for 204 response', async () => {
      const { loadSpec, getResponseSchema } = await import('../src/runtime/server/utils/spec-loader')

      const result = await loadSpec(OPENAPI_SPEC_PATH)
      const paths = result.dereferenced.paths as Record<string, Record<string, unknown>>
      const deleteUserOp = paths['/users/{id}']?.delete as Record<string, unknown>
      const responses = deleteUserOp?.responses as Record<string, Record<string, unknown>>

      const schema = getResponseSchema(responses, result.spec)

      expect(schema).toBeUndefined()
    })
  })

  describe('getParameterSchema', () => {
    it('should get parameter schema from OpenAPI 3.x', async () => {
      const { getParameterSchema } = await import('../src/runtime/server/utils/spec-loader')

      const param = {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
      }

      const schema = getParameterSchema(param, { openapi: '3.0.0' })

      expect(schema).toEqual({ type: 'string' })
    })

    it('should get parameter schema from Swagger 2.0 (inline)', async () => {
      const { getParameterSchema } = await import('../src/runtime/server/utils/spec-loader')

      const param = {
        name: 'page',
        in: 'query',
        type: 'integer',
        default: 1,
      }

      const schema = getParameterSchema(param, { swagger: '2.0' })

      expect(schema.type).toBe('integer')
    })
  })

  describe('mergeParameters', () => {
    it('should merge path-level and operation-level parameters', async () => {
      const { mergeParameters } = await import('../src/runtime/server/utils/spec-loader')

      const pathParams = [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'version', in: 'query', schema: { type: 'string' } },
      ]

      const operationParams = [
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ]

      const merged = mergeParameters(pathParams, operationParams)

      expect(merged).toHaveLength(3)
      expect(merged.find(p => p.name === 'id')).toBeDefined()
      expect(merged.find(p => p.name === 'version')).toBeDefined()
      expect(merged.find(p => p.name === 'limit')).toBeDefined()
    })

    it('should override path-level param with operation-level param of same name', async () => {
      const { mergeParameters } = await import('../src/runtime/server/utils/spec-loader')

      const pathParams = [
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
      ]

      const operationParams = [
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
      ]

      const merged = mergeParameters(pathParams, operationParams)

      expect(merged).toHaveLength(1)
      expect(merged[0].schema.default).toBe(20)
    })
  })
})

describe('Spec Loader - Swagger 2.0 Specific', () => {
  describe('Swagger 2.0 Structure', () => {
    it('should have swagger field', async () => {
      const { loadSpec } = await import('../src/runtime/server/utils/spec-loader')

      const result = await loadSpec(SWAGGER_SPEC_PATH)
      const spec = result.spec as Record<string, unknown>

      expect(spec.swagger).toBe('2.0')
    })

    it('should have host and basePath', async () => {
      const { loadSpec } = await import('../src/runtime/server/utils/spec-loader')

      const result = await loadSpec(SWAGGER_SPEC_PATH)
      const spec = result.spec as Record<string, unknown>

      expect(spec.host).toBeDefined()
      expect(spec.basePath).toBeDefined()
    })

    it('should have definitions (not components.schemas)', async () => {
      const { loadSpec } = await import('../src/runtime/server/utils/spec-loader')

      const result = await loadSpec(SWAGGER_SPEC_PATH)
      const spec = result.spec as Record<string, unknown>

      expect(spec.definitions).toBeDefined()
      expect((spec as { components?: unknown }).components).toBeUndefined()
    })
  })

  describe('Swagger 2.0 Parameter Format', () => {
    it('should have inline type for query parameters', async () => {
      const { loadSpec } = await import('../src/runtime/server/utils/spec-loader')

      const result = await loadSpec(SWAGGER_SPEC_PATH)
      const paths = result.dereferenced.paths as Record<string, Record<string, unknown>>
      const getUsersOp = paths['/users']?.get as Record<string, unknown>
      const params = getUsersOp?.parameters as Array<Record<string, unknown>>

      const pageParam = params?.find(p => p.name === 'page')
      expect(pageParam?.type).toBe('integer')
      // Swagger 2.0 doesn't use schema wrapper for query params
      expect(pageParam?.schema).toBeUndefined()
    })

    it('should have body parameter for POST requests', async () => {
      const { loadSpec } = await import('../src/runtime/server/utils/spec-loader')

      const result = await loadSpec(SWAGGER_SPEC_PATH)
      const paths = result.dereferenced.paths as Record<string, Record<string, unknown>>
      const createUserOp = paths['/users']?.post as Record<string, unknown>
      const params = createUserOp?.parameters as Array<Record<string, unknown>>

      const bodyParam = params?.find(p => p.in === 'body')
      expect(bodyParam).toBeDefined()
      expect(bodyParam?.name).toBe('body')
      expect(bodyParam?.schema).toBeDefined()
    })
  })

  describe('Swagger 2.0 Response Format', () => {
    it('should have direct schema (not content.application/json.schema)', async () => {
      const { loadSpec } = await import('../src/runtime/server/utils/spec-loader')

      const result = await loadSpec(SWAGGER_SPEC_PATH)
      const paths = result.dereferenced.paths as Record<string, Record<string, unknown>>
      const getUsersOp = paths['/users']?.get as Record<string, unknown>
      const responses = getUsersOp?.responses as Record<string, Record<string, unknown>>
      const response200 = responses?.['200']

      // Swagger 2.0 uses direct schema
      expect(response200?.schema).toBeDefined()
      // Not wrapped in content.application/json
      expect(response200?.content).toBeUndefined()
    })
  })
})
