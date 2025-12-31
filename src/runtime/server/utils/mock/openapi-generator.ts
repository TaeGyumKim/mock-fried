/**
 * OpenAPI 스키마 기반 Mock 데이터 생성기
 * OpenAPI spec 파일의 스키마 정의를 기반으로 Mock 데이터 생성
 */
import { seededRandom } from './shared'

/**
 * $ref 참조를 해결하는 컨텍스트
 */
export interface SchemaContext {
  schemas?: Record<string, Record<string, unknown>>
  maxDepth?: number
  /** 현재 처리 중인 스키마 경로 (순환 참조 감지용) */
  _visitedRefs?: Set<string>
}

/**
 * $ref 경로에서 스키마 이름 추출
 * 예: '#/components/schemas/User' -> 'User'
 */
function extractRefName(ref: string): string {
  const parts = ref.split('/')
  return parts[parts.length - 1] || ''
}

/**
 * $ref 참조를 해결하여 실제 스키마 반환
 */
function resolveRef(
  schema: Record<string, unknown>,
  context: SchemaContext,
): Record<string, unknown> {
  const ref = schema.$ref as string | undefined
  if (!ref) return schema

  const schemaName = extractRefName(ref)
  const resolved = context.schemas?.[schemaName]
  if (!resolved) {
    // $ref 해결 실패 - 원본 스키마 반환 (호출자가 처리)
    return schema
  }

  return resolved
}

/**
 * OpenAPI 스키마에서 mock 값 생성
 * @param schema - OpenAPI 스키마
 * @param seed - 랜덤 시드
 * @param context - $ref 해결을 위한 컨텍스트
 * @param depth - 현재 재귀 깊이 (재귀 스키마 무한 루프 방지)
 * @param debugPath - 디버그용 경로 (개발 시에만 사용)
 */
export function generateMockFromSchema(
  schema: Record<string, unknown>,
  seed: number = 1,
  context: SchemaContext = {},
  depth: number = 0,
  debugPath: string = 'root',
): unknown {
  const maxDepth = context.maxDepth ?? 5
  const random = seededRandom(seed)

  // 재귀 깊이 제한 체크
  if (depth > maxDepth) {
    return null
  }

  // $ref 참조 해결
  if (schema.$ref) {
    const refPath = schema.$ref as string

    // 순환 참조 감지: 같은 깊이 레벨에서 같은 $ref를 다시 방문하면 중단
    const visitedRefs = context._visitedRefs ?? new Set<string>()
    const refKey = `${refPath}@${depth}`

    if (visitedRefs.has(refKey)) {
      // 순환 참조 감지됨 - 빈 배열 또는 null 반환
      return null
    }

    // 방문 기록 추가
    const newVisitedRefs = new Set(visitedRefs)
    newVisitedRefs.add(refKey)
    const newContext = { ...context, _visitedRefs: newVisitedRefs }

    const resolved = resolveRef(schema, context)
    if (resolved !== schema) {
      return generateMockFromSchema(resolved, seed, newContext, depth + 1, `${debugPath}->$ref`)
    }
    return null
  }

  const schemaType = schema.type as string | undefined

  // example이 있으면 우선 사용
  if (schema.example !== undefined) {
    return schema.example
  }

  // enum이 있으면 첫 번째 값 반환
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum[0]
  }

  // oneOf, anyOf, allOf 처리 (type과 함께 사용될 수 있으므로 먼저 체크)
  if (Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
    const index = Math.floor(random() * schema.oneOf.length)
    return generateMockFromSchema(
      schema.oneOf[index] as Record<string, unknown>,
      seed,
      context,
      depth + 1,
      `${debugPath}->oneOf[${index}]`,
    )
  }
  if (Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
    const index = Math.floor(random() * schema.anyOf.length)
    return generateMockFromSchema(
      schema.anyOf[index] as Record<string, unknown>,
      seed,
      context,
      depth + 1,
      `${debugPath}->anyOf[${index}]`,
    )
  }
  if (Array.isArray(schema.allOf) && schema.allOf.length > 0) {
    // allOf는 모든 스키마를 병합
    const merged: Record<string, unknown> = {}
    let propSeed = seed
    let idx = 0
    for (const subSchema of schema.allOf as Record<string, unknown>[]) {
      const generated = generateMockFromSchema(subSchema, propSeed++, context, depth + 1, `${debugPath}->allOf[${idx++}]`)
      if (typeof generated === 'object' && generated !== null) {
        Object.assign(merged, generated)
      }
    }
    return merged
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
        // 재귀 배열의 경우 아이템 수 제한
        const minItems = (schema.minItems as number) ?? 1
        const maxItems = (schema.maxItems as number) ?? (depth > 3 ? 1 : 3)
        const count = Math.floor(random() * (maxItems - minItems + 1)) + minItems
        return Array.from({ length: count }, (_, i) =>
          generateMockFromSchema(items, seed + i + 1, context, depth + 1, `${debugPath}[${i}]`),
        )
      }
      return []
    }

    case 'object':
    default: {
      // type이 없어도 properties가 있으면 object로 처리
      const properties = schema.properties as Record<string, Record<string, unknown>> | undefined
      if (properties) {
        const result: Record<string, unknown> = {}
        const required = (schema.required as string[]) ?? []
        let propSeed = seed
        for (const [propName, propSchema] of Object.entries(properties)) {
          // required가 아닌 필드도 대부분 포함 (80% 확률)
          if (!required.includes(propName) && random() < 0.2) {
            continue
          }
          result[propName] = generateMockFromSchema(propSchema, propSeed++, context, depth + 1, `${debugPath}.${propName}`)
        }
        return result
      }

      // additionalProperties 처리
      if (schema.additionalProperties) {
        const additionalProps = schema.additionalProperties as Record<string, unknown>
        if (typeof additionalProps === 'object') {
          // additionalProperties가 복잡한 스키마일 수 있음
          return {
            key1: generateMockFromSchema(additionalProps, seed, context, depth + 1, `${debugPath}.key1`),
            key2: generateMockFromSchema(additionalProps, seed + 1, context, depth + 1, `${debugPath}.key2`),
            key3: generateMockFromSchema(additionalProps, seed + 2, context, depth + 1, `${debugPath}.key3`),
          }
        }
        // additionalProperties: true 인 경우
        return {
          key1: 'value1',
          key2: 'value2',
        }
      }

      // type이 object이고 properties도 없는 경우
      if (schemaType === 'object') {
        return {}
      }

      return null
    }
  }
}
