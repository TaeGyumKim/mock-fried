/**
 * Protobuf Mock 데이터 생성기
 * Proto 메시지 타입에 기반한 Mock 데이터 생성
 */
import { hashString, seededRandom } from './shared'

/**
 * Proto 필드 타입에 따른 mock 값 생성
 */
export function generateMockValueForProtoField(
  fieldName: string,
  fieldType: string,
  seed: number = 1,
): unknown {
  const fieldSeed = hashString(fieldName) + seed
  const random = seededRandom(fieldSeed)

  switch (fieldType.toLowerCase()) {
    case 'string':
      return `${fieldName}_${Math.floor(random() * 1000)}`

    case 'int32':
    case 'sint32':
    case 'sfixed32':
      return Math.floor(random() * 10000)

    case 'int64':
    case 'sint64':
    case 'sfixed64':
      return String(Math.floor(random() * 10000000))

    case 'uint32':
    case 'fixed32':
      return Math.floor(random() * 10000)

    case 'uint64':
    case 'fixed64':
      return String(Math.floor(random() * 10000000))

    case 'float':
    case 'double':
      return Math.round(random() * 10000) / 100

    case 'bool':
      return random() > 0.5

    case 'bytes':
      return Buffer.from(`mock_bytes_${fieldSeed}`).toString('base64')

    default:
      return null
  }
}

/**
 * 재귀 생성 옵션
 */
export interface MockGenerationOptions {
  /** 현재 재귀 깊이 */
  depth?: number
  /** 최대 재귀 깊이 (기본: 3) */
  maxDepth?: number
  /** 방문한 타입 이름 Set (간접 재귀 감지) */
  visitedTypes?: Set<string>
  /** 현재 타입 이름 */
  typeName?: string
}

/**
 * Proto 메시지 타입에서 mock 객체 생성
 * 재귀적 타입 지원 (깊이 제한으로 무한 루프 방지)
 */
export function generateMockMessage(
  messageType: Record<string, unknown>,
  seed: number = 1,
  options: MockGenerationOptions = {},
): Record<string, unknown> {
  const {
    depth = 0,
    maxDepth = 3,
    visitedTypes = new Set<string>(),
    typeName,
  } = options

  // 깊이 제한 도달 시 빈 객체 반환
  if (depth >= maxDepth) {
    return {}
  }

  // 간접 재귀 감지: 이미 방문한 타입이면 빈 객체 반환
  if (typeName && visitedTypes.has(typeName)) {
    return {}
  }

  // 현재 타입을 방문 목록에 추가
  const newVisitedTypes = new Set(visitedTypes)
  if (typeName) {
    newVisitedTypes.add(typeName)
  }

  const result: Record<string, unknown> = {}

  // proto-loader가 로드한 타입 정의에서 필드 정보 추출
  const fields = (messageType as { fields?: Record<string, unknown> }).fields || {}

  let currentSeed = seed
  for (const [fieldName, fieldDef] of Object.entries(fields)) {
    const field = fieldDef as {
      type?: string
      rule?: string
      resolvedType?: Record<string, unknown>
      keyType?: string
      typeName?: string
    }

    let value: unknown

    // 중첩 메시지 타입 처리
    if (field.resolvedType && typeof field.resolvedType === 'object') {
      const resolvedType = field.resolvedType as {
        fields?: Record<string, unknown>
        values?: Record<string, unknown>
        name?: string
      }

      if (resolvedType.values) {
        // Enum 타입: seed 기반으로 값 선택
        const enumValues = Object.keys(resolvedType.values)
        const random = seededRandom(currentSeed)
        const index = Math.floor(random() * enumValues.length)
        value = enumValues[index] || 'UNKNOWN'
      }
      else if (resolvedType.fields) {
        // 중첩 메시지: 재귀 호출 (깊이 증가)
        const nestedTypeName = resolvedType.name || field.typeName || fieldName
        value = generateMockMessage(resolvedType, currentSeed, {
          depth: depth + 1,
          maxDepth,
          visitedTypes: newVisitedTypes,
          typeName: nestedTypeName,
        })
      }
    }
    else {
      // 기본 타입
      value = generateMockValueForProtoField(fieldName, field.type || 'string', currentSeed)
    }

    // repeated 필드 처리
    if (field.rule === 'repeated') {
      // 재귀 타입의 repeated는 깊이에 따라 아이템 수 조절
      if (depth < maxDepth - 1 && value && typeof value === 'object') {
        // 깊이가 낮을수록 더 많은 아이템 생성 (1~3개)
        const itemCount = Math.max(1, 3 - depth)
        const items = [value]
        for (let i = 1; i < itemCount; i++) {
          if (field.resolvedType) {
            const resolvedType = field.resolvedType as { fields?: Record<string, unknown>, name?: string }
            if (resolvedType.fields) {
              items.push(generateMockMessage(resolvedType, currentSeed + i * 100, {
                depth: depth + 1,
                maxDepth,
                visitedTypes: newVisitedTypes,
                typeName: resolvedType.name || field.typeName || fieldName,
              }))
            }
          }
        }
        value = items
      }
      else {
        value = value !== null && value !== undefined ? [value] : []
      }
    }

    // map 필드 처리
    if (field.keyType) {
      const keyValue = field.keyType === 'string' ? `key_${currentSeed}` : currentSeed
      value = { [keyValue as string | number]: value }
    }

    result[fieldName] = value
    currentSeed++
  }

  return result
}

/**
 * 요청 객체에서 seed 추출
 */
export function deriveSeedFromRequest(request: unknown): number {
  if (!request) return 42

  const str = JSON.stringify(request)
  return hashString(str) || 42
}
