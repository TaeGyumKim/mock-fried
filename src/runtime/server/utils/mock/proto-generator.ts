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
 * Proto 메시지 타입에서 mock 객체 생성
 */
export function generateMockMessage(
  messageType: Record<string, unknown>,
  seed: number = 1,
): Record<string, unknown> {
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
    }

    let value: unknown

    // 중첩 메시지 타입 처리
    if (field.resolvedType && typeof field.resolvedType === 'object') {
      const resolvedType = field.resolvedType as { fields?: Record<string, unknown>, values?: Record<string, unknown> }

      if (resolvedType.values) {
        // Enum 타입: 첫 번째 값 선택
        const enumValues = Object.keys(resolvedType.values)
        value = enumValues[0] || 'UNKNOWN'
      }
      else if (resolvedType.fields) {
        // 중첩 메시지: 재귀 호출
        value = generateMockMessage(resolvedType, currentSeed)
      }
    }
    else {
      // 기본 타입
      value = generateMockValueForProtoField(fieldName, field.type || 'string', currentSeed)
    }

    // repeated 필드 처리
    if (field.rule === 'repeated') {
      value = [value]
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
