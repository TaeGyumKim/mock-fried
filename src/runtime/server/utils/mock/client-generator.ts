/**
 * Client Package Mock 데이터 생성기
 * OpenAPI Generator로 생성된 TypeScript 클라이언트 패키지 기반 Mock 생성
 */
import type { ParsedModelSchema, ParsedModelField, MockIdConfig } from '../../../../types'
import { hashString, SeededRandom, isIdField, generateIdValue, DEFAULT_ID_CONFIG } from './shared'

/**
 * 필드명 기반 Mock 값 추론
 */
export function inferValueByFieldName(
  fieldName: string,
  rng: SeededRandom,
  index: number = 0,
  idConfig: MockIdConfig = DEFAULT_ID_CONFIG,
): unknown {
  const name = fieldName.toLowerCase()

  // ID 관련 - MockIdConfig 사용
  if (isIdField(fieldName, idConfig)) {
    return generateIdValue(fieldName, index, rng.hashId(16), idConfig)
  }

  // 이메일
  if (name.includes('email') || name.includes('mail')) {
    const domains = ['example.com', 'test.com', 'mock.io']
    const names = ['user', 'test', 'mock', 'admin']
    return `${rng.pick(names)}${rng.nextInt(1, 999)}@${rng.pick(domains)}`
  }

  // 이름
  if (name === 'name' || name.includes('username') || name.includes('firstname') || name.includes('lastname')) {
    const firstNames = ['김철수', '이영희', '박민수', 'John', 'Jane', 'Mike', 'Sarah', 'Alex']
    return rng.pick(firstNames)
  }

  // 전화번호
  if (name.includes('phone') || name.includes('mobile') || name.includes('tel')) {
    return `010-${rng.nextInt(1000, 9999)}-${rng.nextInt(1000, 9999)}`
  }

  // URL
  if (name.includes('url') || name.includes('link') || name.includes('href')) {
    return `https://example.com/${fieldName}/${rng.nextInt(1, 1000)}`
  }

  // 이미지
  if (name.includes('image') || name.includes('avatar') || name.includes('photo') || name.includes('thumbnail') || name.includes('picture')) {
    return `https://picsum.photos/seed/${rng.nextInt(1, 1000)}/200/200`
  }

  // 날짜/시간
  if (name.includes('date') || name.endsWith('at') || name.includes('time') || name.includes('created') || name.includes('updated')) {
    const now = Date.now()
    const offset = rng.nextInt(-365, 30) * 24 * 60 * 60 * 1000
    return new Date(now + offset).toISOString()
  }

  // 설명/내용
  if (name.includes('description') || name.includes('content') || name.includes('body') || name.includes('text')) {
    return `Mock ${fieldName} 데이터 #${rng.nextInt(1, 100)}`
  }

  // 제목
  if (name.includes('title') || name.includes('subject') || name.includes('headline')) {
    return `샘플 ${fieldName} #${rng.nextInt(1, 100)}`
  }

  // 상태
  if (name.includes('status')) {
    return rng.pick(['ACTIVE', 'INACTIVE', 'PENDING', 'COMPLETED'])
  }

  // 카운트/수량
  if (name.includes('count') || name.includes('quantity') || name.includes('amount') || name.includes('num')) {
    return rng.nextInt(0, 100)
  }

  // 가격
  if (name.includes('price') || name.includes('cost') || name.includes('fee') || name.includes('amount')) {
    return rng.nextInt(1000, 100000)
  }

  // 페이지네이션
  if (name === 'page') return 1
  if (name === 'limit' || name === 'size' || name === 'pagesize') return 20
  if (name === 'total' || name === 'totalcount' || name === 'totalitems') return rng.nextInt(50, 500)
  if (name === 'totalpages') return rng.nextInt(3, 25)

  // boolean
  if (name.startsWith('is') || name.startsWith('has') || name.startsWith('can') || name.startsWith('should') || name.startsWith('will')) {
    return rng.next() > 0.5
  }

  // 주소 관련
  if (name.includes('address') || name.includes('street')) {
    return `서울시 강남구 테헤란로 ${rng.nextInt(1, 500)}번길`
  }

  if (name.includes('city')) {
    return rng.pick(['서울', '부산', '대구', '인천', '광주', '대전'])
  }

  if (name.includes('country')) {
    return rng.pick(['KR', 'US', 'JP', 'CN'])
  }

  if (name.includes('zipcode') || name.includes('postal')) {
    return `${rng.nextInt(10000, 99999)}`
  }

  // 기타 일반적인 필드들
  if (name.includes('code')) {
    return `CODE-${rng.nextInt(1000, 9999)}`
  }

  if (name.includes('type') || name.includes('category')) {
    return rng.pick(['TYPE_A', 'TYPE_B', 'TYPE_C'])
  }

  if (name.includes('version')) {
    return `${rng.nextInt(1, 10)}.${rng.nextInt(0, 9)}.${rng.nextInt(0, 99)}`
  }

  if (name.includes('token') || name.includes('key') || name.includes('secret')) {
    return rng.uuid()
  }

  return null
}

/**
 * TypeScript 타입에 따른 기본값 생성
 */
export function generateValueByType(
  type: string,
  fieldName: string,
  rng: SeededRandom,
  index: number = 0,
  idConfig: MockIdConfig = DEFAULT_ID_CONFIG,
): unknown {
  // 1. 필드명 기반 추론 시도
  const inferred = inferValueByFieldName(fieldName, rng, index, idConfig)
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
      return inferTypeFromFieldName(fieldName, rng, index, idConfig)
    default:
      // enum 타입이거나 알 수 없는 타입
      return `mock-${fieldName}-${rng.nextInt(1, 1000)}`
  }
}

/**
 * 필드명에서 타입을 추측하여 적절한 값 생성
 */
export function inferTypeFromFieldName(
  fieldName: string,
  rng: SeededRandom,
  index: number,
  idConfig: MockIdConfig = DEFAULT_ID_CONFIG,
): unknown {
  const name = fieldName.toLowerCase()

  // ID 관련 - MockIdConfig 사용 (먼저 체크)
  if (isIdField(fieldName, idConfig)) {
    return generateIdValue(fieldName, index, rng.hashId(16), idConfig)
  }

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
    const priorityFields = ['items', 'data', 'posts', 'comments', 'results', 'records', 'list']

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

/**
 * 스키마 기반 Mock 데이터 생성기 클래스
 */
export class SchemaMockGenerator {
  private models: Map<string, ParsedModelSchema>
  private dataStore: Map<string, unknown[]> = new Map()
  private idConfig: MockIdConfig

  constructor(models: Map<string, ParsedModelSchema>, idConfig: MockIdConfig = DEFAULT_ID_CONFIG) {
    this.models = models
    this.idConfig = idConfig
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
   * ID 부여된 단일 객체 생성 (Pagination용)
   * 주어진 ID를 모델의 ID 필드에 설정하여 cursor와 응답 ID가 일치하도록 함
   */
  generateOneWithId(modelName: string, itemId: string, seed?: string | number, index: number = 0): Record<string, unknown> {
    const item = this.generateOne(modelName, seed ?? `${modelName}-${itemId}`, index)

    // ID 필드 찾기 및 주어진 ID로 덮어쓰기
    const idFieldName = this.findIdFieldName(modelName)
    if (idFieldName) {
      const outputKey = this.getOutputKey(modelName, idFieldName)
      item[outputKey] = itemId
    }
    else if (!('id' in item)) {
      // ID 필드를 찾지 못했고 'id' 키도 없으면 추가
      item.id = itemId
    }
    else {
      // 기존 'id' 키가 있으면 덮어쓰기
      item.id = itemId
    }

    return item
  }

  /**
   * 모델의 ID 필드명 찾기 (MockIdConfig 기반)
   */
  private findIdFieldName(modelName: string): string | null {
    const schema = this.models.get(modelName)
    if (!schema) return null

    // MockIdConfig 기반으로 ID 필드 찾기
    for (const field of schema.fields) {
      if (isIdField(field.name, this.idConfig)) {
        return field.name
      }
    }

    return null
  }

  /**
   * 필드의 출력 키 가져오기 (jsonKey 또는 name)
   */
  private getOutputKey(modelName: string, fieldName: string): string {
    const schema = this.models.get(modelName)
    if (!schema) return fieldName

    const field = schema.fields.find(f => f.name === fieldName)
    return field?.jsonKey || fieldName
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
        generateValueByType(field.type, field.name, rng, i, this.idConfig),
      )
    }

    return generateValueByType(field.type, field.name, rng, index, this.idConfig)
  }

  /**
   * 리스트 데이터 생성 (캐시 지원 - Pagination)
   * @deprecated Use pagination/page-manager.ts instead for enhanced pagination
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
   * @deprecated Use pagination/cursor-manager.ts instead for enhanced pagination
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
   * 모델 가져오기
   */
  getModels(): Map<string, ParsedModelSchema> {
    return this.models
  }

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.dataStore.clear()
  }
}

// Re-export for convenience
export { SeededRandom, hashString }
