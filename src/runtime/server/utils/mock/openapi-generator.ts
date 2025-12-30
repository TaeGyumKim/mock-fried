/**
 * OpenAPI 스키마 기반 Mock 데이터 생성기
 * OpenAPI spec 파일의 스키마 정의를 기반으로 Mock 데이터 생성
 */
import { seededRandom } from './shared'

/**
 * OpenAPI 스키마에서 mock 값 생성
 */
export function generateMockFromSchema(
  schema: Record<string, unknown>,
  seed: number = 1,
): unknown {
  const random = seededRandom(seed)
  const schemaType = schema.type as string | undefined

  // example이 있으면 우선 사용
  if (schema.example !== undefined) {
    return schema.example
  }

  // enum이 있으면 첫 번째 값 반환
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum[0]
  }

  switch (schemaType) {
    case 'string': {
      const format = schema.format as string | undefined
      if (format === 'date') {
        return '2024-01-15'
      }
      if (format === 'date-time') {
        return '2024-01-15T10:30:00Z'
      }
      if (format === 'email') {
        return `user${Math.floor(random() * 1000)}@example.com`
      }
      if (format === 'uuid') {
        return '550e8400-e29b-41d4-a716-446655440000'
      }
      if (format === 'uri' || format === 'url') {
        return `https://example.com/resource/${Math.floor(random() * 1000)}`
      }
      if (format === 'hostname') {
        return 'example.com'
      }
      if (format === 'ipv4') {
        return `192.168.${Math.floor(random() * 256)}.${Math.floor(random() * 256)}`
      }
      if (format === 'ipv6') {
        return '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
      }
      if (format === 'byte') {
        return Buffer.from(`mock_${seed}`).toString('base64')
      }
      if (format === 'binary') {
        return `binary_data_${seed}`
      }
      if (format === 'password') {
        return '********'
      }
      return `mock_string_${Math.floor(random() * 1000)}`
    }

    case 'integer':
    case 'number': {
      const min = (schema.minimum as number) ?? 0
      const max = (schema.maximum as number) ?? 1000
      const value = min + random() * (max - min)
      return schemaType === 'integer' ? Math.floor(value) : Math.round(value * 100) / 100
    }

    case 'boolean':
      return random() > 0.5

    case 'array': {
      const items = schema.items as Record<string, unknown> | undefined
      if (items) {
        const minItems = (schema.minItems as number) ?? 1
        const maxItems = (schema.maxItems as number) ?? 3
        const count = Math.floor(random() * (maxItems - minItems + 1)) + minItems
        return Array.from({ length: count }, (_, i) =>
          generateMockFromSchema(items, seed + i + 1),
        )
      }
      return []
    }

    case 'object': {
      const properties = schema.properties as Record<string, Record<string, unknown>> | undefined
      if (properties) {
        const result: Record<string, unknown> = {}
        const required = (schema.required as string[]) ?? []
        let propSeed = seed
        for (const [propName, propSchema] of Object.entries(properties)) {
          // required가 아닌 필드는 50% 확률로 생략
          if (!required.includes(propName) && random() < 0.5) {
            continue
          }
          result[propName] = generateMockFromSchema(propSchema, propSeed++)
        }
        return result
      }
      // additionalProperties 처리
      if (schema.additionalProperties) {
        const additionalProps = schema.additionalProperties as Record<string, unknown>
        if (typeof additionalProps === 'object') {
          return {
            [`key_${seed}`]: generateMockFromSchema(additionalProps, seed + 1),
          }
        }
      }
      return {}
    }

    // oneOf, anyOf, allOf 처리
    default: {
      if (Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
        const index = Math.floor(random() * schema.oneOf.length)
        return generateMockFromSchema(schema.oneOf[index] as Record<string, unknown>, seed)
      }
      if (Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
        const index = Math.floor(random() * schema.anyOf.length)
        return generateMockFromSchema(schema.anyOf[index] as Record<string, unknown>, seed)
      }
      if (Array.isArray(schema.allOf) && schema.allOf.length > 0) {
        // allOf는 모든 스키마를 병합
        const merged: Record<string, unknown> = {}
        for (const subSchema of schema.allOf as Record<string, unknown>[]) {
          const generated = generateMockFromSchema(subSchema, seed)
          if (typeof generated === 'object' && generated !== null) {
            Object.assign(merged, generated)
          }
        }
        return merged
      }
      return null
    }
  }
}
