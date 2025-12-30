/**
 * 결정론적 Mock 데이터 생성 유틸리티
 * 같은 입력에 대해 항상 같은 출력을 반환
 */
import type { ParsedModelSchema, ParsedModelField } from '../../../types'

/**
 * 문자열에서 해시값 생성
 */
export function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 32비트 정수로 변환
  }
  return Math.abs(hash)
}

/**
 * seed 기반으로 결정론적 난수 생성 (간단한 LCG)
 */
export function seededRandom(seed: number): () => number {
  let currentSeed = seed
  return () => {
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7FFFFFFF
    return currentSeed / 0x7FFFFFFF
  }
}

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
        const itemValue = generateMockFromSchema(items, seed + 1)
        return [itemValue]
      }
      return []
    }

    case 'object': {
      const properties = schema.properties as Record<string, Record<string, unknown>> | undefined
      if (properties) {
        const result: Record<string, unknown> = {}
        let propSeed = seed
        for (const [propName, propSchema] of Object.entries(properties)) {
          result[propName] = generateMockFromSchema(propSchema, propSeed++)
        }
        return result
      }
      return {}
    }

    default:
      return null
  }
}

// ============================================
// 스키마 기반 Mock 데이터 생성기 (Client Package용)
// ============================================

/**
 * 시드 기반 난수 생성기 클래스
 */
class SeededRandom {
  private seed: number

  constructor(seed: number | string) {
    this.seed = typeof seed === 'string' ? hashString(seed) : seed
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7FFFFFFF
    return this.seed / 0x7FFFFFFF
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)]!
  }
}

/**
 * 필드명 기반 Mock 값 추론
 */
function inferValueByFieldName(
  fieldName: string,
  rng: SeededRandom,
  index: number = 0,
): unknown {
  const name = fieldName.toLowerCase()

  // ID 관련
  if (name === 'id' || name.endsWith('id')) {
    if (name === 'id') return `id-${index + 1}`
    return `${fieldName}-${rng.nextInt(1000, 9999)}`
  }

  // 이메일
  if (name.includes('email') || name.includes('mail')) {
    const domains = ['example.com', 'test.com', 'mock.io']
    const names = ['user', 'test', 'mock', 'admin']
    return `${rng.pick(names)}${rng.nextInt(1, 999)}@${rng.pick(domains)}`
  }

  // 이름
  if (name === 'name' || name.includes('username')) {
    const firstNames = ['김철수', '이영희', '박민수', 'John', 'Jane', 'Mike']
    return rng.pick(firstNames)
  }

  // 전화번호
  if (name.includes('phone') || name.includes('mobile')) {
    return `010-${rng.nextInt(1000, 9999)}-${rng.nextInt(1000, 9999)}`
  }

  // URL
  if (name.includes('url') || name.includes('link')) {
    return `https://example.com/${fieldName}/${rng.nextInt(1, 1000)}`
  }

  // 이미지
  if (name.includes('image') || name.includes('avatar') || name.includes('photo')) {
    return `https://picsum.photos/seed/${rng.nextInt(1, 1000)}/200/200`
  }

  // 날짜/시간
  if (name.includes('date') || name.endsWith('at') || name.includes('time')) {
    const now = Date.now()
    const offset = rng.nextInt(-365, 30) * 24 * 60 * 60 * 1000
    return new Date(now + offset).toISOString()
  }

  // 설명/내용
  if (name.includes('description') || name.includes('content') || name.includes('body')) {
    return `Mock ${fieldName} 데이터 #${rng.nextInt(1, 100)}`
  }

  // 제목
  if (name.includes('title') || name.includes('subject')) {
    return `샘플 ${fieldName} #${rng.nextInt(1, 100)}`
  }

  // 상태
  if (name.includes('status')) {
    return rng.pick(['ACTIVE', 'INACTIVE', 'PENDING', 'COMPLETED'])
  }

  // 카운트/수량
  if (name.includes('count') || name.includes('quantity') || name.includes('amount')) {
    return rng.nextInt(0, 100)
  }

  // 가격
  if (name.includes('price') || name.includes('cost')) {
    return rng.nextInt(1000, 100000)
  }

  // 페이지네이션
  if (name === 'page') return 1
  if (name === 'limit' || name === 'size') return 20
  if (name === 'total' || name === 'totalcount') return rng.nextInt(50, 500)
  if (name === 'totalpages') return rng.nextInt(3, 25)

  // boolean
  if (name.startsWith('is') || name.startsWith('has') || name.startsWith('can')) {
    return rng.next() > 0.5
  }

  return null
}

/**
 * TypeScript 타입에 따른 기본값 생성
 */
function generateValueByType(
  type: string,
  fieldName: string,
  rng: SeededRandom,
  index: number = 0,
): unknown {
  // 1. 필드명 기반 추론 시도
  const inferred = inferValueByFieldName(fieldName, rng, index)
  if (inferred !== null) return inferred

  // 2. 타입 기반 생성
  switch (type.toLowerCase()) {
    case 'string':
      return `mock-${fieldName}-${rng.nextInt(1, 1000)}`
    case 'number':
    case 'int':
    case 'integer':
      return rng.nextInt(1, 1000)
    case 'boolean':
    case 'bool':
      return rng.next() > 0.5
    case 'date':
      return new Date().toISOString()
    case 'unknown':
    case 'any':
    case 'object':
      // unknown/any/object 타입은 필드명 기반으로 타입 추측
      return inferTypeFromFieldName(fieldName, rng, index)
    default:
      // enum 타입이거나 알 수 없는 타입
      return `mock-${fieldName}-${rng.nextInt(1, 1000)}`
  }
}

/**
 * 필드명에서 타입을 추측하여 적절한 값 생성
 */
function inferTypeFromFieldName(
  fieldName: string,
  rng: SeededRandom,
  _index: number,
): unknown {
  const name = fieldName.toLowerCase()

  // 숫자 관련
  if (name.includes('count') || name.includes('num') || name.includes('amount')
    || name.includes('size') || name.includes('total') || name.includes('views')
    || name.includes('likes') || name.includes('price') || name.includes('age')
    || name.includes('quantity') || name.includes('index') || name.includes('order')) {
    return rng.nextInt(0, 1000)
  }

  // boolean 관련
  if (name.startsWith('is') || name.startsWith('has') || name.startsWith('can')
    || name.startsWith('should') || name.startsWith('will') || name.includes('enabled')
    || name.includes('active') || name.includes('visible') || name.includes('valid')) {
    return rng.next() > 0.5
  }

  // 날짜 관련
  if (name.includes('date') || name.endsWith('at') || name.includes('time')
    || name.includes('created') || name.includes('updated') || name.includes('modified')) {
    const now = Date.now()
    const offset = rng.nextInt(-365, 30) * 24 * 60 * 60 * 1000
    return new Date(now + offset).toISOString()
  }

  // ID 관련
  if (name === 'id' || name.endsWith('id') || name.endsWith('uuid')) {
    return `${fieldName}-${rng.nextInt(1000, 9999)}`
  }

  // URL 관련
  if (name.includes('url') || name.includes('link') || name.includes('href')) {
    return `https://example.com/${fieldName}/${rng.nextInt(1, 1000)}`
  }

  // 이미지 관련
  if (name.includes('image') || name.includes('thumbnail') || name.includes('avatar')
    || name.includes('photo') || name.includes('picture')) {
    return `https://picsum.photos/seed/${rng.nextInt(1, 1000)}/200/200`
  }

  // 기본값: 문자열
  return `mock-${fieldName}-${rng.nextInt(1, 1000)}`
}

/**
 * 스키마 기반 Mock 데이터 생성기 클래스
 */
export class SchemaMockGenerator {
  private models: Map<string, ParsedModelSchema>
  private dataStore: Map<string, unknown[]> = new Map()

  constructor(models: Map<string, ParsedModelSchema>) {
    this.models = models
  }

  /**
   * 모델 스키마 기반 단일 객체 생성
   */
  generateOne(modelName: string, seed?: string | number, index: number = 0): Record<string, unknown> {
    const schema = this.models.get(modelName)
    if (!schema) {
      return {}
    }

    // enum인 경우
    if (schema.enumValues && schema.enumValues.length > 0) {
      const rng = new SeededRandom(seed ?? modelName)
      return { value: rng.pick(schema.enumValues) }
    }

    const rng = new SeededRandom(seed ?? `${modelName}-${index}`)
    const result: Record<string, unknown> = {}

    for (const field of schema.fields) {
      const value = this.generateField(field, rng, index)
      if (value !== undefined) {
        // Use jsonKey for the actual JSON output, fallback to name
        const outputKey = field.jsonKey || field.name
        result[outputKey] = value
      }
    }

    return result
  }

  /**
   * 필드 값 생성
   */
  private generateField(field: ParsedModelField, rng: SeededRandom, index: number): unknown {
    // optional이고 70% 확률로 undefined가 아님
    if (!field.required && rng.next() > 0.7) {
      return undefined
    }

    // 참조 타입인 경우
    if (field.refType) {
      const refSchema = this.models.get(field.refType)

      // enum 참조
      if (refSchema?.enumValues) {
        const value = rng.pick(refSchema.enumValues)
        return field.isArray ? [value] : value
      }

      // 객체 참조
      if (field.isArray) {
        const count = rng.nextInt(1, 3)
        return Array.from({ length: count }, (_, i) =>
          this.generateOne(field.refType!, `${field.refType}-${index}-${i}`, i),
        )
      }

      return this.generateOne(field.refType, `${field.refType}-${index}`, index)
    }

    // 배열인 경우
    if (field.isArray) {
      const count = rng.nextInt(1, 5)
      return Array.from({ length: count }, (_, i) =>
        generateValueByType(field.type, field.name, rng, i),
      )
    }

    return generateValueByType(field.type, field.name, rng, index)
  }

  /**
   * 리스트 데이터 생성 (캐시 지원 - Pagination)
   */
  generateList(
    modelName: string,
    options: {
      page?: number
      limit?: number
      total?: number
      seed?: string
    } = {},
  ): {
    items: Record<string, unknown>[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  } {
    const { page = 1, limit = 20, total = 100, seed = modelName } = options
    const cacheKey = `${modelName}-${seed}`

    let allItems = this.dataStore.get(cacheKey) as Record<string, unknown>[] | undefined

    if (!allItems || allItems.length < total) {
      allItems = Array.from({ length: total }, (_, i) =>
        this.generateOne(modelName, `${seed}-${i}`, i),
      )
      this.dataStore.set(cacheKey, allItems)
    }

    const startIndex = (page - 1) * limit
    const endIndex = Math.min(startIndex + limit, total)
    const items = allItems.slice(startIndex, endIndex)

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * 커서 기반 리스트 생성 (무한 스크롤용)
   */
  generateCursorList(
    modelName: string,
    options: {
      cursor?: string
      limit?: number
      total?: number
      seed?: string
    } = {},
  ): {
    items: Record<string, unknown>[]
    nextCursor?: string
    prevCursor?: string
    hasMore: boolean
  } {
    const { cursor, limit = 20, total = 100, seed = modelName } = options
    const cacheKey = `${modelName}-${seed}`

    let allItems = this.dataStore.get(cacheKey) as Record<string, unknown>[] | undefined

    if (!allItems || allItems.length < total) {
      allItems = Array.from({ length: total }, (_, i) =>
        this.generateOne(modelName, `${seed}-${i}`, i),
      )
      this.dataStore.set(cacheKey, allItems)
    }

    // 커서 파싱 (base64 encoded index)
    let startIndex = 0
    if (cursor) {
      try {
        startIndex = Number.parseInt(Buffer.from(cursor, 'base64').toString('utf-8'), 10)
      }
      catch {
        startIndex = 0
      }
    }

    const endIndex = Math.min(startIndex + limit, total)
    const items = allItems.slice(startIndex, endIndex)
    const hasMore = endIndex < total

    return {
      items,
      nextCursor: hasMore ? Buffer.from(String(endIndex)).toString('base64') : undefined,
      prevCursor: startIndex > 0 ? Buffer.from(String(Math.max(0, startIndex - limit))).toString('base64') : undefined,
      hasMore,
    }
  }

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.dataStore.clear()
  }
}

/**
 * 응답 타입 분석 결과
 */
export interface ResponseTypeInfo {
  /** 실제 데이터 모델명 */
  modelName: string
  /** 리스트 응답 여부 */
  isList: boolean
  /** 배열 필드명 (posts, items, comments 등) - 응답 구조 생성시 사용 */
  listFieldName?: string
  /** 래퍼 응답 타입인 경우 원본 타입명 */
  wrapperType?: string
}

/**
 * 응답 타입에서 실제 데이터 모델명 추출
 * 다양한 배열 필드명을 지원 (items, data, posts, comments 등)
 */
export function extractDataModelName(
  responseType: string,
  models: Map<string, ParsedModelSchema>,
): ResponseTypeInfo {
  // 직접 배열 타입 처리: Array<Type> 또는 Type[]
  const arrayMatch = responseType.match(/^Array<(.+)>$/) || responseType.match(/^(.+)\[\]$/)
  if (arrayMatch) {
    const innerType = arrayMatch[1]!.trim()
    return {
      modelName: innerType,
      isList: true,
      // listFieldName이 없으면 직접 배열 반환 (wrapper 없음)
      listFieldName: undefined,
      wrapperType: undefined,
    }
  }

  const schema = models.get(responseType)

  if (schema) {
    // 배열 필드 우선순위: items > data > posts > comments > 기타 배열 필드
    const priorityFields = ['items', 'data', 'posts', 'comments']

    // 우선순위 필드 먼저 확인
    for (const fieldName of priorityFields) {
      const field = schema.fields.find(f => f.name === fieldName && f.isArray)
      if (field && field.refType) {
        return {
          modelName: field.refType,
          isList: true,
          listFieldName: fieldName,
          wrapperType: responseType,
        }
      }
    }

    // 우선순위에 없는 배열 필드 확인
    const arrayField = schema.fields.find(f => f.isArray && f.refType)
    if (arrayField && arrayField.refType) {
      return {
        modelName: arrayField.refType,
        isList: true,
        listFieldName: arrayField.name,
        wrapperType: responseType,
      }
    }

    // 단일 참조 필드 확인 (data 필드가 객체인 경우)
    const dataField = schema.fields.find(f => f.name === 'data' && !f.isArray)
    if (dataField?.refType) {
      return {
        modelName: dataField.refType,
        isList: false,
        wrapperType: responseType,
      }
    }
  }

  return { modelName: responseType, isList: false }
}
