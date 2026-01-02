import { describe, it, expect } from 'vitest'
import { OpenAPIItemProvider } from '../src/runtime/server/utils/mock/providers/openapi-item-provider'
import type { SchemaContext } from '../src/runtime/server/utils/mock/openapi-generator'
import type { OpenAPISchema } from '../src/runtime/server/utils/mock/providers/openapi-item-provider'

describe('OpenAPIItemProvider', () => {
  it('resolves $ref schemas for id field and item generation', () => {
    const schemas: Record<string, Record<string, unknown>> = {
      User: {
        type: 'object',
        required: ['userId', 'name'],
        properties: {
          userId: { type: 'string' },
          name: { type: 'string' },
        },
      },
    }

    const schemaContext: SchemaContext = { schemas }
    const itemSchema: OpenAPISchema = { $ref: '#/components/schemas/User' }

    const provider = new OpenAPIItemProvider(itemSchema, { schemaContext })
    const item = provider.generateItemWithId('user-1', 0, 'seed')

    expect(item.userId).toBe('user-1')
    expect(typeof item.name).toBe('string')
    expect(item.id).toBeUndefined()
  })
})
